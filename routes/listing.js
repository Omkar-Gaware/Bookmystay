const express = require("express");
const Router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const {listingschema, revi, reviewSchema} = require("../schema.js");
const ExpressError = require("../util/ExpressError.js");
const Listing = require("../models/listing.js")

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
Router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings })
}))
// New Route
Router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
})

//Show Route
Router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}))

// Create Route
Router.post("/", validateListing, wrapAsync(async (req, res) => {
    //let {title, discription, image, price,country, location} = req.body;
    const newListing = Listing(req.body.listing);

    await newListing.save();
    res.redirect("/listings");
}))
// 
Router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}))
// Update Route
Router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
}))
Router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
}))

// reviews
Router.post("/:id/reviews",validateReview ,wrapAsync(async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("New Review Saved");
    res.redirect(`/listings/${listing._id}`);
}))

// Delete Review Route
Router.delete("/:id/reviews/:reviewId",async(req,res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId)

    res.redirect(`/listings/${id}`)
})

module.exports = Router;