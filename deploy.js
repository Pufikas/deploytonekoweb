const FormData = require("form-data");
const path = require("path");
const fs = require("fs");
const url = "https://nekoweb.org/api/files/upload";
const form = new FormData();
const { APIKEY, DOMAIN, USERNAME, DIRECTORY } = process.env;

const srcDir = path.resolve("..", DIRECTORY);

function getAllFiles(dir, files = []) {
    for (const file of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            getAllFiles(fullPath, files);
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

const files = getAllFiles(srcDir);

form.append("pathname", `/${DIRECTORY}`);

for (const filePath of files) {
    const relative = path.relative(srcDir, filePath);
    form.append("files", fs.createReadStream(filePath), {
        filename: relative
    });
}

let options = {
    method: "POST",
    headers: {
        Authorization: APIKEY,
        ...form.getHeaders()
    }
};

options.body = form;

fetch(url, options)
    .then(res => res)
    .then(json => console.log(json))
    .catch(err => console.error("err: ", err));