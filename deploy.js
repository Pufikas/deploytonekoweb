const JSZip = require("jszip");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const { APIKEY, DOMAIN, USERNAME } = process.env;
const API = "https://nekoweb.org/api";

const SITE_DIR = path.join(process.cwd(), "site");
const ZIP_PATH = path.join(process.cwd(), "deploy.zip");

const IGNORE = new Set([
	".git",
	".github",
	"node_modules",
	"deploytonekoweb",
	"deploy.zip"
]);

async function zipDirectory(inputDir, outputZipPath) {
	const zip = new JSZip();

	async function addFiles(dir, zipDir = "") {
		const entries = await fsp.readdir(dir, { withFileTypes: true });
		
		for (const entry of entries) {
			if (IGNORE.has(entry.name)) continue;

			const full = path.join(dir, entry.name);
			const zipPath = path.join(zipDir, entry.name);

			if (entry.isDirectory()) {
				await addFiles(full, zipPath);
			} else {
				zip.file(zipPath, await fsp.readFile(full));
			}
		}
	}
	
	await addFiles(inputDir);

	const buf = await zip.generateAsync({ type: "nodebuffer" });
	await fsp.writeFile(outputZipPath, buf);
}

async function apiFetch(url, options = {}) {
	const res = await fetch(url, {
		...options,
		headers: {
			Authorization: APIKEY,
			...(options.headers || {})
		}
	});

	const text = await res.text();

	if (!res.ok) {
		throw new Error(`API ${res.status}: ${text}`);
	}

	return text;
}

async function getZipId() {
	const res = await apiFetch(`${API}/files/big/create`, { method: "GET" });
	const json = JSON.parse(res);
	console.log("zip id: ", json.id);
	return json.id;
}

async function appendZip() {
	const form = new FormData();
	form.append("id", id);
	form.append(
		"file",
		new Blob([fs.readFileSync(filePath)], { type: "application/zip" }),
		"deploy.zip"
	);

	await apiFetch(`${API}/files/big/append`, { method: "POST", body: form });
}

async function importZip(id) {
	await apiFetch(`${API}/files/import/${id}`, { method: "POST" });
}

(async () => {
	await zipDirectory(SITE_DIR, ZIP_PATH);

	const sizeMB = (fs.statSync(ZIP_PATH).size / 1024 / 1024).toFixed(2);
	console.log(`ZIP Size: ${sizeMB} MB`);

	const id = await getZipId();
	console.log(`ZIP id is: ${id}`);

	await appendZip(id, ZIP_PATH);

	await importZip(id);
	console.log(`Done for: ${id}`);
})().catch(err => {
	console.error(`err: ${err}`);
});
