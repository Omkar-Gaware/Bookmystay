if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}
// console.log(process.env.SECRETE);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const  User = require('./models/user.js');


//require routes
const listingsRouter = require('./routes/listings.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const wrapAsync = require('./utils/wrapAsync.js');
const searchController = require('./controllers/search.js');
const { error } = require('console');

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true })); //to parse data
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); //set view engine
app.engine("ejs", ejsMate); //set ejs engine
app.use(express.static(path.join(__dirname, "/public"))); //serve static files

//connect database
// const MONGO_URL = "mongodb://127.0.0.1:27017/homeheavens"; //use url of your database
const DB_url = process.env.ATLAS_DB_URL;
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(DB_url);
}

const store = MongoStore.create({
  mongoUrl:DB_url,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,
})

store.on("error",()=>{
  console.log("Error in MongoDB Session Store",error);
})
//associate session
const sessionOptions ={
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now()+ 7*24*60*60*1000,  //after 7*24*60*60*1000 ms from now i.e. 7 days
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
  }
};

// //home route
// app.get("/", (req, res) => {
//   res.send("hello from backend");
// });

app.use(session(sessionOptions));
app.use(flash());

//authentication and authorization
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//create res.local variable
app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

//routes
app.use('/listings',listingsRouter);
app.use('/listings/:id/reviews',reviewRouter);
app.use('/',userRouter);
//search route
app.get('/search',wrapAsync(searchController.search));

//invalid page request
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

//error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message)
});

app.listen(8080, () => {
  console.log(`Server ruuning on http://localhost:8080`);
});
