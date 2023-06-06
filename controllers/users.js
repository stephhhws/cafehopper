const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async(req, res) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err =>{ //when user sign up, automatically log in (built-in passport method)
            if (err) {
                return next(err); 
            }
            req.flash("success", "Welcome to cafe hopper!");
            res.redirect("/cafes");
        });
        
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("register");
    }
};

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/cafes'; // if its empty, return to /cafes 
    // delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) { // build-in passport function on req
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/cafes');
    });
};
