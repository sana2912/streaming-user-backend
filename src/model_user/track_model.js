// use this section to create user model

const mongoose = require('mongoose');

const Track_schema = new mongoose.Schema({
    name: { type: String, required: true },
    desc: { type: String, required: true },
    album: { type: String, required: true },
    image: { type: String, required: true },
    image_id: { type: String, required: true },
    audio: { type: String, required: true },
    audio_id: { type: String, required: true },
    duration: { type: String, required: true }
}, { collection: 'track_data' })

const track_model = mongoose.model('track_model', Track_schema);
module.exports = track_model;
