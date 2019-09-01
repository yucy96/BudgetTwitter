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
    }
});

module.exports = mongoose.model("Feed", feedSchema);
