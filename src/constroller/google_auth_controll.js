const user_model = require("../model_user/user_model");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.SECRET;
module.exports.google_auth_management = async (req, res) => {
    try {
        const profile = req.user;
        const user = await user_model.findOne({ google_id: profile.id });
        if (user) {
            // login function
            const token = jwt.sign({ user_id: user._id, permission: 'user' }, secret);
            res.cookie('jwt', token, {
                maxAge: 5000000,
                httpOnly: true,
                sameSite: 'lax'
            }).redirect('http://localhost:5173')
        }
        else {
            // register function
            const create = await user_model.create({
                google_id: profile.id,
                name: profile._json.name,
                email: profile._json.email,
                password: 'none',
                image: profile._json.picture
            })
            const token = jwt.sign({ user_id: create._id, permission: 'user' }, secret);
            res.cookie('jwt', token, {
                maxAge: 5000000,
                httpOnly: true,
                sameSite: 'lax'
            }).redirect('http://localhost:5173')
        }

    } catch (error) {
        console.log(error.stack);
        res.status(500).json({
            message: error.message
        })
    }
}