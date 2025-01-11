const express = require("express");
const Router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const { listingschema } = require("../schema.js");
const ExpressError = require("../util/ExpressError.js");
const Listing = require("../models/listing.js")

const isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.curruser._id)) {
        req.flash("error", "You Are Not Owner Of This Listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
const saveRedirectUrl = (req,res,next)=>{
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}
let validateListing = (req, res, next) => {
    let { error } = listingschema.validate(req.body);
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
// Index Route
Router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings })
}))
// New Route
Router.get("/new", (req, res) => {
    if (!req.isAuthenticated()) {
        //redirectUrl
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must LoggedIn First.");
        return res.redirect("/login");
    }
    res.render("listings/new.ejs");
})

//Show Route
Router.get("/:id", wrapAsync(async (req, res) => {

    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews", populate: {
                path: "author",
            }
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing Not Available");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}))

// Create Route
Router.post("/", validateListing, wrapAsync(async (req, res) => {
    //let {title, discription, image, price,country, location} = req.body;
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must LoggedIn First.");
        return res.redirect("/login");
    }
    const newListing = Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}))
// Edit
Router.get("/:id/edit", isOwner, wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must LoggedIn First.");
        return res.redirect("/login");
    }
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Not Available");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}))
// Update Route
Router.put("/:id", isOwner, validateListing, wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must LoggedIn First.");
        return res.redirect("/login");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Edit Sucessfully");
    res.redirect(`/listings/${id}`);
}))
Router.delete("/:id", isOwner, wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must LoggedIn First.");
        return res.redirect("/login");
    }
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    req.flash("success", "Delete Sucessfully");
    res.redirect("/listings");
}))

module.exports = Router;