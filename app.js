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
let validateListing = (req,res,next)=>{
    let {error} = listingschema.validate(req.body);
    if (error) {
        console.log(error)
        throw new ExpressError (400, result.err);
    }
    if(error){
        throw new ExpressError( 400, error);
    }else{
        next();
    }
}
let validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if (error) {
        console.log(error)
        throw new ExpressError (400, result.err);
    }
    if(error){
        throw new ExpressError( 400, error);
    }else{
        next();
    }
}
// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings })
}))
// New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}))

// Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    //let {title, discription, image, price,country, location} = req.body;
    const newListing = Listing(req.body.listing);

    await newListing.save();
    res.redirect("/listings");
}))
// 
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}))
// Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
}))
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
}))

// reviews
app.post("/listings/:id/reviews",validateReview ,wrapAsync(async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("New Review Saved");
    res.redirect(`/listings/${listing._id}`);
}))

// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",async(req,res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId)

    res.redirect(`/listings/${id}`)
})
// app.get("/testListing", async (req, res) => {
//     let samplelisting = new Listing({
//         title: "My new Villa",
//         description: "By the Beach",
//         price: 1000,
//         location: "pune",
//         country: "india",
//     })
//     await samplelisting.save();
//     console.log("Sample was saved");
//     res.send("Sucessfully Testing");
// })
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