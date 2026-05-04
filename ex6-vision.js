let {OpenAI} = require("openai");
let util = require("util");
let fs = require("fs");
let path = require("path");

// Plain text passes through. "img:./photo.jpg [optional question]" attaches
// the image inline as a data URL so the model can see it.
function buildUserContent(input) {
  const m = input.match(/^img:(\S+)\s*(.*)$/);
  if (!m) return input;
  const filepath = m[1];
  const question = m[2] || "What color is this?";
  const ext = path.extname(filepath).slice(1).toLowerCase();
  const mime = ext === "jpg" ? "jpeg" : ext;
  const b64 = fs.readFileSync(filepath).toString("base64");
  return [
    { type: "text", text: question },
    { type: "image_url", image_url: { url: `data:image/${mime};base64,${b64}` } },
  ];
}

const openai = new OpenAI();

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise(resolve => readline.question(question, answer => resolve(answer)));
};

// ANSI escape code colors
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  bold: "\x1b[1m"
};

const chatWithGPT = async () => {
  let stop = false;

  console.log("ChatGPT Terminal Assistant\nType 'quit' to exit.\n");

  while (!stop) {
    const userInput = await askQuestion(colors.reset + "You: ");

    if (userInput.toLowerCase() === 'quit') {
      stop = true;
      readline.close();
    } else {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          seed: 12345,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "color",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  hex: {
                    type: "string",
                    description: "Hex code, e.g. #AABBCC",
                  },
                  description: {
                    type: "string",
                    description: "A poetic name or description of the color.",
                  },
                },
                required: ["hex", "description"],
              },
            },
          },
          messages: [
            { role: "system", content: "You answer color questions. Respond per the provided schema." },
            { role: "user", content: buildUserContent(userInput) },
          ],
        });

        const choice = response.choices[0];
        if (choice.message.refusal) {
          console.log(colors.red + `Refusal: ${choice.message.refusal}`);
        } else {
          const parsed = JSON.parse(choice.message.content);
          console.log(colors.cyan + `GPT: ${util.inspect(parsed, { colors: false })}`);
        }
      } catch (error) {
        console.error("Error connecting to OpenAI: ", error);
      }
    }
  }
};

chatWithGPT();
