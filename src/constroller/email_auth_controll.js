const fs = require("fs");
const bcrypt = require("bcryptjs"); // ✅ ใช้ bcryptjs
const jwt = require("jsonwebtoken");

const user_model = require("../model_user/user_model");
const { cloudinary_upload_file } = require("../config_user/cloudinary_");

const SECRET = process.env.SECRET;
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days

module.exports.register = async (req, res) => {
    try {
        const { username, email, password2 } = req.body;
        const image_file = req.file;

        const userExists = await user_model.findOne({ email });
        if (userExists) {
            return res.status(409).json({
                message: "email นี้มีคนใช้แล้ว",
            });
        }

        const imgName = image_file.originalname.replace(/\.[^/.]+$/, "");
        const image = await cloudinary_upload_file(
            image_file,
            imgName,
            "image",
            "stream/profile"
        );

        const hashPassword = await bcrypt.hash(password2, 10);

        const newUser = await user_model.insertOne({
            name: username,
            email,
            password: hashPassword,
            image: image.secure_url,
        });

        const token = jwt.sign(
            { user_id: newUser._id, permission: "user" },
            SECRET
        );

        fs.unlink(image_file.path, (err) => {
            if (err) console.error("Failed to delete image:", err);
        });

        return res
            .cookie("jwt", token, {
                maxAge: COOKIE_MAX_AGE,
                httpOnly: true,
                secure: true,
                sameSite: "None",
                path: "/",
            })
            .status(201)
            .json({
                profile: image.secure_url,
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "register fail",
            err_message: error.message,
        });
    }
};

// LOGIN
module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await user_model.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "ไม่พบบัญชีของคุณ",
            });
        }

        const success = await bcrypt.compare(password, user.password);
        if (!success) {
            return res.status(401).json({
                message: "รหัสผ่านไม่ถูกต้อง",
            });
        }

        const token = jwt.sign(
            { user_id: user._id, permission: "user" },
            SECRET
        );

        return res
            .cookie("jwt", token, {
                maxAge: COOKIE_MAX_AGE,
                httpOnly: true,
                secure: true,
                sameSite: "None",
                path: "/",
            })
            .status(200)
            .json({
                profile: user.image,
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "login fail",
            err_message: error.message,
        });
    }
};
