const express = require('express');
const router = express.Router();

router.get('/', async(req, res) => {
    try {
        console.log(req)
        let monke = {hola: "wave"};
        return res.json(monke);
    }catch(err){console.log(err)};
});


module.exports = router;