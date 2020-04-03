var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JWTStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getTOken = function(user){
    return jwt.sign(user,config.seretKey,{expiresIn:3600})
}

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(0);
opts.secretOrKey = config.seretKey;

exports.jwtPassport = passport.use(new JWTStrategy(opts,
    (jwt_payload,done)=>{
        console.log("JWTPayload: ",jwt_payload);
        User.findOne({_id:jwt_payload._id},(err,user)=>{
            if(err){
                return done(err);
            }
            else if(user){
                return done(null,user);
            }
            else{
                return done(null,false);
            }
        })
    }));

exports.verifyUser = passport.authenticate('jwt',{session:false});