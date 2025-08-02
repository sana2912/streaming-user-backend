require('dotenv').config();
const JwtStrategy = require('passport-jwt').Strategy

const opts = {};
var cookieExtractor = function (req) {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    return token;
};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.SECRET;


const auth_MIDDLEWARE = new JwtStrategy(opts, function (user_, done) {
    console.log(user_);
    if (user_) {
        return done(null, user_);
    }
    else {
        return done(null, false);
    }
});

module.exports = auth_MIDDLEWARE;