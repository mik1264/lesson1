
let {OpenAI} = require("openai");
let util = require("util");
let fs = require("fs");

const openai = new OpenAI();

const logStream = fs.createWriteStream('gpt-log.txt', { flags: 'a' });
const timestamp = (new Date).toLocaleString();
logStream.write('\n====\n' + timestamp + '\n====\n');

console._log = console.log;
// Override console.log
console.log = function(message) {
	if (message==undefined) message = "";
	console._log (message);
	//remove escape codes from file output
	const escapeCodeRegex = /^\x1b\[[0-9;]*m/;
	message = message.replace(escapeCodeRegex,"");
    
    logStream.write(message + '\n');    
};

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function wrapText(text, maxColumn) {
  const words = text.split(' ');
  let wrappedText = '';
  let lineLength = 0;

  words.forEach(word => {
    if (lineLength + word.length + 1 > maxColumn) {
      wrappedText += '\n';
      lineLength = 0;
    }
    wrappedText += word + ' ';
    lineLength += word.length + 1;
  });

  return wrappedText;
}

const askQuestion = (question) => {
  return new Promise(resolve => readline.question(question, answer => resolve(answer)));
};

// ANSI escape code colors
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  green: "\x1b[32m",
  bold: "\x1b[1m"
};

const chatWithGPT = async () => {
  let stop = false;

  console.log("ChatGPT Terminal Assistant\nType 'quit' to exit.\n");

     
	// Upload a file with an "assistants" purpose
// 	const file = await openai.files.create({
// 	  file: fs.createReadStream("beinhocker.pdf"),
// 	  purpose: "assistants",
// 	});

	const myAssistant = await openai.beta.assistants.create({
		instructions:
		  "Use the attached book to answer the user.",
		name: "Generic",
		tools: [{"type": "retrieval"}],
		file_ids: ["file-dXWa15s40vwGZAntpO1WKrXY"], //beinhocker.pdf
		model: "gpt-4-1106-preview"
	  });
  console.log("Assistant: " + myAssistant.id);

  const chatThread = await openai.beta.threads.create(); // create Thread (chat context) on server
  console.log("Thread: " + chatThread.id);

  while (!stop) {
    console.log();
    const userInput = await askQuestion(colors.reset + "You: ");
    logStream.write("You: " + userInput + '\n');
    

    if (userInput.toLowerCase() === 'quit') {
      stop = true;
      // deleting the context
	  let response = await openai.beta.threads.del(chatThread.id);
	  console.log("Thread deleted: " + chatThread.id);
	  response = await openai.beta.assistants.del(myAssistant.id);
	  console.log("Assistant deleted: " + myAssistant.id);
      readline.close();
    } else {
      try {

		let threadMessages = await openai.beta.threads.messages.create(
			chatThread.id,
			{ role: "user", content: userInput }
		  );
		  
		  const run = await openai.beta.threads.runs.create(
			chatThread.id,
			{ assistant_id: myAssistant.id//,
			//instructions: "Please address the user as mik1264. The user has a premium account."
			 }
		  );
		  
		  let run2;
		  
		  do {
			  run2 = await openai.beta.threads.runs.retrieve(
				chatThread.id,
				run.id
			  );
			  await new Promise((resolve,reject)=>setTimeout(resolve(),300));
			  } while (run2.status!='completed');
		  
		 // console.log(util.inspect(run2,{depth: Infinity}));
		  
		  threadMessages = await openai.beta.threads.messages.list(
			chatThread.id
		  );
		  
		  console.log(colors.cyan + wrapText(threadMessages.data[0].content[0].text.value, 80));
		  
		  const runSteps = await openai.beta.threads.runs.steps.list(
			  chatThread.id,
			  run.id
			);
			
		 console.log(colors.white + util.inspect(runSteps.body.data.filter(d=>d.type=="tool_calls").map(d=>d.step_details.tool_calls),{depth: Infinity}));

      } catch (error) {
        console.error("Error connecting to OpenAI: ", error);
      }
    }
  }
};

chatWithGPT();