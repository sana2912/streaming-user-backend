const express = require('express');
const al_controll = require('../constroller/album_controller');

const album_router = express.Router();
album_router.get('/list', al_controll.list_album);
module.exports = album_router;