//imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Configuration, OpenAIApi } = require("openai");
const cors = require('cors')

//Enviroment constants configuration
require("dotenv").config();

//Enabling JSON serialization
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Enabling CORS
app.use(cors({origin: "*"}))

//Connection String
const uri = 'mongodb+srv://Sain:Sain123@projects.u014po5.mongodb.net/MISA?retryWrites=true&w=majority';

// Connect to MongoDB Atlas using Mongoose
mongoose.connect(uri, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));




//Setting up configuration key
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

//To setup messaging history
const messages=[];

//Basic Model configuration
let modelName="gpt-3.5-turbo";

// create a conversation schema
const conversationSchema = new mongoose.Schema({
  userId: String,
  botId: String,
  messages: [
    {
      role: String,
      content: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});


// create a conversation model
const Conversation = mongoose.model('Conversation', conversationSchema);


//---------------------------create a new conversation----------------
const conversation = new Conversation({
  userId: 'user123',
  botId: 'bot123',
  messages: [],
});

conversation.save()
    .then((result) => {
      console.log("conversation started.");
    })
    .catch((err) => {
      console.log(err);
    });

    messages.push({ role: "user", content: `given a rest api POST request schema as { ticket_title<string>: "", ticket_description<string>: "", tags <List<string>>: [] } for the following user inputs perform entity extraction from user inputs to autofill and generate json request code. now along with the above schema, add a new field for generating a response for the user input and regenerate the json, and generate only one json per response` });

    openai.createChatCompletion({
      model: modelName,
      messages: messages,
    })
    .then((response) => {
      const completion = response.data.choices[0].message.content; 
  
    //json extraction
    completion = completion.match(/\{(?:[^{}]|(?R))*\}/g)
    ticket = JSON.parse(completion)

    console.log(ticket);

    var bot_response = ticket.response.message
    messages.push({ role: "assistant", content: bot_response });
  })
  .catch((err) => {
    console.log(err);
  })

  

//---------------------------------------------------------------------

app.post("/ask", async (req, res) => 
{
    // getting prompt question from request
    console.log("hit on /ask");
    const prompt = req.body.prompt;
  
    try {
      if (prompt == null) {
        throw new Error("Uh oh, no prompt was provided"); 
      }
      messages.push({ role: "user", content: prompt});
      const response = await openai.createChatCompletion({
        model: modelName,
        messages: messages,
        // prompt,
        // "max_tokens": 10,
        // "temperature": 0.8,
        // "n": 1,
        // "stream": false,
        // "logprobs": null,
        // "stop": "\n"
      });

      // retrieve the completion text from response
    const completion = response.data.choices[0].message.content;   
    //json extraction
    completion = completion.match(/\{(?:[^{}]|(?R))*\}/g)
    ticket = JSON.parse(completion)

    console.log(ticket);

    var bot_response = ticket.response.message
    messages.push({ role: "assistant", content: bot_response });
    
    conversation.messages = messages.map(({role, content}) => ({role, content}))

    // save the conversation to the database
    conversation.save()
    .then((result) => {
      // console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });


      // return the result
      return res.status(200).json({
        success: true,
        message: completion,
      });
    } catch (error) {
      console.log(error.message);
    }
});

//sample get
app.get("/",(req,res) => 
{
    res.send("This is a static test message");
    console.log("Requested hit on /");
})

app.listen(3000,()=> console.log("App server started"));

//sample post
app.post("/changemodel",async(req,res) =>
{
    const model = req.body.model;
    if(!model)
    {
        return res.sendStatus(400);
    }
    modelName = model
    console.log("model changed to: " + modelName);
});