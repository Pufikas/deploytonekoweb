const FormData = require("form-data");
let url = "https://nekoweb.org/api/files/upload";
const form = new FormData();
let { APIKEY, DOMAIN, USERNAME, DIRECTORY } = process.env;

const srcDir = path.resolve("..", DIRECTORY);

form.append("pathname", `/${DIRECTORY}`);
form.append("files", filename, { filepath: srcDir });

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