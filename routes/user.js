const express = require("express");
const Router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const passport = require("passport");
const User = require("../models/user.js");

const saveRedirectUrl = (req,res,next)=>{
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}
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
        req.login(registerUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "User was register Sucessfully");
            res.redirect("/listings");
        })
        req.flash("success", "User was register Sucessfully");
        res.redirect("/listings");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}))

//Login
Router.get("/login", (req, res) => {
    res.render("Users/login.ejs")
})
Router.post("/login",saveRedirectUrl, passport.authenticate("local",
    { failureRedirect: '/login', failureFlash: true }),
    async (req, res) => {
        req.flash("success", "Welcome Back to BookMyStay");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    })

Router.get("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged You Out");
        res.redirect("/listings");
    })
})

module.exports = Router;