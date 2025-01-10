const express = require("express");
const Router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const {listingschema} = require("../schema.js");
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
// Index Route
Router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings })
}))
// New Route
Router.get("/new", (req, res) => {
    if(!req.isAuthenticated()){
        //redirectUrl
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must LoggedIn First.");
        return res.redirect("/login");
    }
    res.render("listings/new.ejs");
})

//Show Route
Router.get("/:id",  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error","Listing Not Available");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}))

// Create Route
Router.post("/", validateListing, wrapAsync(async (req, res) => {
    //let {title, discription, image, price,country, location} = req.body;
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must LoggedIn First.");
        return res.redirect("/login");
    }
    const newListing = Listing(req.body.listing);

    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}))
// Edit
Router.get("/:id/edit", wrapAsync(async (req, res) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must LoggedIn First.");
        return res.redirect("/login");
    }
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error","Listing Not Available");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}))
// Update Route
Router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must LoggedIn First.");
        return res.redirect("/login");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Edit Sucessfully");
    res.redirect("/listings");
}))
Router.delete("/:id", wrapAsync(async (req, res) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must LoggedIn First.");
        return res.redirect("/login");
    }
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    req.flash("success", "Delete Sucessfully");
    res.redirect("/listings");
}))

module.exports = Router;