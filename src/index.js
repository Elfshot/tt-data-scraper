const express = require('express');
const app = express();
const router = express.Router();
const nameScraper = require('./nameScraper');
//const webhook = require('./webhook')

//require('dotenv').config();

async function keepAlive() {
    try {
        await axios.get('https://tt-data-scraper.herokuapp.com/')
        console.log('anti-afk');
    } catch(e){}
    
    setTimeout(() => {
        keepAlive();
    }, ((1000 * 60) * 5) );
}
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
    keepAlive();
});