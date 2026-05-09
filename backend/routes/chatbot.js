import express from "express";
import { spawn } from "child_process";
import path from "path";

const router = express.Router();

router.post("/", (req, res) => {
  const { message } = req.body;

  const scriptPath = path.join(
    process.cwd(),
    "services",
    "chatbot.py"
  );

  const pythonProcess = spawn("python", [
    scriptPath,
    message
  ]);

  let result = "";

  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.log("Python Error:", data.toString());
  });

  pythonProcess.on("close", () => {
    res.json({
      reply: result.trim(),
    });
  });
});

export default router;