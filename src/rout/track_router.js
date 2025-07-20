const express = require('express');
const song_controll = require('../constroller/track_controll');

const song_router = express.Router();
song_router.get('/list', song_controll.list_track);

module.exports = song_router;