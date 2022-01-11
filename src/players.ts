import db from 'mongoose';
import { TtAll, AxiosResponse } from './helpers';
import { Players, PlayersRaw } from './models/Players';

interface playerData {
  id: number;
  name: string;
  idents?: string[];
  discordId?: string;
  steam?: string,
  license?: string,
  license2?: string,
  xbl?: string,
  live?: string,
  fivem?: string,
}

export default async function(): Promise<void> {
  try {
    const date = new Date();

    const dataSta:AxiosResponse<Players>[] = await TtAll('/status/players.json');
    const dataRaw:AxiosResponse<PlayersRaw[]>[] = await TtAll('/players.json');

    const playersArr: playerData[] = [];

    dataSta.forEach((serverSta, index) => {
      if(!serverSta?.data?.players?.[0]) return;
      serverSta.data.players.forEach((player) => {
        if (!dataRaw[index]?.data?.[0]) return;
        const playerRaw = dataRaw[index].data.find((item) => item.id === player[1] );
        if (!playerRaw) return;
        const playerData =  {
          id: player[2],
          name: playerRaw.name,
          idents: playerRaw.identifiers,
        };
        playersArr.push(playerData);
      });
    });

    if (playersArr.length === 0) return;
  
    const playerSchema = new db.Schema ({
      vrpId: { type: Number },
      userName: { type: String },
      discordId: { type: String },
      countFound: { type: Number, default: 0 },
      firstFound: { type: Date, default: date },
      lastFound: { type: Date },
      identifiers: {
        steam: { type: String },
        license: { type: String },
        license2: { type: String },
        xbl: { type: String },
        live: { type: String },
        fivem: { type: String },
      }
    });

    const playersModel = db.model('users', playerSchema);

    playersArr.forEach(async (player, index) => {
      try {
        player.discordId = player.idents.find((id) => { return id.includes('discord:'); })?.split(':')[1];
        player.steam = player.idents.find((id) => { return id.includes('steam:'); })?.split(':')[1];
        player.license = player.idents.find((id) => { return id.includes('license:'); })?.split(':')[1];
        player.license2 = player.idents.find((id) => { return id.includes('license2:'); })?.split(':')[1];
        player.live = player.idents.find((id) => { return id.includes('live:'); })?.split(':')[1];
        player.fivem = player.idents.find((id) => { return id.includes('fivem:'); })?.split(':')[1];
        delete playersArr[index].idents;
        await playersModel.findOneAndUpdate({ vrpId: player.id },
          { userName: player.name, discordId: player.discordId, lastFound: date, $inc: { countFound: 1 },
            identifiers: {
              steam: player.steam, license: player.license, license2: player.license2,
              xbl: player.xbl, live: player.live, fivem: player.fivem
            }
          },
          { new: true, omitUndefined: true, upsert: true, setDefaultsOnInsert: true }
        );
      } catch(err) { 
        console.error(err);
      }
    });

    console.log(`Caught ${playersArr.length} players at ${date.toString()}`);
    db.deleteModel('users');
  } catch (err) { console.warn(err); try { db.deleteModel('users'); } catch(err) { console.warn('Unable to delete model "users"'); }}
}

