# Local Authentication

## How to run each `server-x.js`

Either run directly or use npm start command:

* Run the file directly. For example: `node server-2.js`
* Or update the start command in `package.json`

```json
{
  "scripts": {
    "start": "node server-1.js"
  },
}
```

and then run `npm start`

## Step 0: Gatekeeper custom middleware

* Simple middleware to demonstrate protecting an endpoint

## Step 1: Hardcoded plain-text passwords

* Instantiate a strategy and implement password comparison
* Protect endpoint with Passport Local strategy using a hardcoded UN/PW

## Step 2: Integrate a database so we can store and retrieve passwords for multiple users

* Create a User with plain-text UN/PW and store in DB
* Update Local Strategy to find the user and compare password

## Step 3: Finally, add Bcrypt so we can salt and hash passwords before persisting. And we can use bcrypt.compare to validate authentication

* Add Bcrypt to salt and hash password before saving
* Add Bcrypt to validate passwords when comparing

## Bonus file

* bcrypt.js is a standalone demo of .hash() and .compare()
