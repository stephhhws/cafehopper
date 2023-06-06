// Model and services dependencies
const Cafe = require("../models/cafe"); // "Cafe" model definition
const {cloudinary} = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // Geocoding service

// Route handlers
module.exports = {

    // Index - list all cafes
    index: async (req, res) => {
        const cafes = await Cafe.find({});
        res.render("cafes/index", {cafes});
    },

    // Render new cafe form
    renderNewForm: (req, res) => {
        res.render("cafes/new");
    },

    // Create new cafe
    createCafe: async (req, res, next) => {
        const geoData = await geocoder.forwardGeocode({
            query: req.body.cafe.location,
            limit: 1
        }).send();
        const cafe = new Cafe(req.body.cafe);
        cafe.geometry = geoData.body.features[0].geometry; // GeoJSON format
        cafe.images = req.files.map(f => ({url: f.path, filename: f.filename})); // Map files array to object
        cafe.author = req.user._id; // Associate cafe with the user (as the author)
        await cafe.save();
        req.flash("success", "Successfully added a new cafe spot!");
        res.redirect(`/cafes/${cafe._id}`);
    },

    // Show specific cafe
    showCafe: async (req, res) => {
        const cafe = await Cafe.findById(req.params.id).populate({
            path: "reviews",
            populate: {
                path: "author"
            } // Populate reviews and author
        }).populate("author");

        if (!cafe) {
            req.flash("error", "Cannot find that cafe!");
            return res.redirect("/cafes");
        }
        res.render("cafes/show", {cafe});
    },

    // Render edit form for a specific cafe
    renderEditForm: async (req, res) => {
        const { id } = req.params;
        const cafe = await Cafe.findById(id);
        if (!cafe) {
            req.flash("error", "Cannot find that cafe!");
            return res.redirect("/cafes");
        }
        res.render("cafes/edit", {cafe});
    },

    // Update specific cafe
    updateCafe: async (req, res) => {
        const { id } = req.params;
        const cafe = await Cafe.findByIdAndUpdate(id, {...req.body.cafe});
        const imgs = req.files.map(f => ({url: f.path, filename: f.filename})); // Map files array to object
        cafe.images.push(...imgs); // Spread data from array

        if (req.body.deleteImages){
            for (let filename of req.body.deleteImages){
                await cloudinary.uploader.destroy(filename); // Delete image in cloud 
            }
            await cafe.updateOne({$pull:{images:{filename:{$in: req.body.deleteImages}}}});
        }
        await cafe.save();
        req.flash("success", "successfully updated the cafe!");
        res.redirect(`/cafes/${cafe._id}`);
    },

    // Delete specific cafe
    deleteCafe: async (req, res) => {
        const { id } = req.params;
        await Cafe.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted the cafe spot!");
        res.redirect("/cafes");
    }
};
