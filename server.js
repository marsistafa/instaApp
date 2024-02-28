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
app.use(bodyParser.urlencoded({ extended: true }));

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

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: config.facebookAuth.clientID,
    clientSecret: config.facebookAuth.clientSecret,
    callbackURL: config.facebookAuth.callbackURL
  }, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

app.use('/', routes);


// Route to handle form submission
app.post('/apply-settings', (req, res) => {
  const { pages, applyToAll } = req.body;
  const userID = 1; // Example user ID, replace with actual user ID

  pages.forEach((page, index) => {
    const pageID = page.id;
    const maxPostsPerDay = page.postsLimit;
    let scheduleTimes = page.scheduleTimes || [];

    // Apply first page settings to all if selected
    if (applyToAll && index === 0) {
      scheduleTimes = pages[0].scheduleTimes;
    }

    // Update or insert into Settings table
    const settingsQuery = 'REPLACE INTO Settings (UserID, PageID, MaxPostsPerDay, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())';
    connection.query(settingsQuery, [userID, pageID, maxPostsPerDay], (err) => {
      if (err) throw err;

      // Handle schedule times for each post
      scheduleTimes.forEach((time, idx) => {
        const postQuery = 'INSERT INTO Posts (PageID, UserID, ScheduledTime, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())';
        connection.query(postQuery, [pageID, userID, time], (err) => {
          if (err) throw err;
          // Successfully saved post schedule
        });
      });
    });
  });

  res.send('Settings applied successfully');
});



app.listen(port, () => {
  console.log('App listening on port ' + port);
});