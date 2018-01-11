'use strict';
/**
 * Step 3
 * - Add Bcrypt to hash password before saving
 * - Add Bcrypt to validate passwords when comparing
 */

const express = require('express');

const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcryptjs');

const { PORT, DATABASE_URL } = require('./config');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express();
app.use(express.static('public'));
app.use(express.json());

// ===== Define UserSchema & UserModel =====
const UserSchema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

UserSchema.methods.serialize = function () {
  return {
    id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName
  };
};

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

var UserModel = mongoose.model('User', UserSchema);

// ===== Define and create basicStrategy =====
const localStrategy = new LocalStrategy((username, password, done) => {
  let user;
  UserModel
    .findOne({ username })
    .then(results => {
      user = results;

      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username',
          location: 'username'
        });
      }

      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect password',
          location: 'password'
        });
      }
      return done(null, user);
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return done(null, false);
      }

      return done(err);

    });
});

passport.use(localStrategy);

const localAuth = passport.authenticate('local', { session: false });

// ===== Protected endpoint =====
app.post('/api/secret', localAuth, function (req, res) {
  console.log(`${req.user.username} successfully logged in.`);
  res.json({ message: 'Rosebud' });
});

// ===== Public endpoint =====
app.get('/api/public', function (req, res) {
  res.send('Hello World!');
});

// ===== Post '/users' endpoint to save a new User =====
// NOTE: validation and some error handling removed for brevity
app.post('/api/users', function (req, res) {
  // NOTE: validation removed for brevity
  let { username, password, firstName, lastName } = req.body;

  return UserModel
    .find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // if no existing user, hash password
      return UserModel.hashPassword(password);
    })
    .then(digest => {
      return UserModel
        .create({
          username,
          password: digest,
          firstName,
          lastName
        });
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});

app.get('/:id', (req, res) => {
  return UserModel.findById(req.params.id)
    .then(user => res.json(user.apiRepr()))
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

mongoose.connect(DATABASE_URL, { useMongoClient: true })
  .then(() => {
    app.listen(PORT, function () {
      console.log(`app listening on port ${this.address().port}`);
    });
  }); 