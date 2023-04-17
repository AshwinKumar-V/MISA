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
messages.push({ role: "system", content: "You are a helpful chatbot assistant named MISA that will help users to solve their issue.when the user tells you an issue you give a solution. if the user says that doesn't work you give another solution. If that also doesn't work for the user you should ask the ask user if they want to generate a ticket or not. if they say yes send a messsage saying that a ticket is issued and give out details like ticketid, ticket title, ticket description in json format, autofill this information without asking the user." });


app.get("/",(req,res) => 
{
    console.log("Requested hit on /");
    res.send("This is the Conversations MicroService");
})

app.post("/pushmessageuser",(req,res) => 
{
    console.log("Requested hit on /pushmessageuser");
    messages.push({ role: "user", content: "Hi" });
    res.send("User Message Pushed");
})

app.post("/pushmessagebot",(req,res) => 
{
    console.log("Requested hit on /pushmessagebot");
    messages.push({ role: "assistant", content: "Hi" });
    res.send("Bot Message Pushed");
})


app.get("/history",(req,res) => 
{
    console.log("Requested hit on /history");
    res.send(messages);
})
app.listen(PORT,()=> console.log("Conversations Microservice started at port:"+PORT));