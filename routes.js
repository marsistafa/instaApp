const passport = require('passport');
const express = require('express');
var router = express.Router();
const axios = require('axios');

router.get('/', function (req, res) {
  res.render('pages/index.ejs'); // load the index.ejs file
});

router.get('/privacy', function (req, res) {
  res.render('pages/privacy.ejs'); 
});

router.get('/profile', function (req, res) {
  res.render('pages/profile.ejs', {
    user: req.user 
  });
});
router.get('/fetch-pages', function(req, res) {
  const user = req.user; 
  const accessToken = 'EAANI7DlhtFMBO7yqEdMSXVrba099qUlrLIBZCrgdIEHsSVZCv2aYWvnL10D8tgLjeRwPgm00fiuNobHyN3MGpTvfOugZCm62wWRam8hNLZAKjQyYwlD4f8quXGYDqwnfIZAU0ZCkQZBIO0L9qqTTG0nU43S1HrKJdkFCmHIm0DnMSotZBYK33tujDUjKPJvLKrFZCW4q2YS80jTFlF5Wv'; // Assuming you've stored the access token in the user session object

  const url = `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`;

  axios.get(url)
    .then(response => {
      console.log(response.data); // Log the whole body to see the structure

      // Send the data to your frontend or handle it as needed
      res.render('pages/userPages', { pages: response.data.data });
    })
    .catch(error => {
      // Handle errors
      console.error("Failed to fetch user's pages:", error);
      res.send("Failed to fetch user's pages.");
    });
});

router.get('/settings', function (req, res) {
  res.render('pages/settings.ejs');
});

router.get('/error', function (req, res) {
  res.render('pages/error.ejs');
});

router.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/error'
  }));


  // router.get('/auth/facebook/callback',
  // passport.authenticate('facebook', { failureRedirect: '/login' }),
  // function(req, res) {
  //   // Successful authentication, redirect home.
  //   console.log("Authentication successful");
  //   res.redirect('/profile');
  // });

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next) {
  
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

module.exports = router;