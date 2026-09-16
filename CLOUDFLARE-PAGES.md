# Cloudflare Pages 部署

本博客同时支持 GitHub Pages 和 Cloudflare Pages。两个平台的站点根路径不同：

- GitHub Pages：`/ZzBlog/`
- Cloudflare Pages：`/`

在 Cloudflare Pages 项目的 **Build settings** 中填写：

- Build command：`npm run build:cloudflare`
- Build output directory：`public`
- Node.js version：`22`

不要使用 `npm run build`，因为该命令是为 GitHub Pages 生成 `/ZzBlog/` 路径的资源链接，会导致 Cloudflare 上的 CSS 与 JavaScript 找不到。
