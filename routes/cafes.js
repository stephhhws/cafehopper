const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Cafe = require("../models/cafe"); // Cafe represents the "Cafe" model, which is defined in the file located at "./models/cafe"
const {isLoggedIn, isAuthor, validateCampground} = require("../middleware")
const cafes = require("../controllers/cafes")
// use multer to accept multipart form
const multer  = require('multer')
const {storage} = require("../cloudinary");
const upload = multer({ storage }); //store in cloudinary 

router.route("/")
    .get(catchAsync(cafes.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(cafes.createCafe));
    //upload.single: just 1 file, upload.array: multiple file 
    // the middleware would add the file attribute to request 


router.get("/new",isLoggedIn, cafes.renderNewForm); 
//need to put before the/:id, otherwise it would be recognised as id 


router.route("/:id")
    .get(catchAsync (cafes.showCafe))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(cafes.updateCafe))
    .delete(isLoggedIn, isAuthor, catchAsync(cafes.deleteCafe));


router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(cafes.renderEditForm))

module.exports = router;