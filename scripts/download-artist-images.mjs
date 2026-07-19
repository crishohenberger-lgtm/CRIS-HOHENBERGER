import { ReplitConnectors } from "@replit/connectors-sdk";
import fs from "fs";
import path from "path";

const connectors = new ReplitConnectors();
const FOLDER_ID = "18sHINywMVNA0kmCV77xLvETEOVbjJyyp";
const OUT_DIR = "artifacts/apresentacao/img/artistas";

fs.mkdirSync(OUT_DIR, { recursive: true });

// 1. List all items (files + subfolders) in folder
console.log("Listando pasta:", FOLDER_ID);
const listResp = await connectors.proxy("google-drive", "/drive/v3/files", {
  method: "GET",
  params: {
    q: `'${FOLDER_ID}' in parents and trashed=false`,
    fields: "files(id,name,mimeType,size)",
    pageSize: "100",
  },
});
const listData = await listResp.json();

if (listData.error) {
  console.error("Erro ao listar:", JSON.stringify(listData.error, null, 2));
  process.exit(1);
}

const files = listData.files || [];
console.log(`\nEncontrados ${files.length} item(ns):\n`);
for (const f of files) {
  const type = f.mimeType.includes("folder") ? "PASTA" :
               f.mimeType.startsWith("image/") ? "IMAGEM" :
               f.mimeType.split("/")[1]?.toUpperCase() || f.mimeType;
  console.log(`  [${type}] ${f.name}  (${f.id})`);
}

// 2. Check subfolders recursively (one level)
const subfolders = files.filter(f => f.mimeType === "application/vnd.google-apps.folder");
let allImages = files.filter(f => f.mimeType.startsWith("image/"));

for (const folder of subfolders) {
  console.log(`\nEntrando em subfolder: ${folder.name}`);
  const subResp = await connectors.proxy("google-drive", "/drive/v3/files", {
    method: "GET",
    params: {
      q: `'${folder.id}' in parents and trashed=false`,
      fields: "files(id,name,mimeType,size)",
      pageSize: "100",
    },
  });
  const subData = await subResp.json();
  const subFiles = subData.files || [];
  const subImages = subFiles.filter(f => f.mimeType.startsWith("image/"));
  console.log(`  ${subFiles.length} arquivo(s), ${subImages.length} imagem(ns)`);
  for (const f of subFiles) {
    console.log(`    [${f.mimeType.split("/")[1]}] ${f.name}`);
  }
  allImages = allImages.concat(subImages);
}

// 3. Download images
console.log(`\nBaixando ${allImages.length} imagem(ns)...`);
const downloaded = [];

for (const img of allImages) {
  try {
    const dlResp = await connectors.proxy("google-drive", `/drive/v3/files/${img.id}`, {
      method: "GET",
      params: { alt: "media" },
    });

    const ext = img.mimeType === "image/png" ? ".png" :
                img.mimeType === "image/webp" ? ".webp" : ".jpg";
    const base = img.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
    const fileName = base + ext;
    const filePath = path.join(OUT_DIR, fileName);

    const buffer = Buffer.from(await dlResp.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`  ✓ ${fileName} (${Math.round(buffer.length / 1024)} KB)`);
    downloaded.push({ original: img.name, file: fileName });
  } catch (e) {
    console.error(`  ✗ ${img.name}: ${e.message}`);
  }
}

console.log(`\n✓ ${downloaded.length} imagem(ns) salva(s) em ${OUT_DIR}/`);
if (downloaded.length) console.log(JSON.stringify(downloaded, null, 2));
