const path = require("path");
const { OpenAI } = require("openai");
const { app, BrowserWindow, ipcMain } = require("electron");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // for security
      contextIsolation: true, // recommended
      preload: path.join(__dirname, "preload.js"), // we’ll create it next
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // mainWindow.webContents.openDevTools(); // Uncomment for debugging
}

app.whenReady().then(() => {
  createWindow();

  // Mac OS re-create window on dock click if no other windows open
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed (except on Mac).
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// Listen for messages from the renderer to get an AI response
ipcMain.handle("chat-with-openai", async (event, userMessage) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: userMessage },
      ],
    });

    const aiContent = response.choices[0].message.content;
    return aiContent;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return "Error: Unable to get response from OpenAI.";
  }
});
