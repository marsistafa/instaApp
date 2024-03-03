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
    port:3307
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
    const [rows] = await dbConnection.execute('SELECT * FROM Posts WHERE ScheduledTime <= NOW()');
    return rows;
    }

async function publishPost(post) {
        console.log(post);
        // const videoPath = req.query.videoPath;
        // const description = req.query.description;
    
        const accessToken = config.facebookAuth.access_token;
        const pageId = '276676628851996'; 
    
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
    
            const longLivedAccessToken = accessToken;
          
            // Step 1: Start a video upload session
            const startUploadResponse = await axios.post(
                `https://graph.facebook.com/v19.0/${pageId}/video_reels`,
                {
                    upload_phase: 'start',
                    access_token: longLivedAccessToken,
                }, {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                });
    
            const { video_id } = startUploadResponse.data;
                console.log(video_id);
            // Step 2: Upload the video  
           const response = await axios.post(`https://rupload.facebook.com/video-upload/v19.0/${video_id}`, null, {
            headers: {
                'Authorization': `OAuth ${longLivedAccessToken}`,
                'file_url': 'https://pandafiles.loophole.site/instaApp/files/GH4VjRlMJO__xH0BAP_NSsIOla13bmdjAAAF.mp4',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            });
              console.log("second res:",response);
            // const localFilePath = path.join(__dirname, 'instaApp', 'files', 'GH4VjRlMJO__xH0BAP_NSsIOla13bmdjAAAF.mp4');

            // // Read the local file as a buffer
            // const fileBuffer = fs.readFileSync(localFilePath);

            // // Make the axios request
            // try {
            //   const response = await axios.post(
            //     `https://rupload.facebook.com/video-upload/v19.0/${video_id}`,
            //     fileBuffer,  // Use the file buffer as the request body
            //     {
            //       headers: {
            //         'Authorization': `OAuth ${longLivedAccessToken}`,
            //         'Content-Type': 'multipart/form-data',  // Use 'multipart/form-data' for file uploads
            //       },
            //     }
            //   );
            //   console.log(response.data);
            // } catch (error) {
            //   console.error('Error uploading video:', error.response ? error.response.data : error.message);
            // }
    
            // Step 3: Publish the reel using the uploaded video
            const publishResponse = await axios.post(
                `https://graph.facebook.com/v19.0/${pageId}/video_reels`,
                null,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data', 
                    },
                    params: {
                        video_id: video_id,
                        upload_phase: 'finish',
                        video_state:'PUBLISHED',
                        description: description,
                        access_token: longLivedAccessToken,
                    },
                }
            );        
                console.log(publishResponse);
    
            res.json({ success: true, video_id: video_id, publishResponse: publishResponse.data });
        } catch (error) {
            console.error('Error uploading video reel:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Failed to upload video reel', details: error.response ? error.response.data : error.message });
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