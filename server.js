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

        validateProperties(params, 'every');

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

        validateProperties(params, 'some');

        for (property of properties) {
            if (params[property] != undefined) {
                record[property] = params[property]
            }
        }

        await record.save();

        res.status(200).send(`${record.id} ${record.name} - Updated successfully`);
    } catch (err) {
        if (err == "Request body doesn't have the expected properties") {
            res.status(400).send(err);
            return;
        }
        res.status(500).send(err);
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

app.delete('/deleteProgrammer/:id', async (req, res) => {
    try {
        const params = req.params;

        const record = await validateID(params);

        await record.destroy();

        res.status(200).send(`${record.id} ${record.name} - Deleted successfully`);
    } catch (err) {
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

const validateProperties = (params, fn) => {
    const properties = ['name', 'javascript', 'java', 'python'];

    const checkProperty = properties[fn]((property) => {
        console.log(property)
        return property in params;
    });

    const checkParam = Object.keys(params)[fn]((param) => {
        console.log(param)
        return properties.includes(param);
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