const express = require("express");
const fs = require("fs");
const path = require("path");
const promisify = require("util.promisify");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const multer = require("multer");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readDir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

const jsonParser = bodyParser.json();
const fileUploader = multer({ dest: "uploads/" });

const app = express();

const cache = {}; // {  <name>: {meta data} }
const listCache = [];

const fillCache = async () => {
  const files = await readDir(path.join(__dirname, "uploads"));
  const filesToCache = files.filter((f) => f.endsWith(".txt"));

  for (let i = 0; i < filesToCache.length; ++i) {
    try {
      const content = await readFile(
        path.join(__dirname, "uploads", filesToCache[i])
      );
      const meta = JSON.parse(content);

      if (!cache.hasOwnProperty(meta.name)) {
        cache[meta.name] = [];
      }

      cache[meta.name].push({
        file: filesToCache[i].substring(0, filesToCache[i].length - 4),
        meta,
      });
      listCache.push(`${meta.name}${meta.pass ? "*" : ""}`);
    } catch (err) {
      console.log(`  Error reading [${filesToCache[i]}]`);
    }
  }

  console.log(cache);
};

function start() {
  const getFileDiskName = (userName) => {
    const hasher = crypto.createHash("whirlpool");

    return hasher.update(userName).digest("hex");
  };

  {
    // loggers
    // log API request
    app.use((req, res, next) => {
      console.log("Request method", req.method, "received for", req.path);

      next();
    });
    // log empty file request(additional)
    app.get("/file", (req, res, next) => {
      console.log("Empty file requested");

      next();
    });
  }

  {
    // Parsers
    // jsonParser for PUT and POST
    app.use((req, res, next) => {
      if (["post", "put"].indexOf(req.method.toLowerCase()) !== -1) {
        return jsonParser(req, res, next);
      }

      next();
    });
  }

  app.put("/file", fileUploader.single("file"), async (req, res) => {
    const file = await getMetaFile(req.file.originalname);
    if (file) {
      await unlink(path.join(__dirname, "uploads", req.file.filename)); // remove already uploaded and saved file by multer

      return res.status(400).send("File of this name already exists");
    }

    const hash = req.file.filename;
    const obj = JSON.stringify({
      name: req.file.originalname,
      size: req.file.size,
      pass: req.query.pass ? req.query.pass : undefined,
    });

    try {
      await writeFile(path.join(__dirname, "uploads", `${hash}.txt`), obj);
      if (!cache.hasOwnProperty(req.file.originalname)) {
        cache[req.file.originalname] = [];
      }
      cache[req.file.originalname].push({ file: hash, meta: obj });
      listCache.push(req.file.originalname);

      return res.status(201).send(req.file.size.toString());
    } catch (error) {
      res.status(500);
      res.send(error.message);
    }
  });

  app.get("/file", async (req, res) => {
    return res.json(listCache);
  });

  app.delete("/file/:name", async (req, res, next) => {
    const file = await getMetaFile(req.params.name);
    if (!file) {
      return res.status(404).send("Not Found");
    }
    if (file.meta.pass && req.query.pass === file.meta.pass) {
      // nothing - it is ok
    } else {
      if (file.meta.pass) {
        return res.status(403).send("File is Protected");
      }
    }

    try {
      await unlink(path.join(__dirname, "uploads", file.file));
      await unlink(path.join(__dirname, "uploads", `${file.file}.txt`));

      cache[req.params.name] = [];
      const index = listCache.indexOf(req.params.name);
      if (index) {
        listCache.splice(index, 1);
      }
      return res.send(true);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.post("/file/:name", async (req, res) => {
    const file = await getMetaFile(req.params.name);

    try {
      if (file.meta.pass && req.query.pass !== file.meta.pass) {
        return res.status(403).send("File is Protected");
      }

      file.meta.pass = req.query.newPass;

      await writeFile(
        path.join(__dirname, "uploads", `${file.file}.txt`),
        JSON.stringify(file.meta)
      );
      res.status(200).send("Password set");
    } catch (err) {
      res.status(500);
      res.send(err.message);
    }
  });

  const getMetaFile = async (needle) => {
    if (cache.hasOwnProperty(needle)) {
      if (cache[needle].length === 0) return undefined;
      return cache[needle][0];
    }
  };

  app.get("/file/:name", async (req, res) => {
    const file = await getMetaFile(req.params.name);
    if (!file) {
      return res.status(404).send("Not Found");
    }
    console.log(file);
    if (file.meta.pass && req.query.pass === file.meta.pass) {
      // nothing - it is ok
    } else {
      if (file.meta.pass) {
        return res.status(403).send("File is Protected");
      }
    }

    res.set("Content-Type", "text/plain");
    // res.set('Content-Type', 'image/jpeg');
    res.sendFile(path.join(__dirname, "uploads", file.file));
  });

  app.listen(2000, () => {
    console.log("App is listening on", 2000);
  });
}

async function init() {
  await fillCache();

  start();
}
init();
