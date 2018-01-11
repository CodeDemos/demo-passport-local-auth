'use strict';
/**
 * Step 2
 * - Create User with plain-text UN/PW and store in DB
 * - Update Basic Strategy to finduser and compare
 */

const express = require('express');

const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

const {PORT, DATABASE_URL} = require('./config');

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

UserSchema.methods.apiRepr = function () {
  return {
    id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName
  };
};

UserSchema.methods.validatePassword = function (password) {
  return password === this.password;
};

const UserModel = mongoose.model('User', UserSchema);

// ===== Define and create basicStrategy =====
const localStrategy = new LocalStrategy((username, password, done) => {
  UserModel
    .findOne({ username })
    .then(user => {
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username',
          location: 'username'
        });
      }

      const isValid = user.validatePassword(password);
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect password',
          location: 'password'
        });
      }

      return done(null, user);

    }).catch(err => {
      if (err.reason === 'LoginError') {
        return done(null, false);
      }
      return done(err);
    });
});

passport.use(localStrategy);
const localAuth = passport.authenticate('local', { session: false });

// ===== Protected endpoint =====
app.post('/api/protected', localAuth, function (req, res) {
  console.log(`${req.user.username} successfully logged in.`);
  res.json(req.user.apiRepr());
});

// ===== Post '/users' endpoint to save a new User =====
// saves a user with plain-text password to the DB
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
      return UserModel.create({ username, password, firstName, lastName });
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

mongoose.connect(DATABASE_URL, { useMongoClient: true })
  .then(() => {
    app.listen(PORT, function () {
      console.log(`Server listening on port ${this.address().port}`);
    });
  }); 