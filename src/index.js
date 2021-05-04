const express = require('express');
const app = express();
const router = express.Router();
const nameScraper = require('./nameScraper');
const webhook = require('./webhook')

require('dotenv').config();

async function keepAlive() {
    try {
        await axios.get('https://tt-data-scraper.herokuapp.com/')
        console.log('anti-afk');
    } catch(e){}
    
    setTimeout(() => {
        keepAlive();
    }, ((1000 * 60) * 5) );
}


//Heroku Binder

router.get('/', (req, res) => {
    res.json({
        message: 'Hola'
    });
});
app.use('/webhook', webhook);

app.listen(process.env.PORT, () => {
    console.log(`Listening: http://localhost:${process.env.PORT}`);
    nameScraper();
    keepAlive();
});