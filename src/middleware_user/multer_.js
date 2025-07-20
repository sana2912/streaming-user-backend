const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        // check field name that we set for uour file for devide the destination
        callback(null, './user_profile');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname) //ให้ใช้ชื่อไฟล์ original เป็นชื่อหลังอัพโหลด
    },
})

const upload = multer({ storage })

module.exports = upload;