const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");

module.exports.Add = async (req,res)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must LoggedIn First.");
        return res.redirect("/login");
    }
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author =  req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","Review Added Sucessfully.")
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroy = async(req,res)=>{
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
}