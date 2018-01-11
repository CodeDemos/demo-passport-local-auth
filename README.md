Local Authentication
================================

Step 1: Compare hardcoded plain-text passwords. 
  - Instantiate a strategy and implement password comparison
  - Protect endpoint with Passport Local strategy using a hardcoded UN/PW

Step 2: Integrate a database so we can store and retrieve passwords for multiple users.
  - Create User with plain-text UN/PW and store in DB
  - Update Local Strategy to find the user and compare password

Step 3: Finally, add Bcrypt so we can salt and hash passwords before persisting. And we can use bcrypt.compare to validate authentication.
  - Add Bcrypt to salt and hash password before saving
  - Add Bcrypt to validate passwords when comparing

Bonus file
- bcrypt.js is a standalone demo of .hash() and .compare()
