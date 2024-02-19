const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello Worlddd!')
  })

// Endpoint to initiate video reel upload
app.get('/upload-video-reel', async (req, res) => {
    const videoPath = req.query.videoPath;
    const description = req.query.description;

    const accessToken = 'EAANVvne9rUwBOz13IgUC1P8Tl0YMbS9DDZAtp9g2CjcZCJB72GVOYfUdlcxw5A4kcRuZApZBxS4ar8hC8N4ZApFgueAJvZCmNjWSNIxBFZCl6olkOD9rLR5oIXynoZCj4kZA4AYP44rWcBnykDPfV8s3atk04MuTl6rbBb3QF4m6dCaIGTSK15Rc0Qq9yP1ZCZA3LZCPexmPN835TbRJifyz1emwti4ZD';
    const pageId = '160868800643701'; 

    try {
        // Step 1: Start a video upload session
        const startUploadResponse = await axios.post(
            `https://graph.facebook.com/v19.0/${pageId}/video_reels`,
            {
                upload_phase: 'start',
                // file_size: fs.statSync(videoPath).size,
                access_token: accessToken,
            }, {
                headers: {
                  'Content-Type': 'application/json',
                },
            });
            // console.log(startUploadResponse);

        
        const { video_id } = startUploadResponse.data;
 
        // Step 2: Upload the video file in chunks (for simplicity, this assumes the video fits in one chunk)
        // const videoData = fs.createReadStream(videoPath);
        // const fileSize = fs.statSync(videoPath).size;
            console.log(video_id);
       const response = await axios.post(`https://rupload.facebook.com/video-upload/v19.0/${video_id}`, null, {
      headers: {
        'Authorization': 'OAuth EAANVvne9rUwBOz13IgUC1P8Tl0YMbS9DDZAtp9g2CjcZCJB72GVOYfUdlcxw5A4kcRuZApZBxS4ar8hC8N4ZApFgueAJvZCmNjWSNIxBFZCl6olkOD9rLR5oIXynoZCj4kZA4AYP44rWcBnykDPfV8s3atk04MuTl6rbBb3QF4m6dCaIGTSK15Rc0Qq9yP1ZCZA3LZCPexmPN835TbRJifyz1emwti4ZD',
        'file_url': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/09/Frozen_drop.webm/Frozen_drop.webm.720p.vp9.webm',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // console.log(response.data);

        const formData = new FormData();
        formData.append('upload_phase', 'finish');
        // formData.append('video_file_chunk', videoData, { filename: 'funnyreels.mp4' });

        // console.log('formdata:',formData);
        const publishResponse = await axios.post(
            `https://graph.facebook.com/v19.0/${pageId}/video_reels`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
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
        // Step 3: Finish the upload session
        // await axios.post(`https://graph.facebook.com/v19.0/${pageId}/video_reels`, {
        //     upload_phase: 'FINISH',
        //     // upload_session_id: upload_session_id,
        //     access_token: accessToken,
       
        // });
     
        // Step 4: Publish the reel using the uploaded video
        // const publishResponse = await axios.post(
        //     `https://graph.facebook.com/v19.0/${pageId}/video_reels`,
        //     {
        //         video_id: video_id,
        //         description: description,
        //         access_token: accessToken,
        //     }
        // );

        res.json({ success: true, video_id: video_id, publishResponse: publishResponse.data });
    } catch (error) {
        console.error('Error uploading video reel:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to upload video reel', details: error.response ? error.response.data : error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});