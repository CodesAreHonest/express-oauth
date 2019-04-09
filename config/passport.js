let JWTStrategy = require('passport-jwt').Strategy;
let ExtractJWT = require('passport-jwt').ExtractJwt;

let User = require('../app/models/user');
let config = require('../config/main');

module.exports = function (passport) {
    let opts = {};
    opts.jwtFromRequest = ExtractJWT.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = config.secret;
    passport.use (new JWTStrategy(opts, function (jwt_payload, done) {
        User.findOne({id: jwt_payload.id}, function (err, user) {

            if (err) {
                return done(err, false);
            }

            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }));
};