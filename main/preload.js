const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  chatWithOpenAI: async (userMessage) =>
    ipcRenderer.invoke("chat-with-openai", userMessage),
});
