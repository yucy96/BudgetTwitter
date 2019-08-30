var mongoose = require("mongoose");

var feedSchema = new mongoose.Schema({
    content: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        firstname: String
    }
});

module.exports = mongoose.model("Feed", feedSchema);
