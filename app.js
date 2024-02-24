const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());

// Your Facebook App credentials
const appId = '924604342318163';
const appSecret = '3c61153be83e09ea291e1910becc04e6';

app.get('/', (req, res) => {
    res.send('Hello!')
  })
//http://192.168.1.188:3000/upload-video-reel?videoPath=dsds&description=mycap

// Endpoint to initiate video reel upload
app.get('/upload-video-reel', async (req, res) => {
    const videoPath = req.query.videoPath;
    const description = req.query.description;

    const accessToken = 'EAANI7DlhtFMBO6w5Iwf3vX9iBzZBWvdPuD0Hpj0IZBZAO9CY2R15YJXKhYU9OLfqXwRv7HdFhZBJZBhvwzSUdFHamB9QRoSjpbtmgfIrnzu0C4vvjL8IZBG8zWuzGx633F0iXe5HztVJ8CsoZC9s9wv6rd6QgsH7A7ZCEZBnwEdUS2ZBhu4zZBEcGNEFD3hZAdA2Du2h6jShwaVJW9Hri07kDprhtZAAZD';
    const pageId = '1570540453218688'; 

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

        // const longLivedAccessToken = exchangeTokenResponse.data.access_token;
        const longLivedAccessToken ='EAANI7DlhtFMBO2jdLIcUvhYhZCbanrcusEQA3eWwhWxUn11kclCBUyiBFV2LHGoVoAQQB9AKljGZApzCWZAKg8dfny4Gazm0XHUzd4CfnDH3vaglKZCTcyO5egvZAmTZCf2sbWcSuH1V64tRZBIP0jIYw3YFgAvZAZCRIdY64qsodX6G7VjKRBPZBhklTZCRD1wutsZD';
      
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
 
        // Step 2: Upload the video
        console.log(video_id);
  

        // axios.get(`https://8557-80-90-84-209.ngrok-free.app/IMG_6303_1.mp4`, null, {
        // headers: {
        //     'ngrok-skip-browser-warning': true,
        // },
        // })
        // .then(response => {
        //     console.log('ok:');
        //   })
        //   .catch(error => {
        //     console.error('Error:', error);
        //   });
         
       const response = await axios.post(`https://rupload.facebook.com/video-upload/v19.0/${video_id}`, null, {
        headers: {
            'Authorization': `OAuth ${longLivedAccessToken}`,
            'file_url': 'https://paping.loophole.site/al_c.mp4',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        });

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
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});