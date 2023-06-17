const express = require('express');
const bodyParser = require('body-parser');
const programmer = require('./database/tables/programmer');

const app = express();
const port = 5000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.get('/syncDatabase', async (req, res) => {
    const database = require('./database/db');

    try {
        await database.sync();

        res.send('Database successfully sync.');
    } catch (err) {
        res.send(err);
    }
});

app.post('/createProgrammer', async (req, res) => {
    try {
        const params = req.body;

        const properties = ['name', 'javascript', 'java', 'python'];

        validateProperties(properties, params, 'every');

        const newProgrammer = await programmer.create({
            name: params.name,
            javascript: params.javascript,
            java: params.java,
            python: params.python,
        });

        res.status(201).send(newProgrammer);

    } catch (err) {
        if (err == "Request body doesn't have the expected properties") {
            res.status(400).send(err);
            return;
        }
        res.status(500).send(err);
    }
});

app.get('/retrieveProgrammer/:id', async (req, res) => {
    try {
        const params = req.params;

        const record = await programmer.findByPk(params.id);
        if (record) {
            res.status(200).send(record);
        } else {
            res.status(404).send('No programmer found using received ID');
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/retrieveProgrammer', async (req, res) => {
    try {
        const records = await programmer.findAll();
        res.status(200).send(records);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/updateProgrammer', async (req, res) => {
    try {
        const params = req.body;

        const record = await validateID(params);

        const properties = ['name', 'javascript', 'java', 'python'];

        validateProperties(properties, params, 'some');

        record.name = params.name || record.name;
        record.python = params.python || record.python;
        record.java = params.java || record.java;
        record.javascript = params.javascript || record.javascript;

        await record.save();

        res.status(200).send(`${record.id} ${record.name} - Updated successfully`);
    } catch (err) {
        res.send(err);
    }
});

app.delete('/deleteProgrammer', async (req, res) => {
    try {
        const params = req.body;

        const record = await validateID(params);

        await record.destroy();

        res.status(200).send(`${record.id} ${record.name} - Deleted successfully`);
    } catch (err) {
        if (err == "Missing 'id' in request body") {
            res.status(400).send(err);
            return;
        }
        if (err == 'Programmer ID not found') {
            res.status(404).send(err);
            return;
        }
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

const validateProperties = (properties, params, fn) => {

    const checkProperty = properties[fn]((property) => {
        return property in params;
    });
    const checkParam = Object.keys(params)[fn]((param) => {
        return param in properties;
    });
    if (!(checkProperty && checkParam)) {
        throw "Request body doesn't have the expected properties";
    }

    return true;
};

const validateID = async (params) => {
    if (!('id' in params)) {
        throw "Missing 'id' in request body";
    }
    const record = await programmer.findByPk(params.id);
    if (!record) {
        throw 'Programmer ID not found';
    }
    return record;
};