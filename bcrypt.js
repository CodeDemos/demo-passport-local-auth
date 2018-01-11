'use strict';
/**
 * Bcrypt Demo
 * - Use Bcrypt to hash and compare password
 */

const bcrypt = require('bcryptjs');

/** Bcrypt using promises */
bcrypt.hash('baseball', 12)
  .then(hash => {
    console.log('Hashed Password:', hash);
    return hash;
  });

bcrypt.compare('baseball', '$2a$10$Ui3Zi0g3ZDXIdsnygrYmROyIcREoEWJ.kibWb0ZNC84jloay0XC2S')
  .then(valid => {
    console.log(valid);
  });

// bcrypt.hash('baseball', 12)
//   .then(hash => {
//     console.log('hash:', hash);
//     return hash;
//   })
//   .then(hash => {
//     return bcrypt.compare('baseball', hash)
//   })
//   .then(valid => {
//     console.log(valid);
//   })
//   .catch(err => {
//     console.error('error', err);
//   });