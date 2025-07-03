import dotenv from "dotenv";
dotenv.config(); 

import chalk from "chalk";

import Together from "together-ai";

const together = new Together();

try {
  const response = await together.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Top three things to do in Delhi?" }
    ],
    model: "meta-llama/Llama-Vision-Free",
    //max_tokens: 100,
    temperature: 0,
    stream: true
  });
  let fullResponse = "";
  for await (const token of response) {
    const content = token.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      console.log(chalk.green.bold("LLM Response: \n"));
      console.log(chalk.white("```python\n" + fullResponse + "\n```"));
    }
  }
} catch (error) {
  console.error("Error:", error);
}