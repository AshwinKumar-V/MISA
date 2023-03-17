const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userName = 'Sain';
const passWord = 'Sain123';


const uri = 'mongodb+srv://Sain:Sain123@projects.u014po5.mongodb.net/MISA?retryWrites=true&w=majority';


// Connect to MongoDB Atlas using Mongoose
mongoose.connect(uri, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));


const { Configuration, OpenAIApi } = require("openai");

require("dotenv").config();

//Setting up configuration key
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

const messages=[];
let modelName="gpt-3.5-turbo";

//messages.push({ role: "assistant", content: "hello" });
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
    //messages.push({ role: "user", content: prompt }); 
    messages.push({ role: "assistant", content: completion });
    

    //console.log("Recived: "+completion);
    console.log(messages);
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