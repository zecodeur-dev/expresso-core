#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const command = process.argv[2];
const commandArgs = process.argv.splice(3);
const isApi = commandArgs.includes("--api") || commandArgs.includes("-A");

const defaultConfig = require("../expresso.json");
let config = defaultConfig;
try {
  const userConfig = require(path.join(process.cwd(), "expresso.json"));
  for (let k in userConfig) {
    config[k] = userConfig[k];
  }
} catch (_) {}

class Scripts {
  static server = `nodemon --quiet ${config.main} --config nodemon.json`;
  static tailwindBuild = `tailwindcss -i app/views/global.css -o ${config.tailwind.output} --watch`;
  static dev = isApi
    ? Scripts.server
    : `concurrently ${
        config.tailwind.logs ? "" : "--raw"
      } -n "SERVER,TAILWIND" -c "cyan,magenta" "${Scripts.server}" "${
        Scripts.tailwindBuild
      }"`;
  static start = `node ${config.main}`;
}

if (!Scripts[command]) {
  console.error(`Command not found: ${command}`);
  process.exit(1);
}

const [cmd, ...args] = Scripts[command].split(" ");
const child = spawn(cmd, args, { stdio: "inherit", shell: true });

child.on("close", (code) => {
  process.exit(code);
});
