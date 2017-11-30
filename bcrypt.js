'use strict';
/**
 * Bcrypt Demo
 * - Use Bcrypt to hash password
 * - Use Bcrypt to validate passwords
 */

var bcrypt = require('bcryptjs');


/** Bcrypt using promises */
bcrypt.hash('baseball', 10)
  .then(digest => {
    console.log('digest:', digest);
  });

// bcrypt.compare('baseball', '$2a$10$luAto4OeyAvAadcz7pTA2OekD7OA0ixX.Rj8DWx3sUBVI0ZBmDfw6')
//   .then(valid => {
//     console.log(valid);
//   });

/** Bcrypt using promises */
// bcrypt.hash('baseball', 10)
//   .then(digest => {
//     console.log('digest:', digest);
//     return digest;
//   })
//   .then(digest => {
//     return bcrypt.compare('baseball', digest)
//   })
//   .then(valid => {
//     console.log(valid);
//   })
//   .catch(err => {
//     console.error('error', err);
//   });