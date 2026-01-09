const fetch = require("node-fetch");
const FormData = require("form-data");
let url = "https://nekoweb.org/api/files/upload";
const form = new FormData();

form.append("pathname", "/test");
form.append("files", "test.txt", { filepath: "./test.txt" });

let { APIKEY, DOMAIN, USERNAME, DIRECTORY } = process.env;

let options = {
    method: "POST",
    headers: {
        Authorization: APIKEY
    }
};

options.body = form;

fetch(url, options)
    .then(res => res)
    .then(json => console.log(json))
    .catch(err => console.error("err: ", err));