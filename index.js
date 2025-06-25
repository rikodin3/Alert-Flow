//import the express framework for the backend
const express = require('express');

//import the CORS for cross=origin request by the app
const cors = require("cors");  

//import the earthquake alert scraper
const getEarthquakeAlerts = require('./earthquakeScraper.js');

//import the IMD website scraper
const getIMDWarnings = require('./imdScraper.js');

const app = express();
//Enable CORS so that frontend can access the API
app.use(cors());

//defining a GET route at /alerts to serve earthquake and IMD alerts
app.get('/alerts',async (req,res) => {
    const earthquakes = await getEarthquakeAlerts();
    const imd = await getIMDWarnings();
    // Send a JSON response with the alert data
    res.json({earthquakes,imd});
});

//start the server and listen on port 3000
app.listen(3000, () => {
    console.log('Alert Flow backend running at http://localhost:3000/alerts');
});