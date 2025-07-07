/*
I have decided to scrape both USGS website and IMD website for better coverage of disasters throughout
India. USGS primarily covers earthquake whereas the IMD website is more focused on  cyclones, heatwave
and storms
*/ 

//USGS provides a public JSON API so  no scraping is needed

const axios = require("axios");
// USGS GeoJSON feed for all earthquakes in the past hour
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

//function to calcuclate the distance betwenn two points given their longitudinal and latitudinal value
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const toRad = deg => deg * (Math.PI / 180);  //converting the degress to radian

  const dLat = toRad(lat2 - lat1); //longitudinal differnce
  const dLon = toRad(lon2 - lon1); //latitudinal difference 
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function warningRadiusFor(mag) {
  if (mag >= 7) return 400;
  if (mag >= 6) return 200;
  if (mag >= 5) return 100;
  if (mag >= 4) return 50;
  return 10;
}


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


module.exports = {getEarthquakeAlerts,haversineDistance,warningRadiusFor};