'use strict';
/**
 * Step 1
 * Protect endpoint with Passport Local strategy using a **hardcoded** UN/PW
 */

const express = require('express');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

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
const localAuth = passport.authenticate('local', { session: false });

// ===== Protected endpoint =====
app.post('/api/secret', localAuth, function (req, res) {
  console.log(`${req.user.username} successfully logged in.`);
  res.json( {
    message: 'Rosebud',
    username: req.user.username
  });
});

app.listen(process.env.PORT || 8080, function () {
  console.info(`Server listening on ${this.address().port}`);
});
