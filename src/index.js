const express = require('express');
const app = express();
const router = express.Router();
const nameScraper = require('./nameScraper');
const dxpLogger = require('./dxpLogger');
//const webhook = require('./webhook')
//require('dotenv').config();

/*
router.get('/', (req, res) => {
    res.json({
        message: 'Hola'
    });
});
app.use('/webhook', webhook);*/
const PORT = 5000
app.listen(PORT, () => {
    console.log(`Listening: http://localhost:${PORT}`);
    nameScraper();
    //dxpLogger();
});