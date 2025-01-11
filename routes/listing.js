const express = require("express");
const Router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const { listingschema } = require("../schema.js");
const ExpressError = require("../util/ExpressError.js");
const Listing = require("../models/listing.js")
const ListingCont = require("../controller/listing.js");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

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
Router.get("/", wrapAsync(ListingCont.index));
// New Route

Router.get("/new", ListingCont.new)

//Show Route
Router.get("/:id", wrapAsync(ListingCont.show))

// Create Route
// Router.post("/", validateListing, wrapAsync( ListingCont.create))
Router.post("/",upload.single('listing[image]'),(req,res)=>{
    res.send(req.file);
})
// Edit
Router.get("/:id/edit", isOwner, wrapAsync( ListingCont.edit))

// Update Route
Router.put("/:id", isOwner, validateListing, wrapAsync(ListingCont.update))

Router.delete("/:id", isOwner, wrapAsync(ListingCont.destroy));

module.exports = Router;