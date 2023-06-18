const express = require('express');
let router = express.Router();

router.route('/')
    .get(async (req, res) => {
        const database = require('../database/db');

        try {
            await database.sync();

            res.send('Database successfully sync.');
        } catch (err) {
            res.send(err);
        }
    });

module.exports = router;