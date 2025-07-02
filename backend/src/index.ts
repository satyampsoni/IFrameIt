require("dotenv").config(); // store environment variables in .env file

import Together from "together-ai";

const together = new Together();

const response = await together.chat.completions.create({
  messages: [],
  model: "meta-llama/Llama-Vision-Free",
  stream: true
});

for await (const token of response) {
  console.log(token.choices[0]?.delta?.content)
}