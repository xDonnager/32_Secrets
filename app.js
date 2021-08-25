//jshint esversion:6
//setup server
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
//mongoose encription module
const encrypt = require('mongoose-encryption');

//creating an instance
const app = express();

console.log(process.env.SECRET);
//template engine
app.set('view engine', 'ejs');
//new version of express includes bodyparser
app.use(express.urlencoded({extended: true}));
app.use(express.json())
//redirect to public folder
app.use(express.static('public'));

//conect to db
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});
//create new user Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});


const User = new mongoose.model('User', userSchema);


//-------------METHODS--------------//
app.get('/', function(req, res){
    res.render('home');
})


app.get('/login', function(req, res){
    res.render('login');
})

app.get('/register', function(req, res){
    res.render('register');
})

app.post('/register', function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save( function(err){
        if(err){
            console.log(err);
        }else{
            res.render('secrets');
        }
    });

});


app.post('/login', function(req, res){
    //console.log(req.body);
    const username =  req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            console.log('   LOG --- founduser: '+foundUser)
            if(foundUser){
                if(foundUser.password === password){
                    console.log("here")
                    res.render('secrets');
                }else{
                    console.log('not match!')
                }
            }
        }
    })
});








app.listen( 3000, function(){
    console.log('Server is listening on port 3000')
})