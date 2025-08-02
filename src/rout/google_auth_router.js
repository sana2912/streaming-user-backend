const express = require('express');
const passport = require('passport');
const google_auth = express.Router();
const google_auth_function = require('../constroller/google_auth_controll');
require('dotenv').config();
const redirect_ = process.env.CLIENT_REDIRECT;

// Start Google login
google_auth.get('/login',
    passport.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);

// Callback route from Google
google_auth.get('/auth',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/api/user/google/fail',
    }),
    google_auth_function.google_auth_management
);

// Optional failure route
google_auth.get('/fail', (req, res) => {
    res.redirect(redirect_);
});

module.exports = google_auth;