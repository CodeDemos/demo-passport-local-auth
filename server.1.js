'use strict';
/**
 * Step 1
 * Protect endpoint with Passport Local strategy using a **hardcoded** UN/PW
 */

const express = require('express');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');  // const LocalStrategy = require('passport-local').Strategy;

const app = express();
app.use(express.static('public'));
app.use(express.json());

// ===== Define and create a strategy =====
const localStrategy = new LocalStrategy((username, password, done) => {
  try {

    if (username !== 'bobuser') {
      console.log('Incorrect username');
      return done(null, false);
    }

    if (password !== 'baseball') {
      console.log('Incorrect password');
      return done(null, false);
    }

    const user = { username, password };
    done(null, user);

  } catch (err) {
    done(err);
  }
});

passport.use(localStrategy);
const localAuth = passport.authenticate('local', { session: false, failWithError: true });

// ===== Protected endpoint =====
app.post('/api/secret', localAuth, function (req, res) {
  console.log(`${req.user.username} ${req.user.password} successfully logged in.`);
  res.json( {
    message: 'Rosebud',
    username: req.user.username
  });
});

// Catch-all 404
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

app.listen(process.env.PORT || 8080, function () {
  console.info(`Server listening on ${this.address().port}`);
});
