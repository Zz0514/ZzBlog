import { spawnSync } from "node:child_process";
import { execPath } from "node:process";

const isCloudflarePages = process.env.CF_PAGES === "1";
const args = ["generate"];

if (isCloudflarePages) {
  args.push("--config", "_config.yml,_config.cloudflare.yml");
  console.log("Building for Cloudflare Pages with root path '/'.");
} else {
  console.log("Building for GitHub Pages with root path '/ZzBlog/'.");
}

const result = spawnSync(execPath, ["node_modules/hexo/bin/hexo", ...args], { stdio: "inherit" });
process.exit(result.status ?? 1);
