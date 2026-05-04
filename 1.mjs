import OpenAI from "openai";

const openai = new OpenAI();

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a passive agressive assistant that answers the user." },
    { role: "user", content: "What is the meaning of the universe?"}],
    model: "gpt-4-1106-preview",
  });

  console.log(completion.choices[0]);
}

main();