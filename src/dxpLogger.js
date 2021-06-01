// if server dead, maybe pull from last?
const db = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const DBLINK = process.env.DBLINK;
const tycoonServers= {
    s1:'https://tycoon-w8r4q4.users.cfx.re',
    s2:'https://tycoon-2epova.users.cfx.re',
    s3:'https://tycoon-2epovd.users.cfx.re',
    s4:'https://tycoon-wdrypd.users.cfx.re',
    s5:'https://tycoon-njyvop.users.cfx.re',
    s6:'https://tycoon-2r4588.users.cfx.re',
    s7:'https://tycoon-npl5oy.users.cfx.re',
    s8:'https://tycoon-2vzlde.users.cfx.re',
    s9:'https://tycoon-wmapod.users.cfx.re',
    s10:'https://tycoon-wxjpge.users.cfx.re',
}
const dxpSchema = new db.Schema ({
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
const Model = db.model('dxps', dxpSchema);
const timing = [0,30];

async function reqData() {
    const date = new Date();
    if (!timing.includes(date.getMinutes())) { return null };
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
            dxpStatus = false;
        }
        product[serverNames[i]] = dxpStatus;
    }
    return product;
}

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
        await dxpModel.save((err, result) => { 
            if (err) console.log(err);
            db.disconnect();
        });
    } catch(e) { console.log(e) }
}

module.exports = function main() {
    dbwrite();
    setTimeout(() => {
        main();
    }, ((1000 * 60) * 1) );
};