require("dotenv").config();
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { TextBlock } from "@anthropic-ai/sdk/resources/messages";
import fs from "fs";
import { basePrompt as Node_BASE_PROMPT } from "./defaults/node";
import { basePrompt as React_BASE_PROMPT } from "./defaults/react";
import cors from "cors";

const app = express();

const anthropic = new Anthropic();
const model = "claude-3-5-sonnet-20241022";

app.use(cors({
  origin: "*", // Allow all origins for simplicity, adjust as needed
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));
app.use(express.json());


app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;
  var response = await anthropic.messages.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model,
    max_tokens: 200,
    system:
      "Return neither node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything else.",
  });

  const answer = (response.content[0] as TextBlock).text.trim().toLowerCase();

  if (answer === "react") {
    res.json({
      prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project 
                 visible to you.\nConsider the contents of ALL files in the project.\n\n${React_BASE_PROMPT}
                Here is a list of files that exists on the file system but are not being shown to you:  \n - .gitignore \n - .package-lock.json \n - .bolt/prompt`],
      uiPrompt : React_BASE_PROMPT,
      template: "react",
    });
    return;
  }

  if (answer === "node") {
    res.json({
      prompts: [`Here is an artifact that contains all files of the project 
                 visible to you.\nConsider the contents of ALL files in the project.\n\n${Node_BASE_PROMPT}
                Here is a list of files that exists on the file system but are not being shown to you:  \n - .gitignore \n - .package-lock.json \n - .bolt/prompt`],
      uiPrompt : Node_BASE_PROMPT,
      template: "node",
    });
    return;
  }

  res.status(403).send("Invalid response, expected 'node' or 'react'");
  return;
});

app.post("/chat", async (req, res) => {
  const messages = req.body.messages;
  console.log("Messages received:", messages);
  const system = getSystemPrompt();
  const response = await anthropic.messages.create({
    messages,
    model,
    max_tokens: 8000,
    system,
  });

  console.log(response);

  res.json(response);
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");  
});



// async function main() {
//   anthropic.messages
//     .stream({
//       messages: [
//         {
//           role: "user",
//           content: `For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, 
//             React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n`,
//         },
//         {
//           role: "user",
//           content: `"Here is an artifact that contains all files of the project 
//                 visible to you.\nConsider the contents of ALL files in the project.\n\n${BASE_PROMPT}
//                 Here is a list of files that exists on the file system but are not being shown to you:
//                 \n - .gitignore
//                 \n - .package-lock.json
//                 \n - .bolt/prompt
//                     `,
//         },
//         {
//           role: "user",
//           content: `Create a simple Todo app`,
//         },
//       ],
//       model,
//       max_tokens: 8000,
//       system: getSystemPrompt(),
//     })
//     .on("text", (text) => {
//       console.log(text);
//     });
// }

// main();
