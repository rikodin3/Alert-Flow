/*
I have decided to scrape both USGS website and IMD website for better coverage of disasters throughout
India. USGS primarily covers earthquake whereas the IMD website is more focused on  cyclones, heatwave
and storms
*/ 

//USGS provides a public JSON API so  no scraping is needed

const axios = require("axios");
// USGS GeoJSON feed for all earthquakes in the past hour
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

async function getEarthquakeAlerts(){
    try{
        const response = await axios.get(url); //making a GET request

        const alerts = response.data.features //extract the earthquake info
            //filter the earthquakes occuring just in india
            .filter((f) => f.properties.place.toLowerCase().includes('india') &&
                    (() => {
                    const [lon, lat] = f.geometry.coordinates;
                    return lat >= 6 && lat <= 37 && lon >= 68 && lon <= 97; //to avoid places like Indian Springs,Nevada to show up
                    })() )
            //making objects out of the data
            .map((f) => ({
                place: f.properties.place,                         // Location 
                magnitude: f.properties.mag,                       // Magnitude 
                time: new Date(f.properties.time).toLocaleString(),// convert timestamp to readable format
                coordinates: f.geometry.coordinates                // [longitude,latitude,depth]
            }));
        return alerts;
    }catch(err){
        console.error('Error fetching earthquake data:', err.message);
        return []; // Return an empty array on error
    }
}


// Export the getEarthquakeAlerts so it can be used in other files
module.exports = getEarthquakeAlerts;

