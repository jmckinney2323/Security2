//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

const dbUser = process.env.MONGO_USERNAME;
const dbPassword = process.env.MONGO_PASSWORD;

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect(`mongodb://${dbUser}:${dbPassword}@localhost:27017/userDB?authSource=admin`, {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home.ejs");
});

app.get("/login", function(req, res){
    res.render("login.ejs");
});

app.get("/register", function(req, res){
    res.render("register.ejs");
});

app.post("/register", async function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password 
    });

    try {
        await newUser.save();
        res.render("secrets.ejs");
    } catch (err) {
        console.log(err);
        res.redirect("/register");
    }
});

app.post("/login", async function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({email: username});
        
        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
            } else {
                res.send("Incorrect password."); 
            }
        } else {
            res.send("No user found with this email address.");
        }
    } catch (err) {
        console.log(err);
        res.send("Error occurred while logging in.");
    }
});












app.listen(3000, function( ){
    console.log("Server started on port 3000");
});





