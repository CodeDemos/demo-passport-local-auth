'use strict';
/**
 * Step 1
 * Protect endpoint with Passport Local strategy using a **hardcoded** UN/PW
 */

const express = require('express');
const bodyParser = require('body-parser');

const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');


const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

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

console.log('strategy name', localStrategy.name);

passport.use(localStrategy);
const localAuth = passport.authenticate('local', { session: false });

// ===== Protected endpoint =====
app.post('/api/protected', localAuth, function (req, res) {
  console.log(`${req.user.username} successfully logged in.`);
  res.json(req.user);
});

// ===== Public endpoint =====
app.get('/api/public', function (req, res) {
  res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
  console.log(`app listening on port ${process.env.PORT}`);
});
