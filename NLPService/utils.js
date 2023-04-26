const axios = require('axios')
const { Configuration, OpenAIApi } = require("openai")


// openai configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

// openai api call
async function callOpenAI(conversation) {
  try {
    const modelName = process.env.MODEL_NAME
    const response = await openai.createChatCompletion({
      model: modelName,
      messages: conversation,
      // prompt,
      // "max_tokens": 10,
      // "temperature": 0.8,
      // "n": 1,
      // "stream": false,
      // "logprobs": null,
      // "stop": "\n"
    })

    var completion = response.data.choices[0].message.content
    completion = completion.match(/{.*}/)[0]
  } 
  catch (err) {
    throw new Error("Error in openai call\n" + err)
  }
  return completion
}

// extract JSON
async function extractJSON(completion) {
  try {
    completion = JSON.parse(completion)
  }
  catch (err) {
    throw new Error("Error extracting JSON\n" + err)
  }
  return completion
}

// respond to input prompt
async function respond(prompt, conversation) {
  try {
    // add input prompt to conversation
    conversation.push(prompt)
  
    // openai api call
    var completion = await callOpenAI(conversation)

    // add bot response to conversation
    conversation.push({ role: "assistant", content: completion })

    // extract JSON from response
    completion = await extractJSON(completion)
  }
  catch(err) {
    throw new Error("Error responding to prompt\n" + err)
  }
  return completion 
}

// create ticket - call ticketing service (POST /tickets)
async function createTicket(ticket) {
  try {
    var options = {
      headers: {
        "Content-Type": "application/json",
        "user_id": "u123"
      }
    }

    const ret = await axios.post(`${process.env.TICKETING_ADDRESS}/tickets`, ticket, options)
    if (ret) {
      return ret.data
    }
    else {
      throw new Error("Ticket ID not returned")
    }
  }
  catch(err) {
    throw new Error("Error creating ticket\n" + err)
  }
}

// get conversation - call conversation service (GET /conversations/:id)
async function getConversation(id) {
  try {
    var options = {
      headers: {
        "Content-Type": "application/json",
        "user_id": "u123"
      }
    }

    const ret = await axios.get(`${process.env.CONVERSATION_ADDRESS}/conversations/${id}`, options)
    if (ret) {
      return ret.data.messages
    }
    else {
      throw new Error("Conversation not found")
    }
  }
  catch(err) {
    throw new Error("Error fetching conversation\n" + err)
  }
}

// update conversation messages - call conversation service (POST /conversations/:id/messages)
async function updateConversation(id, new_messages) {
  try {
    var options = {
      headers: {
        "Content-Type": "application/json",
        "user_id": "u123"
      }
    }

    await axios.post(`${process.env.CONVERSATION_ADDRESS}/conversations/${id}/messages`, { messages: new_messages }, options)
  }
  catch(err) {
    throw new Error("Error updating conversation messages\n" + err)
  }
  return
}

module.exports = { respond, createTicket, getConversation, updateConversation }