#!/usr/bin/env node
// Sube las fotos de un proyecto a R2 y lo añade (o actualiza) en public/data/proyectos.json
// Uso: node scripts/subir-proyecto.mjs <carpeta-con-fotos> <id-proyecto> ["Título"] [sector]
//   sector: oficinas | espacios-publicos | hospitales | formacion
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { execFileSync } from "node:child_process";

const [dir, id, titulo, sector = "oficinas"] = process.argv.slice(2);
if (!dir || !id || !/^[a-z0-9-]+$/.test(id)) {
  console.error('Uso: node scripts/subir-proyecto.mjs <carpeta> <id-en-minusculas-con-guiones> ["Título"] [sector]');
  process.exit(1);
}
const TIPOS = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };
const fotos = readdirSync(dir).filter((f) => TIPOS[extname(f).toLowerCase()]).sort();
if (!fotos.length) { console.error("No hay fotos (.jpg, .png, .webp, .avif) en " + dir); process.exit(1); }

const imagenes = [];
fotos.forEach((f, i) => {
  const nombre = String(i + 1).padStart(2, "0") + extname(f).toLowerCase().replace(".jpeg", ".jpg");
  const key = `proyectos/${id}/${nombre}`;
  console.log(`Subiendo ${f} -> ${key}`);
  execFileSync("npx", ["wrangler", "r2", "object", "put", `welcomeoffice-media/${key}`,
    "--file", join(dir, f), "--content-type", TIPOS[extname(f).toLowerCase()], "--remote"], { stdio: "inherit" });
  imagenes.push({ src: `/media/${key}`, alt: `${titulo || id} — foto ${i + 1}` });
});

const ruta = "public/data/proyectos.json";
const data = JSON.parse(readFileSync(ruta, "utf8"));
const existente = data.proyectos.find((p) => p.id === id);
if (existente) {
  existente.imagenes = imagenes;
} else {
  data.proyectos.unshift({
    id, titulo: titulo || id, cliente: "", ubicacion: "", anio: new Date().getFullYear(),
    sector, servicios: [], descripcion: "", imagenes,
  });
}
writeFileSync(ruta, JSON.stringify(data, null, 2) + "\n");
console.log(`\nListo: ${imagenes.length} fotos. Revisa los textos del proyecto en ${ruta} y despliega con: npm run deploy`);
