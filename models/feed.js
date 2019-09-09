var mongoose = require("mongoose");

var feedSchema = new mongoose.Schema({
    content: String,
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    author: {
        username: String,
        firstname: String,
        lastname: String
    },
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

module.exports = mongoose.model("Feed", feedSchema);
