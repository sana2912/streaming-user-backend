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
const whitelist = [
    process.env.CLIENT_ORIGIN,
    'https://accounts.google.com',
    'http://localhost:5173'
];

connect_database();
const app = express();
const port = 3000;

app.use(cors({
    origin: function (origin, callback) {
        // allow no-origin for mobile apps or curl/postman
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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
app.get('/', async (req, res) => {
     res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Streaming Backend</title>
  <style>
    body {
      margin: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-align: center;
      padding: 20px;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 15px;
      font-weight: 600;
    }
    p {
      font-size: 1.3rem;
      margin-bottom: 40px;
      opacity: 0.9;
    }
    .button-container {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      justify-content: center;
    }
    a.button {
      display: inline-block;
      padding: 14px 28px;
      font-size: 1.1rem;
      color: #764ba2;
      background-color: white;
      border-radius: 50px; /* More rounded corners */
      text-decoration: none;
      font-weight: bold;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
    a.button:hover {
      background-color: #f0f4f8;
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
    }
  </style>
</head>
<body>
  <h1>🎵 Streaming Backend Service</h1>
  <p>Your backend is running smoothly 🚀</p>
  <div class="button-container">
    <a href="${process.env.CLIENT_ORIGIN}" class="button" target="_blank">
      Go to Frontend
    </a>
    <a href="https://github.com/sana2912/streaming-user-backend.git" class="button" target="_blank">
      Project Repository
    </a>
    <a href="https://github.com/sana2912/streaming-frontend.git" class="button" target="_blank">
      Frontend Repository
    </a>
    
  </div>
</body>
</html>
`)
});
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
