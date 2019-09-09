var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
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
    feed_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feed"
    }
});

module.exports = mongoose.model("Comment", commentSchema);