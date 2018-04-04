'use strict';
/**
 * Step 2
 * - Create User with plain-text UN/PW and store in DB
 * - Update Basic Strategy to finduser and compare
 */

const express = require('express');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

const { PORT, DATABASE_URL } = require('./config');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express();
app.use(express.static('public'));
app.use(express.json());

// ===== Define userSchema & User =====
const userSchema = new mongoose.Schema({
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

userSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  }
});

userSchema.methods.validatePassword = function (password) {
  return password === this.password;
};

const User = mongoose.model('User', userSchema);

// ===== Define and create basicStrategy =====
const localStrategy = new LocalStrategy((username, password, done) => {
  User
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
app.post('/api/secret', localAuth, function (req, res) {
  console.log(`${req.user.username} successfully logged in.`);
  res.json({
    message: 'Rosebud',
    username: req.user.username
  });
});

// ===== Post '/users' endpoint to save a new User =====
// saves a user with plain-text password to the DB
app.post('/api/users', function (req, res) {
  // NOTE: validation removed for brevity
  let { username, password, firstName, lastName } = req.body;

  return User
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
      return User.create({
        username,
        password,
        firstName,
        lastName
      });
    })
    .then(user => {
      return res.status(201).json(user);
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});

mongoose.connect(DATABASE_URL)
  .then(() => {
    app.listen(PORT, function () {
      console.log(`Server listening on port ${this.address().port}`);
    });
  });