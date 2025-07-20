const express = require('express');
const playlist_function = require('../constroller/playlist_controll');
const passport = require('passport');
const user_playlist = express.Router();

user_playlist.get('/display', playlist_function.display_List);
user_playlist.get('/list_item', playlist_function.display_List_item);
user_playlist.get('/list_tracks', playlist_function.display_tracks_list);
user_playlist.post('/update', playlist_function.playlist_MA);
user_playlist.post('/remove', playlist_function.remove_List);
user_playlist.post('/remove_list', playlist_function.reomve_List_item)

module.exports = user_playlist;