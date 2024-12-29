const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./util/wrapAsync.js");
const ExpressError = require("./util/ExpressError.js");
const {listingschema, revi, reviewSchema} = require("./schema.js");
const Review = require("./models/reviews.js");
const listings = require("./routes/listing.js");
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

app.get("/", (req, res) => {
    res.redirect("/listings");
})

app.use("/listings", listings);


app.all("*",(req,res,next)=>{
    next(new ExpressError(404, "Page Not Found!"));
})
app.use((err,req,res,next)=>{
    let {statuscode = 500, message = "Somthing Went Wrong!"} = err;
    
    res.render("listings/error.ejs",{err});
})
app.listen(8080, () => {
    console.log("server listening on port 8080.")
})