const User = require("../models/user.js");

module.exports.renderSigupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signupUser = async (req, res) => {
  try {
    let { email, username, password } = req.body;
    //create new user
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "WelCome to HomeHeavens!");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.loginUser = async (req, res) => {
  req.flash("success", " Logged in successfully");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "logged out successfully");
    res.redirect("/listings");
  });
};
