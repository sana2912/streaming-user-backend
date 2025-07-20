const express = require('express');
const search_function = require('../constroller/search_controll');
const search_router = express.Router();

search_router.get('/field', search_function.get_search_field);
search_router.get('/display', search_function.display_search_data);

module.exports = search_router;