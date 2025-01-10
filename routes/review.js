const express = require("express");
const Router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../util/ExpressError.js");
const Listing = require("../models/listing.js")
const Review = require("../models/reviews.js");

let validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        console.log(error)
        throw new ExpressError(400, result.err);
    }
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

// reviews
Router.post("/:id/reviews",validateReview ,wrapAsync(async (req,res)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must LoggedIn First.");
        return res.redirect("/login");
    }
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("New Review Saved");
    req.flash("success","Review Added Sucessfully.")
    res.redirect(`/listings/${listing._id}`);
}))

// Delete Review Route
Router.delete("/:id/reviews/:reviewId",async(req,res)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must LoggedIn First.");
        return res.redirect("/login");
    }
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId)
    req.flash("success","Review Deleted Sucessfully.")
    res.redirect(`/listings/${id}`)
})

module.exports = Router;