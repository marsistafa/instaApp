const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

const accessToken = "EAATvPyRhL0MBO8fiq3cuLXLDiu9ghUJqPdwTRcu1hoJV3HRVNXvKaMzZCuUtv6tNIBzxsFhXfx8WZBluXq3z02HIW1PBZB2d41WZC4qAXiKmMLIxqgCU9ZANCmWF0jy2WcQ7hS9PcVvVg5rFODoIo9RLuLtg1ZCEsmjfZCYtt9laUfeLDIzFcZBZCNdoZD";
const instagramUserId = "17841449973104506";

app.get('/upload-ig-reel', async (req, res) => {
    const reelUrl = "https://alphanodeserve889.loophole.site/al_c.mp4";
    const caption = "Trust the process #hashtag";

    const postUrl = `https://graph.facebook.com/${instagramUserId}/media?video_url=${encodeURIComponent(reelUrl)}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}&media_type=REELS&share_to_feed=true`;

    const postOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    };

    try {
        const fetch = (await import('node-fetch')).default;
        const uploadResponse = await fetch(postUrl, postOptions);
        const uploadResult = await uploadResponse.json();

        if (uploadResult.error) {
            console.error('Error uploading the reel:', uploadResult.error);
            res.status(500).send('Error uploading the reel');
            return;
        }

        console.log('Upload successful:', uploadResult);
        const creationId = uploadResult.id;

        // Function to check the container's status
        async function checkContainerStatus(creationId) {
            const statusUrl = `https://graph.facebook.com/${creationId}?fields=status_code&access_token=${accessToken}`;
            const statusResponse = await fetch(statusUrl);
            const statusResult = await statusResponse.json();
            return statusResult.status_code;
        }

        // Wait and check the container's status until it's FINISHED
        let status = await checkContainerStatus(creationId);
        let attempts = 0;
        while (status !== 'FINISHED' && attempts < 5) {
            await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute
            status = await checkContainerStatus(creationId);
            attempts++;
        }

        if (status !== 'FINISHED') {
            console.error('Failed to publish the reel within the expected time frame:', status);
            res.status(500).send(`Failed to publish the reel, final status: ${status}`);
            return;
        }

        // Now publish the uploaded reel
        const publishUrl = `https://graph.facebook.com/v19.0/${instagramUserId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`;
        const publishResponse = await fetch(publishUrl, {
            method: 'POST'
        });
        const publishResult = await publishResponse.json();

        if (publishResult.error) {
            console.error('Error publishing the reel:', publishResult.error);
            res.status(500).send('Error publishing the reel');
            return;
        }

        console.log('Publishing successful:', publishResult);
        res.send('Reel uploaded and published successfully');
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Unexpected error occurred');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});