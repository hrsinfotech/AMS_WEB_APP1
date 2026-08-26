import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  PORT: process.env.PORT || "24619",
  BASE_PATH: process.env.BASE_PATH || "/",
  NODE_ENV: "production",
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("pnpm", ["run", "build"]);
run("electron-builder", ["--win", "nsis", "--x64"]);