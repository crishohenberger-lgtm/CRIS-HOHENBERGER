import { ReplitConnectors } from "@replit/connectors-sdk";
import fs from "fs";
import path from "path";

const connectors = new ReplitConnectors();
const FOLDER_ID = "18sHINywMVNA0kmCV77xLvETEOVbjJyyp";
const OUT_DIR = "artifacts/apresentacao/img/artistas";

fs.mkdirSync(OUT_DIR, { recursive: true });

// 1. List files in folder
console.log("Listando arquivos na pasta...");
const listResp = await connectors.proxy("google-drive", `/drive/v3/files`, {
  method: "GET",
  params: {
    q: `'${FOLDER_ID}' in parents and trashed=false`,
    fields: "files(id,name,mimeType,size)",
    pageSize: "100",
  },
});
const listData = await listResp.json();

if (listData.error) {
  console.error("Erro ao listar:", JSON.stringify(listData.error));
  process.exit(1);
}

const files = listData.files || [];
console.log(`Encontrados ${files.length} arquivo(s):\n`);
for (const f of files) {
  console.log(`  [${f.mimeType}] ${f.name} (${f.id})`);
}

// 2. Download image files
const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const images = files.filter(f => imageTypes.includes(f.mimeType));
console.log(`\nBaixando ${images.length} imagem(ns)...`);

const downloaded = [];
for (const img of images) {
  try {
    const dlResp = await connectors.proxy("google-drive", `/drive/v3/files/${img.id}`, {
      method: "GET",
      params: { alt: "media" },
    });

    const ext = img.mimeType === "image/png" ? ".png" :
                img.mimeType === "image/webp" ? ".webp" : ".jpg";
    const safeName = img.name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
    const fileName = safeName.endsWith(ext) ? safeName : safeName.replace(/\.[^.]+$/, "") + ext;
    const filePath = path.join(OUT_DIR, fileName);

    const buffer = Buffer.from(await dlResp.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`  ✓ ${fileName} (${Math.round(buffer.length / 1024)} KB)`);
    downloaded.push({ name: img.name, file: fileName, path: filePath });
  } catch (e) {
    console.error(`  ✗ Erro em ${img.name}:`, e.message);
  }
}

console.log(`\nPronto. ${downloaded.length} imagem(ns) salva(s) em ${OUT_DIR}/`);
console.log(JSON.stringify(downloaded, null, 2));
