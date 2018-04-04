'use strict';
/**
 * Bcrypt Demo
 * - Use Bcrypt to hash and compare password
 */

const bcrypt = require('bcryptjs');

/** Bcrypt using promises */
bcrypt.hash('baseball', 10)
  .then(hash => {
    console.log('Hashed Password:', hash);
    return hash;
  });

bcrypt.compare('football', '$2a$12$Cz13b74Y75F2HMWd5ybs1uyr8TFI50fnEsyyNwhF/K810pZ3GMNBm')
  .then(valid => {
    console.log(valid);
  });

bcrypt.hash('baseball', 12)
  .then(hash => {
    console.log('hash:', hash);
    return hash;
  })
  .then(hash => {
    return bcrypt.compare('baseball', hash);
  })
  .then(valid => {
    console.log(valid);
  })
  .catch(err => {
    console.error('error', err);
  });