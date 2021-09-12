//jshint esversion:6
//setup server
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
//hashing module
//const md5 = require('md5');
//bcrypt
const bcrypt = require('bcryptjs');


//creating an instance
const app = express();

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

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            // Store hash in your password DB.
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
        
            newUser.save( function(err){
                if(err){
                    console.log(err);
                }else{
                    res.render('secrets');
                }
            });
        });
    });

    /* md5 encryption
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });

    newUser.save( function(err){
        if(err){
            console.log(err);
        }else{
            res.render('secrets');
        }
    });*/

});


app.post('/login', function(req, res){
    //console.log(req.body);
    const username =  req.body.username;
    /*md5
    const password = md5(req.body.password);*/
    const password = req.body.password

    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            console.log('   LOG --- founduser: '+foundUser)
            if(foundUser){
                bcrypt.compare(password, foundUser.password, function(err, result){
                    if(result === true){
                        res.render('secrets');
                    }
                });            
                
            }
        }
    })
});








app.listen( 3000, function(){
    console.log('Server is listening on port 3000')
})