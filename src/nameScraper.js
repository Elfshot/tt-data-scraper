const db = require('mongoose');
const axios = require('axios');
//require('dotenv').config();
const DBLINK = 'mongodb+srv://monke:WWgcNIb5JrEvk0Er@cluster0.wevq5.mongodb.net/tycoonUsers?readPreference=primary'
const tycoonServers= [
    'http://server.tycoon.community:30120',
    'http://server.tycoon.community:30122',
    'http://server.tycoon.community:30123',
    'http://server.tycoon.community:30124',
    'http://server.tycoon.community:30125',
    'http://na.tycoon.community:30120',
    'http://na.tycoon.community:30122',
    'http://na.tycoon.community:30123',
    'http://na.tycoon.community:30124',
    'http://na.tycoon.community:30125',
]

async function reqUsers() {
    var playersLst = [];
    for (let i = 0; i < tycoonServers.length; i++){
        try{
            var TT = axios.create({
                baseURL: tycoonServers[i],
            });
            // Make requests for two endpoints which we can draw all needed data from - they need eachother for all data needed to be got
            var { data } = await TT('/players.json');
            var deepData = data;
            var { data: { players } } = await TT('/status/players.json');
            var surfaceData = players;
            //console.log(tycoonServers[i])
        } catch { console.log(`request(s) to ${tycoonServers[i]} has failed!`) }
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
    console.log(playersLst)
    return playersLst
}

const playerSchema = new db.Schema ({
    vrpId: {type: String},
    userName: {type: String},
    discordId: {type: String},
    countFound: {type: Number},
    firstFound: {type: Date},
    lastFound: {type: Date},
});

async function writeUsers() {
        const players = await reqUsers();
    try {
        if (!players) return;
        await db.connect(DBLINK, { useNewUrlParser: true, useUnifiedTopology: true }, () => { console.log("connected") });
        const date = new Date();
        const Model = db.model('users', playerSchema);
        // for every player
        for (let i = 0; i < players.length; i++) {
            //define the junk for player's data
            let player = players[i];
            let vrpId = player[0]
            let playerName = player[1];
            let discordId = player[2];
            if (playerName == null) continue;
            // duplicate above when null id is found
            var old = await Model.findOne({ vrpId: vrpId }).exec();
            // if an old log of this player exists... (update it with current info)
            if (old){
                await Model.findOneAndUpdate({ _id: old._id }, { playerName: playerName, discordId:discordId, countFound: old.countFound + 1 , lastFound: date}, {useFindAndModify: false}, 
                    ((err, result) => { 
                        if (err) console.log(err);
                        if (i+1 == players.length) db.disconnect(() => { console.log("disconnected") });
                    })
                );
            } 
            // if no old data for this player, create new... (add current info)
            else if (!old) {
                var playerModel = new Model({
                    vrpId: vrpId,
                    userName: playerName,
                    discordId: discordId,
                    countFound: 1,
                    firstFound: date,
                    lastFound: date,
                })
                await playerModel.save((err, result) => { 
                    if (err) console.log(err);
                    if (i+1 == players.length) db.disconnect(() => { console.log("disconnected") });
            })};
        };
    }catch(e){ console.log(e); return; };
}


module.exports = async function main() {
    await writeUsers();
    setTimeout(() => {
        main();
    }, ((1000 * 60) * 2) );
};
