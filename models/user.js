const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// this would add on to our schema a username & password 
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema)
