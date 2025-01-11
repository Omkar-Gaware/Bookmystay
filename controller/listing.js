const Listing = require("../models/listing.js")

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings })
}

module.exports.new = (req, res) => {
    if (!req.isAuthenticated()) {
        //redirectUrl
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must LoggedIn First.");
        return res.redirect("/login");
    }
    res.render("listings/new.ejs");
}

module.exports.show = async (req, res) => {

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
}

module.exports.create = async (req, res) => {
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
}

module.exports.edit = async (req, res) => {
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
}

module.exports.update = async (req, res) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must LoggedIn First.");
        return res.redirect("/login");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Edit Sucessfully");
    res.redirect(`/listings/${id}`);
}

module.exports.destroy = async (req, res) => {
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
}

