var express = require('express');
var router = express.Router();
var Feed = require('../models/feed');
var User = require('../models/user');
var middleware = require("../middleware");

/* GET users listing. */
router.get('/:id/index', middleware.isLoggedIn, function(req, res, next) {
    Feed.find({}, function (err, feeds) {
        if (err) {
            console.log(err);
        } else {
            // console.log(feeds);
            res.render("user/index", {username: req.user.firstname, feeds: feeds});
        }
    });
});

router.get('/:id/profile', middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id).populate("following").exec(function (err, user) {
        if (err) {
            res.send(err);
        } else {
            res.render('user/profile', {user: user});
      }
    });
});

router.get('/:id/following', middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id).populate("following").exec(function (err, user) {
        if (err) {
            res.send(err);
        } else {
            res.render('user/following', {user: user});
        }
    });
});

router.get('/:id/follower', middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id).populate("follower").exec(function (err, user) {
        if (err) {
            res.send(err);
        } else {
            res.render('user/follower', {user: user});
        }
    });
});

router.put('/:id/profile', middleware.isLoggedIn, function (req, res) {
    if (req.user.following.includes(req.params.id)){
        req.flash("error", "Already followed!");
        console.log("Already followed!");
        res.redirect("back");
    } else {
        User.findById(req.params.id, function (err, followee) {
            if (err) {
                req.flash("error", "Something went wrong");
                console.log(err);
                res.redirect("/");
            } else {
                req.user.following.push(followee);
                req.user.save();
                followee.follower.push(req.user);
                followee.save();
                req.flash("success", "Successfully followed");
                console.log("Successfully followed" + req.user.following);
                res.redirect("back");
            }
        });
    }
});

router.delete('/:id/profile', middleware.isLoggedIn, function (req, res) {
    if (req.user.following.includes(req.params.id)) {
        User.update(req.user, {$pull: {following: req.params.id}}, function (err) {
            if (err) {
                console.log(err);
                res.redirect("/");
            } else {
                User.findById(req.params.id, function(err, followee){
                    if (err) {
                        console.log(err);
                        res.redirect("back");
                    } else {
                        User.update(followee, {$pull: {follower: req.user._id}}, function(err){
                            if (err) {
                                console.log(err);
                                res.redirect("back");
                            } else {
                                console.log("success!");
                                res.redirect("back")
                            }
                        })
                    }
                });
            }
        });
    } else {
        console.log("You didn't follow this person!");
        req.flash("error", "You didn't follow this person!");
        res.redirect("back");
    }
});

router.get('/:id/profile/edit', function(req, res){
    res.render("user/edit");
});

router.put('/:id/profile/edit', function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function (err, updatedUser) {
        if (err) {
            res.redirect("back");
        } else {
            Feed.updateMany({_id: { $in: updatedUser.feed } }, {$set: {author: updatedUser}}, function(err){
                if (err) {
                    res.send(err);
                } else {
                    res.redirect("/user/" + req.params.id + "/profile");
                }
            });

        }
    })
});

// router.get('/:id/feed', function (req, res) {
//   res.render("feed", {username: req.user.firstname})
// });

/* GET feed listing. */
router.get('/:id/feed', middleware.isLoggedIn, function(req, res) {
    User.findById(req.params.id, function(err, user){
        if (err) {
            res.send(err);
        } else {
            // console.log(user);
            Feed.find({}, function (err, feeds) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log(feeds);
                    res.render("feed/index", {user: user, feeds: feeds});
                }
            });
        }
    })
});

router.get('/:id/feed/new', middleware.isLoggedIn, function (req, res) {
    res.render("feed/new");
});

router.post('/:id/feed', middleware.isLoggedIn, function (req, res) {
    var content = req.body.content;
    var author_id = req.user._id;
    var author = {
        username: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname
    };
    var newFeed = {content: content, author_id: author_id, author: author};
    Feed.create(newFeed, function(e, newlyCreated){
        if (e){
            console.log(e);
        } else {
            req.user.feed.push(newlyCreated._id);
            req.user.save();
            res.redirect("/user/" + req.user._id + "/feed");
        }
    });
});

router.delete('/:id/feed/:feed_id', middleware.isLoggedIn, function(req, res){
    Feed.findByIdAndRemove(req.params.feed_id, function (err, deletedFeed) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            User.update(req.user, {$pull: {feed: req.params.feed_id}}, function (err){
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    res.redirect("back");
                }
            });
        }
    })
});


module.exports = router;
