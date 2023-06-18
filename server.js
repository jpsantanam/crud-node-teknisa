const express = require('express');
const app = express();
const port = 5000;
const programmer = require('./routes/programmer')
const database = require('./routes/database')

app.use(express.json());
app.use('/database', database)
app.use('/programmer', programmer);

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});