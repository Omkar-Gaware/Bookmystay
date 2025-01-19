const Listing = require("../models/listing");

module.exports.search = async(req,res,next) =>{
    let query = req.query.q;
    const allListings = await Listing.find({ 'location': new RegExp(query, 'i') })
    if(allListings.length==0){
        req.flash("error","No listing with provided location found");
        return res.redirect('/listings')
    }
    res.render("listings/index.ejs", { allListings });
}