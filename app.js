//jshint esversion:6
//setup server
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
//hashing module md5
//const md5 = require('md5');
//hashing module bcrypt
//const bcrypt = require('bcryptjs');
//sessions and cookies below
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose')
//OAuth with google
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


//creating an instance
const app = express();

//template engine
app.set('view engine', 'ejs');
//new version of express includes bodyparser
app.use(express.urlencoded({extended: true}));
app.use(express.json())
//redirect to public folder
app.use(express.static('public'));
//init session
app.use(session ({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false
}));
//init passport
app.use(passport.initialize());
app.use(passport.session());

//conect to db
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
//create new user Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

//create cookie
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
//open cookie
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//Oauth
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/secrets',
    scope: 'profile'
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


//-------------METHODS--------------//
app.get('/', function(req, res){
    res.render('home');
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
});

app.get('/login', function(req, res){
    res.render('login');
});

app.get('/register', function(req, res){
    res.render('register');
});

app.get('/secrets', function(req, res){
    if(req.isAuthenticated()){
        res.render('secrets');
    }else{
        res.redirect('/login');
    }
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
})

app.post('/register', function(req, res){

    User.register({username:req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register');
        }else{
            passport.authenticate('local')(req,res, function(){
                res.redirect('/secrets')
            })
        }
      });
});

app.post('/login', function(req, res){
    
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate('local')( req, res, function(){
                res.redirect('/secrets');
            })
        }
    });
});




app.listen( 3000, function(){
    console.log('Server is listening on port 3000')
})