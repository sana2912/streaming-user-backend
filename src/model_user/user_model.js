const mongoose = require('mongoose');
const User_schema = new mongoose.Schema({
    google_id: String,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    likes: [String],
    lists: [String]
}, { collection: 'user_data' });

const user_model = mongoose.model('user_model', User_schema);
module.exports = user_model;