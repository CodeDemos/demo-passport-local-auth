'use strict';
/**
 * Step 3
 * - Add Bcrypt to hash password before saving
 * - Add Bcrypt to validate passwords when comparing
 */

const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

// const LocalStrategy = require('passport-local').Strategy;
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcryptjs');

const { PORT, DATABASE_URL } = require('./config');

const app = express();
app.use(express.static('public'));
app.use(express.json());

// ===== Define UserSchema & UserModel =====
const userSchema = new mongoose.Schema({
  fullName: { type: String, default: '' },
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

userSchema.set('toJSON', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
  }
});

userSchema.statics.hashPassword = (incomingPassword) => {
  return bcrypt.hash(incomingPassword, 10);
};

userSchema.methods.validatePassword = function (incomingPassword) {
  const user = this; // for clarity
  return bcrypt.compare(incomingPassword, user.password);
};

var UserModel = mongoose.model('User', userSchema);

// ===== Define and create basicStrategy =====
const localStrategy = new LocalStrategy((username, password, done) => {
  let user;
  UserModel.findOne({ username })
    .then(_user => {
      user = _user;

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
app.post('/api/login', localAuth, (req, res) => {
  console.log(`${req.user.username} successfully logged in.`);
  res.json({
    message: 'Rosebud',
    username: req.user.username
  });
});

// ===== Public endpoint =====
app.get('/api/public', (req, res) => {
  res.send('Hello World!');
});

// ===== Post '/users' endpoint to save a new User =====
// NOTE: validation and some error handling removed for brevity
app.post('/api/users', (req, res, next) => {
  // NOTE: validation removed for brevity
  let { username, password, fullName } = req.body;

  return UserModel.findOne({ username })
    .count()
    .then(user => {
      if (user) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return UserModel.hashPassword(password);
    })
    .then(digest => {
      return UserModel.create({
        username,
        password: digest,
        fullName
      });
    })
    .then(user => res.status(201).json(user))
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return next(err);
      }
      next({ code: 500, message: 'Internal server error' });
    });
});

// Catch-all 404
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ message: err.message });
});

mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useCreateIndex: true });
app.listen(PORT, function () {
  console.log(`app listening on port ${this.address().port}`);
});
