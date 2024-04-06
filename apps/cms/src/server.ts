import express from 'express'
import payload from 'payload'
import { URL } from 'url';

require('dotenv').config()
const app = express()

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

const start = async () => {
  // Validate environment variables
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('Please provide a PAYLOAD_SECRET in the environment variables');
  }
  if (!process.env.PAYLOAD_DB_URL) {
    throw new Error('Please provide a PAYLOAD_DB_URL in the environment variables');
  }
  if (!process.env.PAYLOAD_SERVER_URL) {
    console.warn('No PAYLOAD_SERVER_URL provided, using default http://localhost:3200');
  }


  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  let port = 3200;
  if (process.env.PAYLOAD_SERVER_URL) {
    try {
      const url = new URL(process.env.PAYLOAD_SERVER_URL);
      if (url.port) {
        port = parseInt(url.port);
      }
    } catch (error) {
      console.error("Error parsing PAYLOAD_SERVER_URL:", error.message);
    }
  }

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

start()
