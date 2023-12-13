// netlify/functions/api.js

require('dotenv').config({ path: '../../.env' })

const express = require('express')
const axios = require('axios')
const serverless = require('serverless-http')

const app = express()

// Replace with your GitHub repository information
const githubRepo = 'jasenmichael/netlify-function-gh-db'
const apiUrl = `https://api.github.com/repos/${githubRepo}/contents/`

// Define routes
app.get('/api', async (req, res) => {
  res.status(200).json({ yo: 'yo' })
})

app.get('/api/:filePath', async (req, res) => {
  try {
    const filePath = req.params.filePath
    const fullApiUrl = `${apiUrl}/data/${filePath}.json`

    const response = await axios.get(fullApiUrl)
    const content = Buffer.from(response.data.content, 'base64').toString(
      'utf-8'
    )

    res.status(200).json(JSON.parse(content))
    // res.status(200).json({ fullApiUrl })
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.put('/api/:filePath', express.json(), async (req, res) => {
  try {
    const filePath = req.params.filePath
    const fullApiUrl = `${apiUrl}/data/${filePath}.json`

    const newContent = req.body

    // Get the latest file information
    const { data } = await axios.get(fullApiUrl)
    const latestSha = data.sha

    console.log('data', data)
    console.log('latestSha', latestSha)
    console.log('newContent', newContent)

    // Update the file
    await axios.put(
      fullApiUrl,
      {
        message: 'Update file',
        content: Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64'),
        committer: { name: 'jasenmichael', email: 'jasen@jasenmichael.com' },
        sha: latestSha
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )

    res.status(200).json({ success: true })
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: 'Internal Server Error!!' })
  }
})

// Export the Express app

module.exports.handler = serverless(app) // module.exports = app
