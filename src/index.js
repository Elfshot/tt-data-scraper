const db = require('mongoose');
const axios = require('axios');
const express = require('express');
require('dotenv').config();
const tycoonServers= [
    'http://server.tycoon.community:30120/status',
    'http://server.tycoon.community:30122/status',
    'http://server.tycoon.community:30123/status',
    'http://server.tycoon.community:30124/status',
    'http://server.tycoon.community:30125/status',
    'http://na.tycoon.community:30120/status',
    'http://na.tycoon.community:30122/status',
    'http://na.tycoon.community:30123/status',
    'http://na.tycoon.community:30124/status',
    'http://na.tycoon.community:30125/status',
]


const userSchema = new db.Schema ({
    vrpId: {type: String},
    userName: {type: String},
    countFound: {type: Number},
    firstFound: {type: Date},
    lastFound: {type: Date},
});

async function reqUsers() {
    try{
        var playersObj = {};
        for (let i = 0; i < tycoonServers.length; i++){
            var TT = axios.create({
                baseURL: tycoonServers[i],
            });
            var { data: { players } } = await TT('/players.json');
            //console.log(tycoonServers[i])
            
            for (let ii = 0; ii < players.length; ii++) {
                //console.log(players[ii][2], players[ii][0]);
                playersObj[players[ii][2]] = players[ii][0];
            }
        }
        //console.log(playersObj);
        return playersObj
    } catch(e){ console.log(e); return; };
}
async function writeUsers(users={Type: Object}) {
    try {
        if (!users) return;
        await db.connect(process.env.DBLINK, { useNewUrlParser: true, useUnifiedTopology: true }, () => { console.log("connected") });
        const date = new Date();
        const Model = db.model('users', userSchema);
        playerIds = Object.keys(users);
        for (let i = 0; i < playerIds.length; i++) {
            var id = playerIds[i];
            var name = users[playerIds[i]];

            var old = await Model.findOne({ vrpId: id }).exec();
            if (old) await Model.findOneAndUpdate({ _id: old._id }, { userName: name, countFound: old.countFound + 1 , lastFound: date}, {useFindAndModify: false}, 
                ((err, result) => { 
                    console.log(err ? err : result);
                    if (i+1 == playerIds.length) db.disconnect(() => { console.log("disconnected") });
                })
            );
            if (!old) {
                var userModel = new Model({
                    vrpId: id,
                    userName: name,
                    countFound: 1,
                    firstFound: date,
                    lastFound: date,
                })
                await userModel.save((err, result) => { 
                console.log(err ? err : result);
                if (i+1 == playerIds.length) db.disconnect(() => { console.log("disconnected") });
            })};
        }
    }catch(e){ console.log(e); return; };
}

async function main() {
    await writeUsers(await reqUsers());
    setTimeout(() => {
        main();
    }, ((1000 * 60) * 2) );
};

main();

// Leave this on the side for when I'm really making big monies for keys
/*
async function reqData() {
    const TT = axios.create({
        baseURL: server,
        headers: { 'X-Tycoon-Key': process.env.TYCOON_KEY }
    });
}
*/










//Heroku Binder --dummy
express().get('/', (req, res) => {
    res.json({
        message: 'Hola'
    });
});
express().listen(process.env.PORT, () => {
    console.log(`Listening: http://localhost:${process.env.PORT}`);
});