const { app, BrowserWindow, dialog, shell } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

let composeProcess;

function findDockerExecutable() {
  const candidates = process.platform === "win32"
    ? [
        path.join(process.env.ProgramFiles || "C:\\Program Files", "Docker", "Docker", "resources", "bin", "docker.exe"),
        path.join(process.env.ProgramFiles || "C:\\Program Files", "Docker", "Docker", "resources", "cli-plugins", "docker.exe"),
        path.join(process.env.USERPROFILE || "", ".docker", "bin", "docker.exe"),
      ]
    : ["docker"];

  return candidates.find((candidate) => candidate === "docker" || fs.existsSync(candidate));
}

function startRuntime() {
  const runtimePath = path.join(process.resourcesPath, "runtime");
  const dockerExecutable = findDockerExecutable();
  if (!dockerExecutable) {
    dialog.showMessageBox({
      type: "warning",
      title: "Docker Desktop is required",
      message: "Docker Desktop was not found. Start Docker Desktop and reopen HRS Tech Security Dashboard.",
    });
    return;
  }

  composeProcess = spawn(dockerExecutable, ["compose", "up", "-d", "--build"], {
    cwd: runtimePath,
    windowsHide: true,
    stdio: "ignore",
  });
  composeProcess.on("error", (error) => {
    dialog.showErrorBox("Unable to start application services", `Docker could not start the HRS services.\n\n${error.message}`);
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: "#09111d",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const entrypoint = path.join(__dirname, "..", "dist", "public", "index.html");
  window.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    dialog.showErrorBox("Unable to load dashboard", `${errorDescription} (${errorCode})\n\n${entrypoint}`);
  });
  window.loadFile(entrypoint).catch((error) => {
    dialog.showErrorBox("Unable to load dashboard", `${error.message}\n\n${entrypoint}`);
  });
}

app.whenReady().then(() => {
  createWindow();
  startRuntime();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});