//Required Imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const mongoose = require('mongoose');
const axios = require('axios');
require("dotenv").config();
const { v4: uuidv4 } = require('uuid');

//.env Imports
const PORT = process.env.PORT
const MONGOURI = process.env.MONGOURI

//Enabling JSON serialization
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Enabling CORS
app.use(cors({ origin: "*" }))

//To Store Messages
const messages = [];
messages.push({ role: "assistant", content: process.env.ROLE_PROMPT })
console.log("Assistant role assigned")


// Connect to MongoDB Atlas using Mongoose
mongoose.connect(MONGOURI, { useNewUrlParser: true })
    .then(() => console.log('Conversations MicroService Connected to MongoDB Atlas'))
    .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

//Generating uuid for Schema ID's
console.log("Generating UUIDs: Start");
const conversationData = {
    conversation_id: uuidv4(),
    user_id: uuidv4(),
    bot_id: uuidv4(),
    conversation_title: "Software ticket",
    start_time: new Date(),
    end_time: new Date(),
    feedback: null,
    messages: [
      
    ],
  };
console.log(conversationData);
console.log("Generating UUIDs: Done");

//Mongo Schema
console.log("Setting Conversation Mongo Schema: Start");
const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    text: { type: String, required: true },
    feedback: { type: String }
  });
  
  const conversationSchema = new mongoose.Schema({
    conversation_id: { type: String, required: true },
    user_id: { type: String, required: true },
    bot_id: { type: String, required: true },
    conversation_title: { type: String, required: true },
    start_time: { type: Date },
    end_time: { type: Date },
    feedback: { type: String },
    messages: [messageSchema],
  });
  const Conversation = mongoose.model('Conversation', conversationSchema);
console.log("Setting Conversation Mongo Schema: Done");     

//Calling the /conversations endpoint when the conversation start 
axios.post('http://localhost:3001/conversations')
    .then(response => {
      console.log("Conversation Storage started in MongoDB")
    })
    .catch(error => {
      console.error(error);
    });

//Store to Mongo API Endpoint
app.post("/conversations", (req, res) => {
    console.log("Requested hit on /conversations");
    const conversation = new Conversation(conversationData);
    conversation.save()
    .then(() => {
        console.log('Conversation saved successfully');
    })
    .catch((err) => {
        console.error(err);
    });
        res.send('User Message added successfully')
});

//Update the conversations
app.post("/conversationupdate", (req, res) => {
    const conversationIdToUpdate = conversationData.conversation_id;
    const lastMessageIndex = messages.length - 1;
    const lastMessage = messages[lastMessageIndex];
    const newMessage = {
    message_id: uuidv4(),
    sender: lastMessage.role,
    text: lastMessage.content,
    };
    currentTime = new Date();
    Conversation.findOneAndUpdate(
    { conversation_id: conversationIdToUpdate },
    { $push: { messages: newMessage} },
    { $set: { end_time: currentTime} },
    { new: true }
    )
    .then((updatedConversation) => {
        console.log("New message added successfully:", updatedConversation);
    })
    .catch((err) => {
        console.error(err);
    });
    res.send('New Message added successfully')
});



//Static Message
app.get("/", (req, res) => {
    console.log("Requested hit on /");
    res.send("This is the Conversations MicroService");
})

//Push User Message to the Context store
app.post("/writemessageuser", (req, res) => {
    console.log("Requested hit on /writemessageuser");
    const usermessage = req.body.usermessage
    messages.push(usermessage)
    res.send('User Message added successfully');
    axios.post('http://localhost:3001/conversationupdate')
    .then(response => {
      console.log(response.data);
      console.log("Stored user message to MongoDB")
    })
    .catch(error => {
      console.error(error);
    });
});

//Push Bot Message to the Context store
app.post("/writemessagebot", (req, res) => {
    console.log("Requested hit on /pushmessagebot");
    const botmessage = req.body.botmessage;
    messages.push(botmessage);
    res.send('Bot Message added successfully');
    axios.post('http://localhost:3001/conversationupdate')
    .then(response => {
      console.log(response.data);
      console.log("Stored bot message to MongoDB")
    })
    .catch(error => {
      console.error(error);
    });
})

//Retrieve Context
app.get("/history", (req, res) => {
    console.log("Requested hit on /history");
    res.json(messages);
})

//Clear Context
app.get("/clearhistory", (req, res) => {
    console.log("Requested hit on /clearhistory");
    messages.splice(1, messages.length - 1);
    res.send('Message History Cleared');
})


app.listen(PORT, () => console.log("Conversations Microservice started at port:" + PORT));