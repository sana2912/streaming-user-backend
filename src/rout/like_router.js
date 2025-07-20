const express = require('express');
const like_function = require('../constroller/like_controll');
const user_like = express.Router();

user_like.get('/display', like_function.display_like);
user_like.get('/like_state', like_function.like_state);
user_like.post('/push', like_function.push_like);
user_like.post('/pop', like_function.pop_like);
user_like.post('/remove', like_function.like_removing);

module.exports = user_like;