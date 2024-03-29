if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express");
const path = require("path"); 
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const { ppid } = require("process");
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require('express-mongo-sanitize'); 
const helmet = require("helmet");
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL
const app = express();

const cafesRoute = require("./routes/cafes")
const reviewsRoute = require("./routes/reviews")
const userRoutes = require("./routes/users");

// Mongo setup
app.use(mongoSanitize({
    replaceWith: '_'
}))
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
store.on("error", function(e) {
    console.log("sesion store error", e)
})

//Mongoose setup
mongoose.connect(dbUrl) 
    .then(() => {
        console.log("Connection open!")
    })
    .catch(err => {
        console.log("Connection error!")
        console.log(err)
    });

// Express SetUp
app.engine("ejs", ejsMate) 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")) 

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));

//Session setup
const sessionConfig = {
    store,
    name: "session",
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //extra security
        //secure: true, //https secure 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expiratio date for the cookie
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());

//Set local variables middleware
app.use((req, res, next) =>{
    res.locals.currentUser = req.user; 
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

//Security Setup
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/drk5cctzj/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/drk5cctzj/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://fonts.gstatic.com", 
    "https://res.cloudinary.com/drk5cctzj/"
];

const fontSrcUrls = [ 
    "https://res.cloudinary.com/drk5cctzj/", 
    "https://fonts.gstatic.com"
];

app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drk5cctzj/", 
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/drk5cctzj/" ],
            childSrc   : [ "blob:" ]
        }
    })
);
 
app.use(
    helmet.crossOriginEmbedderPolicy({ 
        policy: "credentialless" 
    }));

//Define Routes

app.use("/cafes", cafesRoute);
app.use("/cafes/:id/reviews", reviewsRoute)
app.use("/", userRoutes)

app.get("/", (req, res) => {
    res.render("home")
})

// Error handling
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found!", 404)) 
}) 

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = "Oh no, Something went wrong!"
    res.status(statusCode).render("error", {err});
})

// start server
app.listen(8800, () => {
    console.log("Serving on port 8800");
})

