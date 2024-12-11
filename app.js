const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./util/wrapAsync.js")
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
// Index Route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings })
})
// New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

//Show Route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
})

// Create Route
app.post("/listings", wrapAsync(async (req, res) => {
    //let {title, discription, image, price,country, location} = req.body;
    let newListing = Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}))
// 
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
})
// Update Route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
})
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
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
app.use((err,req,res,next)=>{
    res.send("Something Went Wrong");
})
app.listen(8080, () => {
    console.log("server listening on port 8080.")
})