/*
We will scrape ditrictwise warning from thr imd Disctriwise Warning page
*/ 
const axios = require("axios");
// endpoint returning data in JSONP format to the warning page
const url = 'https://reactjs.imd.gov.in/geoserver/wfs?callback=getJson&service=WFS&version=1.1.0&request=GetFeature&typename=imd:district_warnings_india&outputFormat=text/javascript'; 

function parserJSONP(response){
    const   jsonString = response.slice(14,-1);
    return JSON.parse(jsonString);
}

const colorMap = {
  4: "Green",
  3: "Yellow",
  2: "Orange",
  1: "Red"
};

const hazardMap = {
  1: "No Warning",
  2: "Heavy Rain",
  4: "Thunderstorms & Lightning, Squall etc.",
  8: "Strong Surface Winds",
  16: "Very Heavy Rain",
  17: "Extremely Heavy Rain",
};

async function getIMDWarnings() {

  try {
    const response = await axios.get(url);
    const json = parserJSONP(response.data); 
    
    const warnings = json.features.map(f => {
      const warningLevel = colorMap[f.properties.Day1_Color];

      const warningCodes = f.properties.Day_1?.split(',') || [];
      const decodedWarnings = warningCodes
        .map(code => hazardMap[code]) //replace code with the correct warning
        .filter(Boolean); //remove undefined

        return {
          district: f.properties.District,
          warningLevel: warningLevel,
          hazard: decodedWarnings,
          coordinates: f.geometry.coordinates[0][0][0],
        };
    });
    return warnings;

  } catch (err) {
    console.error("Error parsing IMD JSONP:", err.message);
    return [];
  }
}

module.exports = getIMDWarnings;