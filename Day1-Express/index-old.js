const express = require('express');
const fs = require('fs');
const path = require('path');
const promisify = require('util.promisify');
const crypto = require('crypto');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readDir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

console.log('Arguments', process.argv);

const app = express();

const getExistingFilesNames = async (files) => {
    const ret = [];
    for (let i = 0; i < files.length; ++i) {
        const file = await readFile(path.join(__dirname, 'uploads', files[i]));
        const data = JSON.parse(file);

        ret.push(data.name + (data.pass ? '*' : ''));
    }

    return ret;
}
const getFileDiskName = (userName) => {
    const hasher = crypto.createHash('whirlpool');

    return hasher.update(userName).digest('hex');
}

{ // loggers
// log API request
    app.use((req, res, next) => {
        console.log('Request method', req.method, 'received for', req.path);

        next();
    });
// log empty file request(additional)
    app.get('/file', (req, res, next) => {
        console.log('Empty file requested');

        next();
    });
}

app.get('/file', async (req, res) => {
    const files = await readDir(path.join(__dirname, 'uploads'));
    const names = await getExistingFilesNames(files);

    return res.json(names);
});
app.put('/file/:name/:content?', async (req, res) => {
    const hash = getFileDiskName(req.params.name);
    const obj = JSON.stringify({
        name: req.params.name,
        hash,
        content: req.params.content,
        pass: undefined,
    });

    try {
        await writeFile(path.join(__dirname, 'uploads', `${hash}.txt`), obj);

        return res.send(req.params.content);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
});
app.delete('/file/:name', async (req, res, next) => {
    const hash = getFileDiskName(req.params.name);
    const fileName = path.join(__dirname, 'uploads', `${hash}.txt`);

    try {
        await unlink(fileName);
        res.send(true);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
});

// get
// put

app.listen(2000, () => {
    console.log('App is listening on', 2000);
});


/*
    * File list (get list)
    * Create file (put)
    * Delete file (delete)
    * Get file (get)

WORK FOR HOME
    * Set MetaData (password) on [PUT], when [GET] check if the password from query is ok (field: pass)

    POST =>  Create /file.txt
    PUT => /file.txt  {readPassword: 'hasło'}
    GET => /file.txt?pass=password
 */
