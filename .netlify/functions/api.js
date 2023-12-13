// netlify/functions/api.js

const express = require('express');
const axios = require('axios');
const app = express();

// Replace with your GitHub repository information
const githubRepo = 'yourusername/your-repo';
const apiUrl = `https://api.github.com/repos/${githubRepo}/contents/`;

// Define routes
app.get('/api/:filePath', async (req, res) => {
  try {
    const filePath = req.params.filePath;
    const fullApiUrl = `${apiUrl}${filePath}`;

    const response = await axios.get(fullApiUrl);
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');

    res.status(200).json({ content });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/:filePath', express.json(), async (req, res) => {
  try {
    const filePath = req.params.filePath;
    const fullApiUrl = `${apiUrl}${filePath}`;

    const { newContent } = req.body;

    // Get the latest file information
    const { data } = await axios.get(fullApiUrl);
    const latestSha = data.sha;

    // Update the file
    await axios.put(
      fullApiUrl,
      {
        message: 'Update file',
        content: Buffer.from(newContent).toString('base64'),
        sha: latestSha,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
        },
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Export the Express app
module.exports = app;
