# Cloudflare Pages 部署

本博客同时支持 GitHub Pages 和 Cloudflare Pages。两个平台的站点根路径不同：

- GitHub Pages：`/ZzBlog/`
- Cloudflare Pages：`/`

在 Cloudflare Pages 项目的 **Build settings** 中填写：

- Build command：`npm run build`
- Build output directory：`public`
- Node.js version：`22`

构建脚本会识别 Cloudflare Pages 自动注入的 `CF_PAGES=1`，并生成根路径的资源链接；同一个 `npm run build` 在 GitHub Actions 中仍会保留 `/ZzBlog/` 路径。
