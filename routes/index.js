var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Feed = require('../models/feed');
var middleware = require('../middleware');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/register', function (req, res) {
  res.render('register');
});

router.post("/register", function (req, res) {
  var newUser = new User({username: req.body.user.username, firstname: req.body.user.firstname,
    lastname: req.body.user.lastname});
  User.register(newUser, req.body.user.password, function (err) {
    if (err){
      req.flash("error", err.message);
      return res.redirect("/register");
    }
    else {
      req.flash("success", "You successfully registered!");
      res.redirect("/");
    }
  },
    // passport.authenticate("local", function (err, user, info) {
  //   console.log(err);
  //   console.log(user);
  //   console.log(info);
  //   if (err) {
  //     res.status(401).send(err);
  //   } else if (!user) {
  //     res.status(401).send(info);
  //   } else {
  //     res.send("campgrounds");
  //   }
  //   })(req, res)
  )
});

router.get('/login', function(req, res){
  res.render('login');
});

router.post("/login", passport.authenticate("local",
    {failureRedirect: '/login'}), function(req, res){
  req.flash("success", "You logged in!");
  res.redirect("/user/" + req.user._id + "/index");
});

router.get("/logout", middleware.isLoggedIn, function (req, res) {
  req.logout();
  req.flash("success", "You logged out!");
  res.redirect("/");
});

module.exports = router;
