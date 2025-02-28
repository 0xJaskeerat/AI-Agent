import OpenAI from "openai";
import dotenv from "dotenv";
import readlineSync from "readline-sync"

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Tools
function getWeatherDetails(cityName) {
  switch (cityName) {
    case "Delhi":
      return "The weather in Delhi is sunny with a high of 42 degrees.";
    case "Chandigarh":
      return "The weather in Chandigarh is sunny with a high of 20 degrees.";
    case "Bangalore":
      return "The weather in Bangalore is cloudy with a high of 10 degrees.";
    default:
      return "Sorry, I don't have weather information for that city.";
  }
}

const tools = {
  "getWeatherDetails": getWeatherDetails
}

const SYSTEM_PROMPT = `
You an my AI Assistant called Sonam Bajwa. with START, PLAN, ACTION, OBSERVATION AND OUTPUT states
Wait for user input and then PLAN with available Tools
Once you have planned, take the ACTION and wait for OBSERVATION based on ACTION
Once you get observations, return the AI response based on OBSERVATION and ACTION

Strictly follow the JSON format as in examples

Available Tools = 
 - function getWeatherDetails(cityName: string): string
getWeatherDetails is a function that accepts city name and returns the weather details for that city.

Here is the example:
START:
{ type: "user", "user": "What is the sun of weather in Delhi and Chandigarh?" }
{ type: "plan", "plan": "I will get the weather details for Delhi" }
{ type: "action", "function": "getWeatherDetails", "input": "Delhi" }
{ type: "observation", "observation": "42 degrees" }
{ type: "output",  "output": "The weather in Delhi is sunny with a high of 42 degrees." }

{ type: "plan", "plan": "I will get the weather details for Chandigarh" }
{ type: "action", "function": "getWeatherDetails", "input": "Chandigarh" }
{ type: "observation", "observation": "20 degrees" }
{ type: "output",  "output": "The sum of weather in Delhi and in Chandigarh is 62 degrees." }
`

const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

// autoprompting
while(true){
  const userInput = readlineSync.question(">> ");
  const query = {
    role: "user",
    content: userInput
  }
  messages.push({ role: 'user', content: JSON.stringify(query) })

  while(true){
    const chat = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      response_format: { type: "json_object" },
    });

    const response = chat.choices[0].message.content;
    messages.push({ role: 'assistant', content: response })

    console.log("\n\n------------------------ AI STARTED --------------------------")
    console.log(response)
    console.log("------------------------ AI ENDED -------------------------\n\n")

    const call = JSON.parse(response);
    if(call.type === 'output'){
      console.log("🤖: ", `${call.output}`)
      break;
    }else if(call.type === 'action'){
      const tool = tools[call.function] //  getWeatherDetails
      const input = call.input // Delhi
      const observation = tool(input) // getWeatherDetails(Delhi) // The weather in Delhi is sunny with a high of 42 degrees.
      messages.push({ role: 'developer', content: JSON.stringify({ type: 'observation', observation }) })
    }
  }
}