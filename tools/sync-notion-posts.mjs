import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;
const names = {
  publish: process.env.NOTION_PUBLISH_PROPERTY || "发布到博客",
  title: process.env.NOTION_TITLE_PROPERTY || "名称",
  date: process.env.NOTION_DATE_PROPERTY || "日期",
  tags: process.env.NOTION_TAGS_PROPERTY || "标签",
  category: process.env.NOTION_CATEGORY_PROPERTY || "分类"
};
if (!token || !databaseId) {
  console.log("Skipping Notion sync: NOTION_TOKEN or NOTION_DATABASE_ID is not configured.");
  process.exit(0);
}
const headers = { Authorization: `Bearer ${token}`, "Notion-Version": "2025-09-03", "Content-Type": "application/json" };
async function notion(path, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${path}`, { headers, ...options });
  if (!response.ok) throw new Error(`Notion API ${response.status}: ${await response.text()}`);
  return response.json();
}
const plain = (items = []) => items.map((item) => item.plain_text || item.text?.content || "").join("").trim();
function value(property) {
  if (!property) return "";
  if (property.type === "title" || property.type === "rich_text") return plain(property[property.type]);
  if (property.type === "select") return property.select?.name || "";
  if (property.type === "date") return property.date?.start || "";
  return "";
}
function values(property) {
  if (!property) return [];
  if (property.type === "multi_select") return property.multi_select.map((item) => item.name);
  const item = value(property);
  return item ? [item] : [];
}
const yamlList = (items) => items.length ? `\n${items.map((item) => `  - ${item}`).join("\n")}` : " []";
function markdown(block) {
  const data = block[block.type];
  if (!data) return "";
  const content = plain(data.rich_text);
  const prefix = { heading_1: "# ", heading_2: "## ", heading_3: "### ", bulleted_list_item: "- ", numbered_list_item: "1. ", quote: "> " }[block.type];
  if (prefix) return `${prefix}${content}`;
  if (block.type === "to_do") return `- [${data.checked ? "x" : " "}] ${content}`;
  if (block.type === "code") return `\`\`\`${data.language || ""}\n${content}\n\`\`\``;
  return block.type === "divider" ? "---" : content;
}
async function children(pageId) {
  const blocks = [];
  let cursor = "";
  do {
    const page = await notion(`/blocks/${pageId}/children${cursor ? `?start_cursor=${encodeURIComponent(cursor)}` : ""}`);
    blocks.push(...page.results);
    cursor = page.has_more ? page.next_cursor : "";
  } while (cursor);
  return blocks.map(markdown).filter(Boolean).join("\n\n");
}

const database = await notion(`/databases/${databaseId}`);
const dataSourceId = database.data_sources?.[0]?.id;
if (!dataSourceId) throw new Error("No data source was found in NOTION_DATABASE_ID.");
const dataSource = await notion(`/data_sources/${dataSourceId}`);
const publishProperty = dataSource.properties?.[names.publish]?.id || names.publish;
const queue = await notion(`/data_sources/${dataSourceId}/query`, { method: "POST", body: JSON.stringify({ filter: { property: publishProperty, checkbox: { equals: true } }, page_size: 100 }) });
console.log(`Found ${queue.results.length} post(s) marked ${names.publish}.`);
await mkdir(resolve("source/_posts"), { recursive: true });
for (const page of queue.results) {
  const properties = page.properties;
  const title = value(properties[names.title]);
  const date = value(properties[names.date]) || new Date().toISOString().slice(0, 10);
  if (!title) throw new Error(`Page ${page.id} is missing the ${names.title} title.`);
  const filename = `${date.slice(0, 10)}-${title.replace(/[\\/:*?"<>|]/g, "-")}.md`;
  const frontMatter = ["---", `title: ${title}`, `date: ${date.length === 10 ? `${date} 12:00:00` : date}`, `tags:${yamlList(values(properties[names.tags]))}`, `categories:${yamlList(values(properties[names.category]))}`, "---", ""].join("\n");
  await writeFile(resolve("source/_posts", filename), `${frontMatter}\n${await children(page.id)}\n`, "utf8");
  await notion(`/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ properties: { [names.publish]: { checkbox: false } } }) });
  console.log(`Synced: ${filename}`);
}
