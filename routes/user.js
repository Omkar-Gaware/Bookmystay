const express = require("express");
const Router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const passport = require("passport");
const User = require("../models/user.js");
const UserCont = require("../controller/users.js");

const saveRedirectUrl = (req,res,next)=>{
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}
// SignUp
Router.get("/signup", UserCont.renderSignup)

Router.post("/signup", wrapAsync(UserCont.signup))

//Login
Router.get("/login", UserCont.renderLogin)
Router.post("/login",saveRedirectUrl, passport.authenticate("local",
    { failureRedirect: '/login', failureFlash: true }),
    UserCont.Login)


Router.get("/logout", UserCont.logout);

module.exports = Router;