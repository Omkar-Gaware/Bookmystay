const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

//index
module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

//create new listing
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  })
  .send()

  let url = req.file.path;
  let filename = req.file.filename;
  let listing = req.body.listing;
  let newListing = new Listing(listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;
  let { _id } = await newListing.save();
  console.log(newListing);
  req.flash("success", "New Listing Saved"); //create flash for temporory message
  res.redirect(`/listings/${_id}`);
};

//edit listing
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "The listing you are requesting does not exits");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250"); //for reducing size/quality of image
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.editListing = async (req, res) => {
  let response = await geocodingClient
  .forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  })
  .send()

  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    listing.geometry = response.body.features[0].geometry;
    await listing.save();
  }
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

//delete listing
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  // console.log(deletedListing);
  req.flash("success", "Listing deleted");
  res.redirect("/listings");
};

//show listing
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "The listing you are requesting does not exits");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};
