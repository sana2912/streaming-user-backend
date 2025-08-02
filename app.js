const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connect_database = require('./src/config_user/data_base');
const passport = require('passport');
const song_router = require('./src/rout/track_router');
const user_like = require('./src/rout/like_router');
const user_playlist = require('./src/rout/playlist_router');
const search_router = require('./src/rout/search_router');
const album_router = require('./src/rout/album_router');
const auth_router = require('./src/rout/auth_router');
const auth_MIDDLEWARE = require('./src/middleware_user/passport_auth');
const user_model = require('./src/model_user/user_model');
const google_auth = require('./src/rout/google_auth_router');
const google_strategy = require('./src/middleware_user/passport_google');
require('dotenv').config();
const origin_client = process.env.CLIENT_ORIGIN;

connect_database();
const app = express();
const port = 3000;
app.use(cors({
    origin: origin_client,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(passport.initialize());
passport.use(auth_MIDDLEWARE);// for jwt strategy;
passport.use(google_strategy);// for google stategy;


// wel come page
app.get('/api/is_login', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const user = await user_model.findById(user_id);
        res.status(200).json({
            profile: user.image
        })
    } catch (error) {
        console.log(error.stack);
        res.status(500).json({ message: error.message });
    }
})

//  track router 
app.use('/api/track', song_router);
app.use('/api/album', album_router);
app.use('/api/user/playlist', passport.authenticate('jwt', { session: false }), user_playlist);
app.use('/api/user/like', passport.authenticate('jwt', { session: false }), user_like);
app.use('/api/user/search', search_router);
app.use('/api/user/auth', auth_router);
app.use('/api/user/google', google_auth);

app.listen(port, (req, res) => {
    console.log('now sever is started');
})
