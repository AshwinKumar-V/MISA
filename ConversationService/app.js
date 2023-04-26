//Required Imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const mongoose = require('mongoose');
// const axios = require('axios');
require("dotenv").config();
// const { v4: uuidv4 } = require('uuid');

//.env Imports
const PORT = process.env.PORT

//Enabling JSON serialization
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enabling CORS
app.use(cors({ origin: "*" }))

// To Store Messages
// const messages = [];
// messages.push({ role: "assistant", content: process.env.ROLE_PROMPT })
// console.log("Assistant role assigned")


// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_CONNECTION_STRING)
.then(() => console.log("Successfully connected to MongoDB"))
.catch((err) => console.error("Error connecting to MongoDB\n" + err))

// // Generating uuid for Schema ID's
// console.log("Generating UUIDs: Start");
// const conversationData = {
//     conversation_id: uuidv4(),
//     user_id: uuidv4(),
//     bot_id: uuidv4(),
//     conversation_title: "Software ticket",
//     start_time: new Date(),
//     end_time: new Date(),
//     feedback: null,
//     messages: [],
//   };
// console.log(conversationData);
// console.log("Generating UUIDs: Done");

// mongo - message schema
const messageSchema = new mongoose.Schema({
  role: { type: String, required: true },
  content: { type: String, required: true }
});

// mongo - conversation model
const Conversation = mongoose.model('conversation', new mongoose.Schema({
  user_id: { type: String, required: true },
  bot_id: { type: String, required: true },
  title: { type: String },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  messages: [messageSchema]
}));
   

// //Calling the /conversations endpoint when the conversation start 
// axios.post('http://localhost:3001/conversations')
//     .then(response => {
//       console.log("Conversation Storage started in MongoDB")
//     })
//     .catch(error => {
//       console.error(error);
//     });


//Static Message
app.get("/", (req, res) => {
  console.log("GET /")
  return res.send("Conversation Service running!") 
})

// create a new conversation
app.post("/conversations", async (req, res) => {
  console.log("POST /conversations");

  var data = {
    conversation_id: null
  }
  
  // user validation
  if (!req.headers.user_id) {
    console.log("Unauthorized")
    return res.sendStatus(401) // Unauthorized
  }

  try {
    const conversation = new Conversation({
      user_id: req.headers.user_id,
      bot_id: "b123",
      title: "",
      start_time: new Date(),
      end_time: new Date(),
      messages: [ {
        role: 'system',
        content: process.env.ROLE_PROMPT
      }]
    });

    const conversation_res = await conversation.save()
    data.conversation_id = conversation_res.id
    console.log('Conversation created successfully');
  }
  catch(err) {
    console.error("Error creating conversation\n" + err)
    return res.sendStatus(500)  // Internal server error
  }
  return res.json(data)
});

// Retrieve all conversations
app.get('/conversations', async (req, res) => {
  console.log("GET /conversations")
  var data = {
    conversations: null
  }
  
  // user validation
  if (!req.headers.user_id) {
    console.log("Unauthorized")
    return res.sendStatus(401) // Unauthorized
  }

  // get all conversations
  try {
    const conversations = await Conversation.find()
    data.conversations = conversations
    console.log("Fetched all conversations successfully")
  }
  catch(err) {
    console.error("Error fetching all conversations\n" + err)
    return res.sendStatus(500) // Internal server error
  }
  return res.json(data)
})

// Retrieve conversations by conversation_id
app.get('/conversations/:id', async (req, res) => {
  console.log("GET /conversations/:id");
  var data = null

  // user validation
  if (!req.headers.user_id) {
    console.log("Unauthorized")
    return res.sendStatus(401) // Unauthorized
  }

  // conversation id validation
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log("Not found")
    return res.sendStatus(404) // Not found
  }

  try {
    const conversation = await Conversation.findById(req.params.id)
    if (!conversation) {
        console.error("Error fetching conversation")
        return res.sendStatus(404) // Not found
    }
    data = conversation
    console.log("Fetched conversation successfully")
  }
  catch(err) {
    console.error("Error fetching conversation\n" + err)
    return res.sendStatus(500)  // Internal server error
  }
  return res.json(data)
});

// update conversation title
app.patch("/conversations/:id", async (req, res) => {
  console.log("PATCH /conversations/:id");

  // user validation
  if (!req.headers.user_id) {
    console.log("Unauthorized")
    return res.sendStatus(401) // Unauthorized
  }

  // conversation id validation
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log("Not found")
    return res.sendStatus(404) // Not found
  }

  // conversation title validation
  if (!req.body.title) {
    console.log("Bad request")
    return res.sendStatus(400) // Bad request
  }

  // update conversation title
  try {
    const updateObject = {
      title: req.body.title,
      end_time: new Date()
    }
    const conversation = await Conversation.findByIdAndUpdate(req.params.id, updateObject)
    if (!conversation) {
        console.error("Error updating conversation title")
        return res.sendStatus(404) // Not found
    }
    console.log("Conversation title updated successfully")
  }
  catch(err) {
      console.error("Error updating conversation title\n" + err)
      return res.sendStatus(500) // Internal server error
  }
  return res.sendStatus(204)  // No content
})

// append messages
app.post("/conversations/:id/messages", async (req, res) => {
  console.log("POST /conversations/:id/messages");

  // user validation
  if (!req.headers.user_id) {
    console.log("Unauthorized")
    return res.sendStatus(401) // Unauthorized
  }

  // conversation id validation
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log("Not found")
    return res.sendStatus(404) // Not found
  }

  // conversation messages validation
  if (!req.body.messages) {
    console.log("Bad request")
    return res.sendStatus(400) // Bad request
  }

  // append conversation messages
  try {
    const updateObject= {
      end_time: new Date(),
      $push: {
        messages: {
          $each: req.body.messages
        }
      }
    }
    const conversation = await Conversation.findByIdAndUpdate(req.params.id, updateObject)
    if (!conversation) {
        console.error("Error adding conversation messages")
        return res.sendStatus(404) // Not found
    }
    console.log("Conversation messages added successfully")
  }
  catch(err) {
      console.error("Error adding conversation messages\n" + err)
      return res.sendStatus(500) // Internal server error
  }
  return res.sendStatus(204)  // No content

    // const conversationIdToUpdate = conversationData.conversation_id;
    // const lastMessageIndex = messages.length - 1;
    // const lastMessage = messages[lastMessageIndex];
    // const newMessage = {
    // message_id: uuidv4(),
    // sender: lastMessage.role,
    // text: lastMessage.content,
    // };
    // currentTime = new Date();
    // Conversation.findOneAndUpdate(
    // { conversation_id: conversationIdToUpdate },
    // { $push: { messages: newMessage} },
    // { $set: { end_time: currentTime} },
    // { new: true }
    // )
    // .then((updatedConversation) => {
    //     console.log("New message added successfully:", updatedConversation);
    // })
    // .catch((err) => {
    //     console.error(err);
    // });
    // res.send('New Message added successfully')
});

//Push User Message to the Context store
// app.post("/writemessageuser", (req, res) => {
//     console.log("Requested hit on /writemessageuser");
//     const usermessage = req.body.usermessage
//     messages.push(usermessage)
//     res.send('User Message added successfully');
//     axios.post('http://localhost:3001/conversationupdate')
//     .then(response => {
//       console.log(response.data);
//       console.log("Stored user message to MongoDB")
//     })
//     .catch(error => {
//       console.error(error);
//     });
// });

//Push Bot Message to the Context store
// app.post("/writemessagebot", (req, res) => {
//     console.log("Requested hit on /pushmessagebot");
//     const botmessage = req.body.botmessage;
//     messages.push(botmessage);
//     res.send('Bot Message added successfully');
//     axios.post('http://localhost:3001/conversationupdate')
//     .then(response => {
//       console.log(response.data);
//       console.log("Stored bot message to MongoDB")
//     })
//     .catch(error => {
//       console.error(error);
//     });
// })

//Retrieve Context
// app.get("/history", (req, res) => {
//     console.log("Requested hit on /history");
//     res.json(messages);
// })

//Clear Context
// app.get("/clearhistory", (req, res) => {
//     console.log("Requested hit on /clearhistory");
//     messages.splice(1, messages.length - 1);
//     res.send('Message History Cleared');
// })


app.listen(PORT, () => console.log("Conversation Service listening on port " + PORT));