const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const routes = require('./routes.js');
const config = require('./config');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

app.set('view engine', 'ejs');

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

app.use(passport.initialize());
app.use(passport.session());

const port = 3000;

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({
    extended: true
}));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// MySQL connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'phpmyadmin',
    password: 'Alpha()-=//',
    database: 'insta_app'
});

connection.connect();

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: config.facebookAuth.clientID,
    clientSecret: config.facebookAuth.clientSecret,
    callbackURL: config.facebookAuth.callbackURL
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

app.use('/', routes);

app.delete('/delete-scheduled-post/:postId', async (req, res) => {
    const {
        postId
    } = req.params;
    try {
        // Assuming you have a function or a way to delete the post by ID
        connection.execute('DELETE FROM Posts WHERE id = ?', [postId]);
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Failed to delete post:', error);
        res.status(500).json({
            error: 'Failed to delete the post'
        });
    }
});

app.post('/apply-settings', (req, res) => {
    const {
        pages,
        applyToAll
    } = req.body;
    const userID = req.user.id;

    let firstPageSettings = null;

    pages.forEach((page, index) => {
        const pageID = page.id;
        const Content = page.caption;
        let maxPostsPerDay = page.postsLimit || 0; // Default to 0 if not provided
        let scheduledTimes = page.scheduleTimes || []; // Assume scheduleTimes are now part of each page object

        // If "Apply to All" is checked, use the first page's settings for all pages
        if (applyToAll === 'on') {
            if (index === 0) {
                firstPageSettings = {
                    maxPostsPerDay,
                    scheduledTimes
                };
            } else {
                // Apply the first page's settings to subsequent pages
                maxPostsPerDay = firstPageSettings.maxPostsPerDay;
                scheduledTimes = firstPageSettings.scheduledTimes;
            }
        }


        // Update or insert into Settings table
        const settingsQuery = 'REPLACE INTO Settings (UserID, PageID, MaxPostsPerDay, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())';
        connection.query(settingsQuery, [userID, pageID, maxPostsPerDay], (err) => {
            if (err) {
                console.error('Error updating settings:', err);
                return res.status(500).send('An error occurred while updating settings.');
            }

            const pageQuery = 'REPLACE INTO Pages (PageID, UserID, Content, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())';
            connection.query(pageQuery, [pageID, userID, Content], (err) => {
                if (err) {
                    console.error('Error saving page:', err);
                    // Consider accumulating errors to handle them after the loop
                }
            });

            // Insert or update scheduled times for each post
            scheduledTimes.forEach((time) => {
                if (!time) return; // Skip empty or undefined times
                const postQuery = 'INSERT INTO Posts (PageID, UserID, Content, ScheduledTime, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())';
                connection.query(postQuery, [pageID, userID, time], (err) => {
                    if (err) {
                        console.error('Error saving scheduled post:', err);
                        // Consider accumulating errors to handle them after the loop
                    }
                });
            });
        });
    });

    // Redirect with client-side script for alert
    res.send(`<script>alert('Settings applied successfully'); window.location.href = '/settings';</script>`);
});


app.listen(port, () => {
    console.log('App listening on port ' + port);
});