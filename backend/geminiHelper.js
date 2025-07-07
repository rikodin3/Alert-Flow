const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
//Load environment variables
require('dotenv').config();

//get the API key from .env file and make an instance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//function to send alert data to Gemini and get a plain summary
async function summarizeAlerts(alertData){
    //use the gemini model 
    const model = genAI.getGenerativeModel({model: "models/gemini-2.5-pro"});

    //Construct the prompt clearly for summarization
    const prompt = `
    You are an alert assistant for a disaster warning app. Dont say stuff like here is the warning.Act like you are responding to a person fetching it from a weather app
    Generate a short, clear summary of the following weather warnings for the public. Use alert colors and hazard types. Format should be readable and concise.
    Here is the alert data:
    ${JSON.stringify(alertData, null, 2)}
    `;

    try{
        //send the content to gemini 
        const result = await model.generateContent(prompt);

        //extract and return the text response 
        const response =  await result.response;
        return response.text();
    }catch(err){
        console.error("Gemini summarization error:",err.message);
        return "Unable to generate summary at this time";
    }
}

module.exports = summarizeAlerts;