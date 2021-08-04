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
    let content;
    try {
        content = JSON.parse(await readFile(fileName));
    } catch (err) {
        return res.status(403).send('File not found');
    }

    try {
        if (content.pass && req.query.pass === content.pass) {
            await unlink(fileName);
            return res.send(true);
        } else {
            if (!content.pass) {
                await unlink(fileName);
                return res.send(true);
            }
            res.status(403).send('File is Protected');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/file/:name', async(req, res) => {
    const hash = getFileDiskName(req.params.name);
    const fileName = path.join(__dirname, 'uploads', `${hash}.txt`);

    try {
        const content = JSON.parse(await readFile(fileName));
        if (content.pass && req.query.pass !== content.pass) {
            return res.status(403).send('File is Protected');
        }

        content.pass = req.query.pass;

        await writeFile(fileName, JSON.stringify(content));
        res.status(200).send('Password set');
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
})

app.get('/file/:name', async (req, res) => {
    const hash = getFileDiskName(req.params.name);
    const fileName = path.join(__dirname, 'uploads', `${hash}.txt`);

    try {
        const content = JSON.parse(await readFile(fileName));
        if (content.pass && req.query.pass === content.pass) {
            return res.send(content.content);
        } else {
            if (!content.pass) {
                return res.send(content.content);
            }
            res.status(403).send('File is Protected');
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).send('File not found');

            return;
        }

        res.status(500);
        res.send(err.message);
    }
});

app.listen(2000, () => {
    console.log('App is listening on', 2000);
});
