const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

//SignUp route
router
  .route("/signup")
  .get(userController.renderSigupForm)
  .post(wrapAsync(userController.signupUser));

//login route
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.loginUser
  );

//logout route
router.get("/logout", userController.logoutUser);

module.exports = router;
