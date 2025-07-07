//import the express framework for the backend
const express = require('express');

//import the CORS for cross=origin request by the app
const cors = require("cors");  

//import the earthquake alert scraper
const {getEarthquakeAlerts,haversineDistance,warningRadiusFor} = require('./earthquakeScraper.js');

//import the IMD website scraper
const getIMDWarnings = require('./imdScraper.js');
const { all } = require('axios');
const summarizeAlerts = require('./geminiHelper.js');

const app = express();
//Enable CORS so that frontend can access the API
app.use(cors());

//defining a GET route at /alerts to serve earthquake and IMD alerts
app.get('/alerts',async (req,res) => { //req  is the requesst object and res is the response object
    const districtQuery = req.query.district?.toLowerCase();
    console.log(`Request received for district: ${districtQuery}`);

    try{
        const IMDWarnings = await getIMDWarnings();
        const earthquakes = await getEarthquakeAlerts();

        const filteredWarnings = districtQuery
            ? IMDWarnings.filter(w =>
                w.district.toLowerCase().includes(districtQuery)
            )
            : []
        console.log(filteredWarnings);
        const [districtLong,districtLat] = filteredWarnings[0].coordinates;
        debugger;
        const filteredEarthquakes = earthquakes?.filter(e => {
            const [lon, lat] = e.geometry.coordinates; // destructure coordinates (lon, lat)
            const distance = haversineDistance(districtLat, districtLong, lat, lon); // calculate distance
            const radius = warningRadiusFor(e.properties.mag); // determine warning radius based on magnitude
            return distance <= radius; // include only if within radius
        });

        const allWarnings = [...(filteredEarthquakes || []),...filteredWarnings];

        let summary = '';
        if (allWarnings){
            summary = await summarizeAlerts(allWarnings);
        } else{
            summary = `No active alerts for ${districtQuery || 'your region'}`;
        }

        res.json({alerts:allWarnings, summary});
    }catch(err){
        console.error("Error in /alerts route", err.message);
    }
});


//start the server and listen on port 3000
app.listen(3000,'0.0.0.0', () => {
    console.log('Alert Flow backend running at http://localhost:3000/alerts');
});