// if server dead, maybe pull from last?
const db = require('mongoose');
const axios = require('axios');
//require('dotenv').config();
const DBLINK = 'mongodb+srv://danny:MB7ZbMfWWtnf0FYd@main.lt7qs.mongodb.net/test?readPreference=primary'
const tycoonServers= {
    s1:'http://server.tycoon.community:30120',
    s2:'http://server.tycoon.community:30122',
    s3:'http://server.tycoon.community:30123',
    s4:'http://server.tycoon.community:30124',
    s5:'http://server.tycoon.community:30125',
    s6:'http://na.tycoon.community:30120',
    s7:'http://na.tycoon.community:30122',
    s8:'http://na.tycoon.community:30123',
    s9:'http://na.tycoon.community:30124',
    s10:'http://na.tycoon.community:30125',
}

async function reqData() {
    let date = new Date();
    var product = {date: date};
    serverNames = Object.keys(tycoonServers);
    for (let i = 0; i < serverNames.length; i++) {
        let dxpStatus;
        let server = tycoonServers[serverNames[i]];
        try {
            var TT = axios.create({
                baseURL: server,
            });
                let { data } = await TT('/status/widget/players.json');
                let serverStats = data.server;
                dxpStatus = serverStats.dxp[0];
        } catch(e) {
            //console.log(`${server} is down.`);
            dxpStatus = false;
        }
        //console.log(`${server}:`);
        //console.log(dxpStatus);
        product[serverNames[i]] = dxpStatus;
    }
    //console.log(product);
    return product;
}
const playerSchema = new db.Schema ({
    Date: {type: Date},
    s1: {type: Boolean},
    s2: {type: Boolean},
    s3: {type: Boolean},
    s4: {type: Boolean},
    s5: {type: Boolean},
    s6: {type: Boolean},
    s7: {type: Boolean},
    s8: {type: Boolean},
    s9: {type: Boolean},
    s10: {type: Boolean},
});
const Model = db.model('dxp', playerSchema);

async function dbwrite() {
    const dxpData = await reqData();
    if (!dxpData) return;
    try {
        await db.connect(DBLINK, { useNewUrlParser: true, useUnifiedTopology: true });
        var dxpModel = new Model({
            Date: dxpData.date,
            s1: dxpData.s1,
            s2: dxpData.s2,
            s3: dxpData.s3,
            s4: dxpData.s4,
            s5: dxpData.s5,
            s6: dxpData.s6,
            s7: dxpData.s7,
            s8: dxpData.s8,
            s9: dxpData.s9,
            s10: dxpData.s10,
        });
        //console.log(playerModel);
        await dxpModel.save((err, result) => { 
            if (err) console.log(err);
            db.disconnect();
        });
    } catch(e) { console.log(e) }
}

module.exports = async function main() {
    await dbwrite();
    setTimeout(() => {
        main();
    }, ((1000 * 60) * 25) );
};