import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import fs from "fs";

import * as IPFS from "ipfs-core";

const ipfs = await IPFS.create();
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.render("home");
  console.log("home hit");
});

app.post("/upload", (req, res) => {
  const file = req.files.file;
  const fileName = req.body.fileName;
  const filePath = "files/" + fileName;

  file.mv(filePath, async (err) => {
    if (err) {
      console.log("error: failed to download the file.");
      return res.status(500).send(err);
    }
    const fileHash = await addFile(fileName, filePath);
    fs.unlink(filePath, (err) => {
      if (err) console.log(err);
    });

    res.render("upload", { fileName, fileHash });
  });
});

const addFile = async (fileName, filePath) => {
  const file = fs.readFileSync(filePath);
  const fileAdded = await ipfs.add({ path: fileName, content: file });

  const fileHash = fileAdded.cid;
  console.log(fileAdded);
  return fileHash;
};

app.listen(8080, "127.0.0.1", () => {
  console.log("Server is running on port 8080");
});
