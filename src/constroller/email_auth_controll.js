require('dotenv').config();
const fs = require('fs');
const bcrypt = require('bcrypt');
const user_model = require('../model_user/user_model');
const { cloudinary_upload_file } = require('../config_user/cloudinary_');
const jwt = require('jsonwebtoken');
const { console } = require('inspector');
const secret = process.env.SECRET;

module.exports.register = async (req, res) => {
    try {
        const { username, email, password2 } = req.body;
        const image_file = req.file;
        const user_ = await user_model.findOne({ email: email })
        if (user_) {
            res.status(202).json({
                message: 'email นี้มีคนใช้แล้ว'
            })
        }
        else {
            img_name = image_file.originalname.substring(0, image_file.originalname.length - 4);
            const image = await cloudinary_upload_file(image_file, img_name, 'image', 'stream/profile');
            const hash_password = await bcrypt.hash(password2, 10);
            const add_new = await user_model.insertOne({
                name: username,
                email: email,
                password: hash_password,
                image: image.secure_url
            })
            const token = jwt.sign({ user_id: add_new._id, permission: 'user' }, secret);
            fs.unlink(image_file.path, (err) => {
                if (err) { console.error("Failed to delete image:", err); }
            });
            res.cookie('jwt', token, {
                maxAge: 5000000,
                httpOnly: true,
                secure: true,
                sameSite: 'lax'
            }).status(200).json({ profile: image.secure_url })
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'register fail',
            err_message: error.message
        })
    }
}


module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user_ = await user_model.findOne({ email: email });
        if (!user_) {
            res.status(202).json({
                message: 'ไม่พบบัญชีของคุณ'
            })
        }
        else {
            const success = await bcrypt.compare(password, user_.password);
            if (success) {
                const token = jwt.sign({ user_id: user_._id, permission: 'user' }, secret);
                res.cookie('jwt', token, {
                    maxAge: 5000000,
                    httpOnly: true,
                    sameSite: 'lax'
                })
                    .status(200)
                    .json({
                        profile: user_.image
                    })
            }
            else {
                res.status(202).json({
                    message: 'หรัสผ่านไม่ถูกต้อง'
                })
            }
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'register fail',
            err_message: error.message
        })
    }
}