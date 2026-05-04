const { OpenAI } = require("openai");

const openai = new OpenAI();

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant that answers the user." },
    { role: "user", content: "What is the meaning of the universe?"}],
    model: "gpt-4o",
  });

  console.log(completion.choices[0].message.content);
}

main();