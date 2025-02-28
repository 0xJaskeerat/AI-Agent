import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let userInput = ""

client.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: userInput }],
}).then(((response) => {
    console.log("response", response.choices[0].message.content);
}))