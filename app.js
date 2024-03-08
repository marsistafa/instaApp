const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const mysql = require('mysql2/promise');
const config = require('./config');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Your Facebook App credentials
const appId = config.facebookAuth.clientID;
const appSecret = config.facebookAuth.clientSecret;


// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Placeholder for database connection
let dbConnection;

// Function to establish a database connection
async function connectToDatabase() {
    try {
        dbConnection = await mysql.createConnection(dbConfig);
        console.log('Successfully connected to the database.');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}

connectToDatabase();

// Function to fetch scheduled posts from the database
async function fetchScheduledPosts() {
    // Calculate time margin
    const margin = 5; // Margin in minutes
    const currentTime = new Date();
    const beforeTime = new Date(currentTime.getTime() - margin * 60000).toISOString().slice(0, 19).replace('T', ' ');
    const afterTime = new Date(currentTime.getTime() + margin * 60000).toISOString().slice(0, 19).replace('T', ' ');
    // console.log(beforeTime);
    // console.log(afterTime);
    const query = `
          SELECT * FROM Posts 
          WHERE ScheduledTime BETWEEN ? AND ? 
          AND Published = FALSE
      `;
    const [rows] = await dbConnection.execute(query, [beforeTime, afterTime]);
    return rows;
}

const axiosInstance = axios.create();

async function getRandomFileUrl(pageId) {
    try {
        // Fetch the user information based on the pageId
        const userQuery = `
            SELECT u.username
            FROM Users u
            JOIN Pages p ON u.id = p.userid
            WHERE p.pageid = ?;
        `;
        const [userRows] = await dbConnection.execute(userQuery, [pageId]);

        if (userRows.length === 0) {
            throw new Error(`User not found for pageId: ${pageId}`);
        }

        const username = userRows[0].username;

        // Construct the video directory path using the username
        const videoDirectory = `${username}/${pageId}/Converted/`;
        if (!fs.existsSync(videoDirectory)) {
            await createDirectory(videoDirectory); // Call directory creation function
        }
        // Fetch the list of videos for the given user
        // const videoList = fs.readdirSync(`https://marstarrallo.loophole.site/files/${videoDirectory}`);
        // Choose a random video from the list
        const randomVideo = 'vid1 - Copy_C.mp4';//videoList[Math.floor(Math.random() * videoList.length)];
        
        const response = await axiosInstance.get(`https://marstarrallo.loophole.site/files/${videoDirectory}${randomVideo}`);

        return response.data.fileUrl;
    } catch (error) {
        console.error('Error fetching random file URL:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch random file URL');
    }
}

async function createDirectory(path) {
    try {
        const response = await axios.post('https://marstarrallo.loophole.site/filedev', {
            action: "create",
            type: "folder",
            path: path // Assuming the provided path is correct
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        console.log('Directory created:', response.data);
    } catch (error) {
        console.error('Error creating directory:', error);
        
    }
}

const fetchRandomDescription = async (pageId) => {
    const query = `
      SELECT content FROM pages
      WHERE page_id = ?
      ORDER BY RAND()
      LIMIT 1;
  `;
    const [rows] = await dbConnection.execute(query, [pageId]);
    const randomContent = rows[0].content;

    // Assuming you want to use a random slice of 20 characters
    const randomSlice = randomContent.slice(Math.floor(Math.random() * (randomContent.length - 20)), Math.floor(Math.random() * randomContent.length));

    return randomSlice;
};



async function publishPost(post) {

        console.log(post);

    const userAccessToken = config.facebookAuth.longliveAccessToken;
    const pageId = post.PageID;

    try {

        // Step 0: Exchange short-lived token for long-lived token
        // const exchangeTokenResponse = await axios.get(
        //     `https://graph.facebook.com/v19.0/oauth/access_token`,
        //     {
        //         params: {
        //             grant_type: 'fb_exchange_token',
        //             client_id: appId,
        //             client_secret: appSecret,
        //             fb_exchange_token: accessToken,
        //         },
        //     }
        // );

        const resp = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`);
        const page = resp.data.data.find(page => page.id == pageId);
            // console.log(resp.data.data);
        if (!page) {
            throw new Error(`Page with ID ${pageId} not found for the user.`);
        }

        const pageAccessToken = page.access_token;
       
        const fileUrl = await getRandomFileUrl(pageId);
        const longLivedAccessToken = pageAccessToken;

        // Step 1: Start a video upload session
        const startUploadResponse = await axios.post(
            `https://graph.facebook.com/v19.0/${pageId}/video_reels`, {
                upload_phase: 'start',
                access_token: longLivedAccessToken,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        const {
            video_id
        } = startUploadResponse.data;
         console.log(fileUrl);
        // Step 2: Upload the video  
        const response = await axios.post(`https://rupload.facebook.com/video-upload/v19.0/${video_id}`, null, {
            headers: {
                'Authorization': `OAuth ${longLivedAccessToken}`,
                'file_url': fileUrl,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        // Step 3: Publish the reel using the uploaded video

        const description = await fetchRandomDescription(pageId);

        const publishResponse = await axios.post(
            `https://graph.facebook.com/v19.0/${pageId}/video_reels`,
            null, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                params: {
                    video_id: video_id,
                    upload_phase: 'finish',
                    video_state: 'PUBLISHED',
                    description: description,
                    access_token: longLivedAccessToken,
                },
            }
        );
        const updateQuery = 'UPDATE Posts SET Published = TRUE WHERE id = ?';
        await dbConnection.execute(updateQuery, [post.id]);

        console.log(`Post ${post.id} published successfully and marked as published in database.`);

        // res.json({ success: true, video_id: video_id, publishResponse: publishResponse.data });
    } catch (error) {
        console.error('Error uploading video reel:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Failed to upload video reel',
            details: error.response ? error.response.data : error.message
        });
    }
}

cron.schedule('* * * * *', async () => {
    console.log('Checking for scheduled posts to publish...');
    const scheduledPosts = await fetchScheduledPosts();
    for (const post of scheduledPosts) {
        try {
            await publishPost(post);
            // Here, add logic to mark the post as published in your database to prevent republishing
        } catch (error) {
            console.error(`Error publishing post ${post.id}:`, error);
        }
    }
});

app.get('/', (req, res) => {
    res.send('Scheduled Posts Publisher is running.');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});