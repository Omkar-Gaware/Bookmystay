const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, valiadteListing } = require("../middleware.js");
const listingsController = require("../controllers/listings.js");

//set up multer for multipart data handling
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingsController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    valiadteListing,
    wrapAsync(listingsController.createListing)
  );

//new and edit form
router.get("/new", isLoggedIn, listingsController.renderNewForm);
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.renderEditForm)
);

router
  .route("/:id")
  .get(wrapAsync(listingsController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    valiadteListing,
    wrapAsync(listingsController.editListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingsController.destroyListing));

module.exports = router;
