const express = require("express");
const router = express.Router();
const passport= require("passport");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require('../middleware');
const users = require("../controllers/users");


router.route("/register")
    .get(users.renderRegister)
    .post(catchAsync(users.register));


router.route("/login")
    .get(users.renderLogin)
    .post(
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    // Now we can use res.locals.returnTo to redirect the user after login
    users.login);


/* by using the storeReturnTo middleware function, we can save the returnTo value to res.locals
before passport.authenticate() clears the session and deletes req.session.returnTo.
This enables us to access and use the returnTo value(via res.locals.returnTo) later in the middleware chain
so that we can redirect users to the appropriate page after they have logged in */

//passport.authenticate  is the middleware
//local can be changed to google/ facebook etc later
// router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), (req, res) => { 
//     req.flash("success", "welcome back!");
//     res.redirect("/cafes");
// })

router.get("/logout", users.logout);


module.exports = router;