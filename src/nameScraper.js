const db = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const DBLINK = process.env.DBLINK;
const tycoonServers= [
    'https://tycoon-w8r4q4.users.cfx.re',
    'https://tycoon-2epova.users.cfx.re',
    'https://tycoon-2epovd.users.cfx.re',
    'https://tycoon-wdrypd.users.cfx.re',
    'https://tycoon-njyvop.users.cfx.re',
    'https://tycoon-2r4588.users.cfx.re',
    'https://tycoon-npl5oy.users.cfx.re',
    'https://tycoon-2vzlde.users.cfx.re',
    'https://tycoon-wmapod.users.cfx.re',
    'https://tycoon-wxjpge.users.cfx.re',
    'https://tycoon-2rkmr8.users.cfx.re'
]
var lastMin;

async function reqUsers() {
    const date = new Date();
    let currentDate = date.getMinutes();
    const conditions = ((currentDate % 2 != 0) || (currentDate == lastMin))
    if (conditions) { return null; }
    else {
        lastMin = currentDate
        var playersLst = [];
        for (let i = 0; i < tycoonServers.length; i++){
            try{
                var TT = axios.create({
                    baseURL: tycoonServers[i],
                    timeout: 5000,
                });
                // Make requests for two endpoints which we can draw all needed data from - they need eachother for all data needed to be got
                var { data } = await TT('/players.json');
                var deepData = data;
                var { data: { players } } = await TT('/status/players.json');
                var surfaceData = players;
                //console.log(tycoonServers[i])
            } catch { 
                if (i != 10) { 
                    console.log(`request(s) to ${tycoonServers[i]} has failed!`); 
                } 
                continue; 
            }
            if (!deepData || !surfaceData) return;    
            //loop though all "deepdata" which is just all players
                for (let ii = 0; ii < deepData.length; ii++) {
                        try {
                        // define a bunch of player data
                        let currentPlayer = deepData[ii];
                        let vrpId;
                        let srcId = currentPlayer.id;
                        let identifiers = currentPlayer.identifiers;
                        let playerName = currentPlayer.name;
                        var discordId = null;
                        // goes though all the identifiers, if there is discord it will get got
                        identifiers.forEach(element => {
                            if (element.includes('discord:')){
                                //console.log("found discord")
                                discordId = element.replace('discord:','')
                            }
                        });
                        // goes through the main(surface) data and matches srcId to get vrpId
                        surfaceData.forEach(element => { if (element[1] == srcId) { vrpId = element[2]; } });

                        // if all the wanted data(-discord id) is intact / **there** do the stuff
                        if (vrpId&&playerName) {
                            //push all data to the returning list, discord id is allowed to be null as it'll be dealt with in post
                            playersLst.push([vrpId,playerName,discordId])
                        }
                    } catch(e){ console.log(e) };
                } 
        }
        return [playersLst, date];
    }
}

const playerSchema = new db.Schema ({
    vrpId: {type: Number},
    userName: {type: String},
    discordId: {type: String},
    countFound: {type: Number},
    firstFound: {type: Date},
    lastFound: {type: Date},
});

async function writeUsers() {
        const datass = await reqUsers();
        if (!datass) return;
        try {
        const players = datass[0];
        const date = datass[1];
        const Model = db.model('users', playerSchema);
        // for every player
        for (let i = 0; i < players.length; i++) {
            //define the junk for player's data
            let player = players[i];
            let vrpId = parseInt(player[0]);
            let userName = player[1];
            let discordId = player[2]

            if (userName == null) continue;
            // duplicate above when null id is found
            var old = await Model.findOne({ vrpId: vrpId }).exec();
            // if an old log of this player exists... (update it with current info)
            if (old){
                await Model.findOneAndUpdate({ _id: old._id }, { userName: userName, discordId: discordId, countFound: old.countFound + 1 , lastFound: date}, {useFindAndModify: false}, 
                    ((err, result) => { 
                        if (err) console.log(err);
                    })
                );
            } 
            // if no old data for this player, create new... (add current info)
            else if (!old) {
                var playerModel = new Model({
                    vrpId: vrpId,
                    userName: userName,
                    discordId: discordId,
                    countFound: 1,
                    firstFound: date,
                    lastFound: date,
                })
                await playerModel.save((err, result) => { 
                    if (err) console.log(err);
            })};
        };
        console.log(`Caught ${players.length} players at ${date.toUTCString()}`)
    }catch(e){ console.log(e) };
}


module.exports = async function main() {
    await db.connect(DBLINK, { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 30000 });
    writeUsers();
    setTimeout(() => {
        main();
    }, ((1000 * 60) * 0.5) );
};
