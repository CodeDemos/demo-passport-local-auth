'use strict';
/**
 * Step 2
 * - Create User with plain-text UN/PW and store in DB
 * - Update Basic Strategy to finduser and compare
 */

const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const { Strategy: LocalStrategy } = require('passport-local');

const { PORT, DATABASE_URL } = require('./config');

const app = express();
app.use(express.static('public'));
app.use(express.json());

// ===== Public endpoint =====
app.get('/api/welcome', function (req, res) {
  res.json({message: 'Hello!'});
});

// ===== Define userSchema & User =====
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

userSchema.methods.validatePassword = function (incomingPassword) {
  const user = this; // for clarity
  return incomingPassword === user.password;
};

const UserModel = mongoose.model('User', userSchema);

// ===== Define and create basicStrategy =====
const localStrategy = new LocalStrategy((username, password, done) => {
  UserModel.findOne({ username })
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

// ===== Post '/users' endpoint to save a new User =====
// saves a user with plain-text password to the DB
app.post('/api/users', (req, res, next) => {
  // NOTE: validation removed for brevity
  let { username, password, fullName } = req.body;

  UserModel.find({ username })
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
      return UserModel.create({
        username,
        password,
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
  err.code = 404;
  next(err);
});

// Catch-all Error handler
app.use((err, req, res, next) => {
  res.status(err.code || 500);
  res.json({ message: err.message });
});

mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useCreateIndex: true });
app.listen(PORT, function () {
  console.log(`app listening on port ${this.address().port}`);
});
