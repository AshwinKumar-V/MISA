//Required Imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const mongoose = require('mongoose');
require("dotenv").config();

//.env Imports
const PORT = process.env.PORT
const MONGOURI = process.env.MONGOURI

//Enabling JSON serialization
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Enabling CORS
app.use(cors({origin: "*"}))


// Connect to MongoDB Atlas using Mongoose
mongoose.connect(MONGOURI, { useNewUrlParser: true })
  .then(() => console.log('Conversations MicroService Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

//To Store Messages
const messages=[];


app.get("/",(req,res) => 
{
    console.log("Requested hit on /");
    res.send("This is the Conversations MicroService");
})

app.post("/writemessageuser",(req,res) => 
{
    console.log("Requested hit on /writemessageuser");
    const usermessage = req.body.usermessage
    messages.push(usermessage)
    res.send('User Message added successfully')
})

app.post("/writemessagebot",(req,res) => 
{
    console.log("Requested hit on /pushmessagebot");
    const botmessage = req.body.botmessage
    messages.push(botmessage)
    res.send('Bot Message added successfully')
})


app.get("/history",(req,res) => 
{
    console.log("Requested hit on /history");
    res.send(messages);
})
app.listen(PORT,()=> console.log("Conversations Microservice started at port:"+PORT));