require('dotenv').config();
const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function cloudinary_upload_file(file, file_name, resource_, dir) {
    return await cloudinary.uploader.upload(file.path, {
        public_id: file_name,
        resource_type: resource_,
        folder: dir,
        transformation: [
            { aspect_ratio: "1.0", width: 400, crop: "fill" },
            { fetch_format: "auto" }
        ],
    });
}

module.exports = {
    cloudinary_upload_file
}
