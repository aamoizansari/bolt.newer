"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const prompts_1 = require("./prompts");
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const app = (0, express_1.default)();
const anthropic = new sdk_1.default();
const model = "claude-3-5-sonnet-20241022";
app.use(express_1.default.json());
app.post("/template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = req.body.prompt;
    var response = yield anthropic.messages.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        model,
        max_tokens: 200,
        system: "Return neither node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything else.",
    });
    const answer = response.content[0].text.trim().toLowerCase();
    if (answer === "react") {
        res.json({
            prompts: [prompts_1.BASE_PROMPT, `Here is an artifact that contains all files of the project 
                 visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}
                Here is a list of files that exists on the file system but are not being shown to you:  \n - .gitignore \n - .package-lock.json \n - .bolt/prompt`],
            uiPrompt: react_1.basePrompt,
            template: "react",
        });
        return;
    }
    if (answer === "node") {
        res.json({
            prompts: [`Here is an artifact that contains all files of the project 
                 visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.basePrompt}
                Here is a list of files that exists on the file system but are not being shown to you:  \n - .gitignore \n - .package-lock.json \n - .bolt/prompt`],
            uiPrompt: node_1.basePrompt,
            template: "node",
        });
        return;
    }
    res.status(403).send("Invalid response, expected 'node' or 'react'");
    return;
}));
app.post("/chats", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = req.body.messages;
    console.log("Messages received:", messages);
    const system = (0, prompts_1.getSystemPrompt)();
    const response = yield anthropic.messages.create({
        messages,
        model,
        max_tokens: 8000,
        system,
    });
    console.log(response);
    res.json(response);
}));
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
