var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,
    following: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
    }],
    follower: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    feed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feed"
    }]
});

userSchema.plugin(passportLocalMongoose, {
    selectFields: 'firstname lastname username password following follower feed'
});

module.exports = mongoose.model("User", userSchema);