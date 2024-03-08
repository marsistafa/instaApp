const passport = require('passport');
const express = require('express');
var router = express.Router();
const axios = require('axios');
const config = require('./config');
const {
    Setting,
    Post,
    User
} = require('./models');

router.get('/', function(req, res) {
    res.render('pages/index.ejs');
});

router.get('/privacy', function(req, res) {
    res.render('pages/privacy.ejs');
});

router.get('/profile', function(req, res) {
    res.render('pages/profile.ejs', {
        user: req.user
    });
});
router.get('/fetch-pages', isLoggedIn, function(req, res) {
    const user = req.user;
    const accessToken = config.facebookAuth.access_token;

    const url = `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`;

    axios.get(url)
        .then(response => {
            console.log(response.data);
            res.render('pages/userPages', {
                pages: response.data.data
            });
        })
        .catch(error => {
            // Handle errors
            console.error("Failed to fetch user's pages:", error);
            res.send("Failed to fetch user's pages.");
        });
});



router.get('/settings', isLoggedIn, async (req, res) => {
   
    const accessToken = config.facebookAuth.access_token;
    const url = `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`;

    try {
        const facebookProfile = req.user;
        let user = await User.findOne({
            where: {
                UserID: facebookProfile.id
            }
        });

        // If the user doesn't exist, create a new user
        if (!user) {
            user = await User.create({
                UserID: facebookProfile.id,
                Username: facebookProfile.displayName,
                Email: facebookProfile.email??'',
                Role: 'user' // Set the default role, you can adjust this based on your requirements
            
            });
        }
        
        req.user = user;
        
        const userID = user.userID;
        const fbResponse = await axios.get(url);
        const pages = fbResponse.data.data;

        // Fetch settings for these pages from your DB
        const settingsPromise = pages.map(async page => {
            const setting = await Setting.findOne({
                where: {
                    PageID: page.id
                }
            });
            const posts = await Post.findAll({
                where: {
                    PageID: page.id
                }
            });
            return {
                ...page,
                setting,
                posts
            };
        });

        const pagesWithSettings = await Promise.all(settingsPromise);
        // console.log(pagesWithSettings);
        res.render('pages/settings.ejs', {
            pages: pagesWithSettings
        });
    } catch (error) {
        console.error("Failed to fetch user's pages or settings:", error);
        res.send("Failed to fetch user's pages.");
    }
});


router.get('/error', function(req, res) {
    res.render('pages/error.ejs');
});

router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
})
);

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/error'
    })
);


router.get('/logout', function(req, res) {
    req.logout(function(err) { // Add a callback
        if (err) { 
            return next(err); // Handle potential errors 
        } 
        res.redirect('/');
    }); 
});


router.post('/update-settings', isLoggedIn, async (req, res) => {
    const {
        settings
    } = req.body;

    try {
        settings.forEach(async (setting) => {
            const {
                pageId,
                maxPostsPerDay,
                scheduleTimes
            } = setting;

            // Update the max posts per day in the Settings table
            await Setting.update({
                MaxPostsPerDay: maxPostsPerDay
            }, {
                where: {
                    PageID: pageId,
                    UserID: req.user.id
                }
            });

            // Update scheduled times in the Posts table
            // This is a simplified approach; you might need a more sophisticated way to match and update posts
            scheduleTimes.forEach(async (time, index) => {
                await Posts.update({
                    ScheduledTime: time
                }, {
                    where: {
                        PageID: pageId,
                        UserID: req.user.id,
                        id: index + 1
                    }
                });
            });
        });

        res.redirect('/settings');
    } catch (error) {
        console.error("Failed to update settings:", error);
        res.send("Failed to update settings.");
    }
});



function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

module.exports = router;