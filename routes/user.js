const express = require("express");
const Router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const passport = require("passport");


// SignUp
Router.get("/signup", (req, res) => {
    res.render("Users/signup.ejs")
})

Router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);
        console.log(registerUser);
        req.flash("success", "User was register Sucessfully");
        res.redirect("/listings");
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}))

//Login
Router.get("/login",(req,res)=>{
    res.render("Users/login.ejs")
})
Router.post("/login",passport.authenticate("local",
    {failureRedirect:'/login', failureFlash:true}),
     async (req,res)=>{
        req.flash("success","Welcome Back to BookMyStay");
        res.redirect("/listings")
})
module.exports = Router;