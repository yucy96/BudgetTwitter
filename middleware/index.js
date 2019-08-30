var User = require("../models/user");

var middlewareObj = {};

// middlewareObj.checkCampgroundOwnership = function(req, res, next){
//     if (req.isAuthenticated()) {
//         Feed.findById(req.params.id, function (err, foundCampground) {
//             if (err){
//                 req.flash("error", "Feed not found");
//                 res.redirect("back");
//             } else {
//                 if (foundCampground.author.id.equals(req.user._id)) {
//                     next();
//                 } else {
//                     req.flash("error", "You don't have permission to do that");
//                     res.redirect("back");
//                 }
//             }
//         });
//     } else {
//         req.flash("error", "You need to be logged in to do that!");
//         res.redirect("back");
//     }
// };


middlewareObj.isLoggedIn = function(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
};

module.exports = middlewareObj;