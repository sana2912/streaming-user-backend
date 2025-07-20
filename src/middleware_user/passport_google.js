require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const google_strategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/user/google/auth"
},
    async function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
    }
);

module.exports = google_strategy;