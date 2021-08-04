const express = require("express");
const fs = require("fs");
const path = require("path");
const promisify = require("util.promisify");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const multer = require("multer");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readDir = promisify(fs.readdir); // not needed, we used it for listing files - now db is better and faster
const unlink = promisify(fs.unlink);

const jsonParser = bodyParser.json();
const fileUploader = multer({ dest: "uploads/" });

console.log("Arguments", process.argv);

const app = express();

// get the client
const mysql = require("mysql2");

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "szkolenie",
  password: "example",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const getUploadedFilePath = (fileName) => {
  return path.join(__dirname, "uploads", fileName);
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
  // Pobrać plik, i umieścić o nim dane w bazie. (Zapis pliku do katalogu robi za nas multer)
  console.log(req.file);
  pool.query(
    "INSERT INTO files (name, path, size, ext) VALUES (?, ?, ?, ?)",
    [
      req.file.originalname,
      req.file.filename,
      req.file.size,
      req.file.originalname.substring(req.file.originalname.length - 4),
    ],
    (err, results) => {
      if (err) return res.status(500).send(err.message);

      return res.send({ id: results.insertId });
    }
  );
});

app.get("/file", async (req, res) => {
  // Chcemy pobrać pliki
  pool.query("SELECT id, name, size, pass FROM files", (err, response) => {
    if (err) return res.status(500).send(err.message);

    res.json(
      response.map((r) => ({
        id: r.id,
        name: r.name,
        size: r.size,
        protected: !!r.pass,
      }))
    );
  });
});

app.delete("/file/:id", async (req, res) => {
  pool.query(
    "SELECT path FROM files WHERE id = ?",
    [req.params.id],
    function (err, results) {
      if (err) return res.status(500).send(err.message);
      if (results.length === 0) return res.status(404).json("Not found");

      if (results[0].pass && results[0].pass !== req.query.pass) {
        return res.status(403).send("File is protected");
      }
      const toDelete = getUploadedFilePath(results[0].path);
      pool.query(
        "DELETE FROM files WHERE id = ?",
        [req.params.id],
        async (err, results) => {
          if (err) return res.status(500).send(err.message);

          try {
            await unlink(toDelete);
            res.send("Deleted");
          } catch (err) {
            req.error(err.message);
          }
        }
      );
    }
  );
});

app.post("/file/:id", async (req, res) => {
  pool.query(
    "SELECT pass FROM files WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).send(err.message);
      if (results.length === 0) return res.status(404).json("Not found");

      const pass = results[0].pass;
      if (pass) {
        if (req.query.pass !== pass) {
          return res.status(403).send("File is protected");
        }
      }

      pool.query(
        "UPDATE files SET `pass` = ? WHERE id = ?",
        [req.query.newPass, req.params.id],
        function (err, results) {
          if (err) return res.status(500).send("Could not change password");
          console.log(this.sql);
          res.send("File access password Set!");
        }
      );
    }
  );
});

app.get("/file/:id", async (req, res) => {
  pool.query(
    "SELECT * FROM files WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).send(err.message);

      if (results.length === 0) {
        return res.status(404).send(`File ${req.params.id} not found`);
      }

      if (results[0].pass && results[0].pass !== req.query.pass) {
        return res.status(403).send("File is protected");
      }

      res.contentType("image/png");
      res.sendFile(getUploadedFilePath(results[0].path));
    }
  );
});

const start = async () => {
  // this is only for auto import database schema (on each run)
  {
    const query = async (sqlRow) => {
      return new Promise((resolve, reject) => {
        pool.query(sqlRow, (err, result, fields) => {
          if (err) return reject(err);

          return resolve();
        });
      });
    };
    const fileData = fs
      .readFileSync(path.join(__dirname, "schema.sql"))
      .toString();
    const sqls = fileData.split(";\r");
    for (let i = 0; i < sqls.length; ++i) {
      if (sqls[i].trim() === "") continue;

      await query(sqls[i]);
    }
  }

  app.listen(2000, () => {
    console.log("App is listening on", 2000);
  });
};
start();
