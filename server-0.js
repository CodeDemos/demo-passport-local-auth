'use strict';
/**
 * Step 0
 * Protect aj endpoint with Gatekeep - a custom middleware
 */

const express = require('express');

const { PORT } = require('./config');

const app = express();
app.use(express.static('public'));
app.use(express.json());

// ===== Public endpoint =====
app.get('/api/welcome', function (req, res) {
  res.json({message: 'Hello!'});
});

// ===== Gatekeeper example =====
function gateKeeper(req, res, next) {
  const { username, password } = req.body;
  try {
    if (!username && !password) {
      console.log('Bad Request');
      return res.sendStatus(400);
    }

    if (username !== 'bobuser') {
      console.log('Incorrect username');
      return res.sendStatus(401);
    }

    if (password !== 'baseball') {
      console.log('Incorrect password');
      return res.sendStatus(401);
    }

    req.user = { username, password };
    next();

  } catch (err) {
    next(err);
  }
}

// ===== Protected endpoint =====
app.post('/api/login', gateKeeper, (req, res, next) => {
  console.log(`${req.user.username} ${req.user.password} successfully logged in.`);
  res.json({
    message: 'Rosebud',
    username: req.user.username
  });
});

app.listen(PORT, function () {
  console.log(`app listening on port ${this.address().port}`);
});
