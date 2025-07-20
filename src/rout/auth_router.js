const express = require('express');
const email_auth_function = require('../constroller/email_auth_controll');
const upload = require('../middleware_user/multer_');
auth_router = express.Router();

auth_router.post('/email_register', upload.single('profile'), email_auth_function.register);
auth_router.post('/email_login', email_auth_function.login);
auth_router.get('/logout', (req, res) => {
    console.log(req.cookies);
    if (!req.cookies) {
        res.status(202).json({ message: 'token not exist' });
    }
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'Lax'
    });

    return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = auth_router;