//to create an api to store user data
const express = require("express");
//to make requests from different origins
const cors = require("cors");
//to save user data locally and read user data
const fs = require("fs");

const app = express();

app.use(cors());         //to allow cross origin requests
app.use(express.json()); //to parse json

//file to store registered users info 
const USERS_FILE = "users.json";

//load registered users from file if it exists 
function loadUsers(){
    try{
        const data = fs.readFileSync(USERS_FILE);  //synchronous operation to read the file
        return json.parse(data);
    } catch(err){
        return []; //if file is not found or there is an error, return an empty array
    }
}

//save user array to the file
function saveUsers(){
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); // Save in readable format
}

//API endpoint for POST requests 
app.post('/register', (req,res) => {
    const {district, deviceToken} = res.body;

    //validate input
    if (!district || !deviceToken) {
    return res.status(400).json({ error: 'district and deviceToken are required' });
    }

    let users = loadUsers();
    const existing = users.find(u => u.deviceToken === deviceToken);

    if(existing){
        //Update district if the token already exists
        existing.district = district;
    } else{
        users.push({district, deviceToken});
    }

    saveUsers(users);
    res.json({message: "User registered successfully", users});
})

app.listen(PORT, () => {
    console.log('Registration backend running');
})