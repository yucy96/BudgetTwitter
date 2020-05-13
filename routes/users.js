var express = require('express');
var router = express.Router();
var Feed = require('../models/feed');
var User = require('../models/user');
var Comment = require('../models/comment');
var middleware = require("../middleware");


async function wait (ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms)
    });
}

/* GET users listing. */
router.get('/:id/index', middleware.isLoggedIn, function(req, res, next) {
    Feed.find({}, function (err, feeds) {
        if (err) {
            req.flash("error", "Fail to load feeds!");
        } else {
            res.render("user/index", {username: req.user.firstname, feeds: feeds});
        }
    });
});

router.get('/:id/profile', middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            req.flash("error", "Can't find the user!");
            res.refirect("back");
        } else {
            res.render('user/profile', {user: user});
      }
    });
});

router.get('/:id/following', middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id).populate("following").exec(function (err, user) {
        if (err) {
            req.flash("error", "Can't load the following users!");
            res.redirect("back")
        } else {
            res.render('user/following', {user: user});
        }
    });
});

router.get('/:id/follower', middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id).populate("follower").exec(function (err, user) {
        if (err) {
            req.flash("error", "Can't load the followers!");
            res.redirect("back")
        } else {
            res.render('user/follower', {user: user});
        }
    });
});

router.put('/:id/profile', middleware.isLoggedIn, function (req, res) {
    if (req.user.following.includes(req.params.id)){
        req.flash("error", "Already followed!");
        res.redirect("back");
    } else {
        User.findById(req.params.id, function (err, followee) {
            if (err) {
                req.flash("error", "Something went wrong");
                res.redirect("/");
            } else {
                req.user.following.push(followee);
                req.user.save();
                followee.follower.push(req.user);
                followee.save();
                req.flash("success", "Successfully followed " + followee.firstname);
                res.redirect("back");
            }
        });
    }
});

router.delete('/:id/profile', middleware.isLoggedIn, function (req, res) {
    if (req.user.following.includes(req.params.id)) {
        User.update(req.user, {$pull: {following: req.params.id}}, function (err) {
            if (err) {
                req.flash("error", "Something went wrong!");
                res.redirect("/");
            } else {
                User.findById(req.params.id, function(err, followee){
                    if (err) {
                        req.flash("error", "Something went wrong!");
                        res.redirect("back");
                    } else {
                        User.update(followee, {$pull: {follower: req.user._id}}, function(err){
                            if (err) {
                                req.flash("error", "Something went wrong!");
                                res.redirect("back");
                            } else {
                                req.flash("success", "Unfollow succeeded!");
                                res.redirect("back")
                            }
                        })
                    }
                });
            }
        });
    } else {
        req.flash("error", "You didn't follow this person!");
        res.redirect("back");
    }
});

router.get('/:id/profile/edit', middleware.checkProfileOwnership, function(req, res){
    res.render("user/edit");
});

router.put('/:id/profile/edit', middleware.checkProfileOwnership, function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function (err, updatedUser) {
        console.log(req.params.id);
        console.log(req.body.user);
        if (err) {
            req.flash("error", "Fail to find the user");
            res.redirect("back");
        } else {
            Feed.updateMany({_id: { $in: updatedUser.feed } }, {$set: {author: req.body.user}}, function(err){
                if (err) {
                    req.flash("error", "Something goes wrong!");
                    res.refirect("back");
                } else {
                    Comment.updateMany({_id: { $in: updatedUser.comment } }, {$set: {author: req.body.user}}, function (e) {
                        if (e) {
                            req.flash("error", "Something goes wrong!");
                            res.refirect("back");
                        } else {
                            console.log(updatedUser);
                            res.redirect("/user/" + req.params.id + "/profile");
                            req.flash("success", "Successfully change your profile settings!");
                        }
                    });
                }
            });

        }
    })
});


/* GET feed listing. */
router.get('/:id/feed', middleware.isLoggedIn, function(req, res) {
    User.findById(req.params.id).populate("feed").exec(function (err, user){
        if (err) {
            req.flash("error", "Fail to find the feeds!");
            res.refirect("back");
        } else {
            res.render("feed/index", {user: user});
        }
    });
    // User.findById(req.params.id, function(err, user){
    //     if (err) {
    //         res.send(err);
    //     } else {
    //         // console.log(user);
    //         Feed.find({}, function (err, feeds) {
    //             if (err) {
    //                 console.log(err);
    //             } else {
    //                 // console.log(feeds);
    //                 res.render("feed/index", {user: user, feeds: feeds});
    //             }
    //         });
    //     }
    // })
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
            req.flash("error", "Fail to make a new post!");
            res.refirect("/user/" + req.user._id + "/feed");
        } else {
            req.user.feed.push(newlyCreated._id);
            req.user.save();
            req.flash("success", "A new feed posted!");
            res.redirect("/user/" + req.user._id + "/feed");
        }
    });
});

router.get('/:id/feed/:feed_id', middleware.isLoggedIn, function(req, res){
    Feed.findById(req.params.feed_id).populate("comment").exec(function (err, feed) {
        if (err) {
            req.flash("error", "Fail to load a feed");
            res.redirect("back")
        } else {
            res.render("feed/show", {user_id: req.params.id, feed: feed});
        }
    });
});

router.delete('/:id/feed/:feed_id', middleware.checkFeedOwnership, function(req, res){
    Feed.findByIdAndRemove(req.params.feed_id, function (err, deletedFeed) {
        if (err) {
            req.flash("error", "Fail to delete the post");
            res.redirect("back");
        } else {
            User.update(req.user, {$pull: {feed: req.params.feed_id}}, function (err){
                if (err) {
                    req.flash("error", "Something went wrong");
                    res.redirect("back");
                } else {
                    Comment.deleteMany( {_id: { $in: deletedFeed.comment } }, function(err){
                        if (err){
                            res.redirect("back");
                        } else {
                            req.flash("success", "A post deleted!");
                            res.redirect("/user/" + req.user._id + "/feed");
                        }
                    });
                }
            });
        }
    })
});

// comment
router.get('/:id/feed/:feed_id/newcomment', middleware.isLoggedIn, function(req, res){
    res.render("comment/new", {user_id: req.params.id, feed_id: req.params.feed_id});
});

router.post('/:id/feed/:feed_id', middleware.isLoggedIn, function(req, res){
    var content = req.body.content;
    var author_id = req.user._id;
    var author = {
        username: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname
    };
    var feed_id = req.params.feed_id;
    var newComment = {content: content, author_id: author_id, author: author, feed_id: feed_id};
    Comment.create(newComment, function(err, newlyCreated){
        if (err){
            req.flash("error", "Fail to comment");
            res.redirect("/user/" + req.params.id + "/feed/" + req.params.feed_id);
        } else {
            Feed.findById(feed_id, function(err, feed){
                if (err) {
                    req.flash("error", "Something went wrong");
                    res.redirect("/user/" + req.params.id + "/feed/" + req.params.feed_id)
                } else {
                    User.findById(author_id, function (e, user) {
                        if (e) {
                            req.flash("error", "Something went wrong");
                            res.redirect("/user/" + req.params.id + "/feed/" + req.params.feed_id)
                        } else {
                            feed.comment.push(newlyCreated._id);
                            feed.save();

                            user.comment.push(newlyCreated._id);
                            user.save();

                            res.redirect("/user/" + req.params.id + "/feed/" + req.params.feed_id);
                        }
                    });
                }
            });
        }
    });
});


module.exports = router;
