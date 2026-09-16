import { spawnSync } from "node:child_process";
import { execPath } from "node:process";

const isGitHubPages = process.argv.includes("--github-pages");
const args = ["generate"];

if (isGitHubPages) {
  console.log("Building for GitHub Pages with root path '/ZzBlog/'.");
} else {
  args.push("--config", "_config.yml,_config.cloudflare.yml");
  console.log("Building for Cloudflare with root path '/'.");
}

const result = spawnSync(execPath, ["node_modules/hexo/bin/hexo", ...args], { stdio: "inherit" });
process.exit(result.status ?? 1);
