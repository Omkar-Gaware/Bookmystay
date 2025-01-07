const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";
const path = require("path");
const wrapAsync = require("./util/wrapAsync.js");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./util/ExpressError.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const Localpassport = require("passport-local");
const User = require("./models/user.js");

main()
    .then(() => {
        console.log("Connected to DB");
    }).catch((err) => {
        console.log(err)
    });

async function main() {
    await mongoose.connect(Mongo_Url);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsmate);
app.use(express.static(path.join(__dirname, 'public')));


const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localpassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
    res.redirect("/listings");
})

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
})
app.use((err, req, res, next) => {
    let { statuscode = 500, message = "Somthing Went Wrong!" } = err;

    res.render("listings/error.ejs", { err });
})
app.listen(8080, () => {
    console.log("server listening on port 8080.")
})
