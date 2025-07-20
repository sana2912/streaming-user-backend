// use this section to create playlist model 

const mongoose = require('mongoose');

const Playlist_schema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: String, required: true },
    tracks: [String]
}, { collection: 'playlist_data' });

const playlist_model = mongoose.model('playlist_model', Playlist_schema);
module.exports = playlist_model;