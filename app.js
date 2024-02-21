const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello!')
  })

// Endpoint to initiate video reel upload
app.get('/upload-video-reel', async (req, res) => {
    const videoPath = req.query.videoPath;
    const description = req.query.description;

    const accessToken = 'EAANVvne9rUwBOZCDzvXEoP4bFblvWcMVx2q18RvmouLhYE22jKPbymYJTHP0Pvh9zdShVbEpfuiSRSuZCmyIVMYVlBJqgsHVraerkykNAlHc9JQfOZAEZAD3VIhXWTZChpnXTtbeprdzgfEPVKBzumFy6ZBXWjKiZAdTZBAXLHeAXsCx8Ecam74fRCoIDtwsBqXqt3XkMQY5SEc5T76IC8p1AzWL';
    const pageId = '160868800643701'; 

    try {
        // Step 1: Start a video upload session
        const startUploadResponse = await axios.post(
            `https://graph.facebook.com/v19.0/${pageId}/video_reels`,
            {
                upload_phase: 'start',
                access_token: accessToken,
            }, {
                headers: {
                  'Content-Type': 'application/json',
                },
            });
  

        
        const { video_id } = startUploadResponse.data;
 
        // Step 2: Upload the video
            console.log(video_id);

        axios.get(`https://8557-80-90-84-209.ngrok-free.app/IMG_6303_1.mp4`, null, {
        headers: {
            'ngrok-skip-browser-warning': true,
        },
        })
        .then(response => {
            console.log('ok:');
          })
          .catch(error => {
            console.error('Error:', error);
          });

       const response = await axios.post(`https://rupload.facebook.com/video-upload/v19.0/${video_id}`, null, {
        headers: {
            'Authorization': 'OAuth EAANVvne9rUwBOZCDzvXEoP4bFblvWcMVx2q18RvmouLhYE22jKPbymYJTHP0Pvh9zdShVbEpfuiSRSuZCmyIVMYVlBJqgsHVraerkykNAlHc9JQfOZAEZAD3VIhXWTZChpnXTtbeprdzgfEPVKBzumFy6ZBXWjKiZAdTZBAXLHeAXsCx8Ecam74fRCoIDtwsBqXqt3XkMQY5SEc5T76IC8p1AzWL',
            'file_url': 'https://8557-80-90-84-209.ngrok-free.app/IMG_6303_1.mp4',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        });

    
        console.log(response.data);

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
                    access_token: accessToken,
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