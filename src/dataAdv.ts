import axios from 'axios';
import db from 'mongoose';
import { TtAll, AxiosResponse, getAliveServer } from './helpers';
import { Players } from './models/Players';
import { UserData } from './models/UserData';

const dataSchema = new db.Schema ({
  vrpId: { type: Number },
  data: { type: Object },
  date: { type: Date },
});

const dataModel = db.model('dataadvs', dataSchema);

export default async function(): Promise<void> {
  try {
    const date = new Date();

    const dataSta:AxiosResponse<Players>[] = await TtAll('/status/players.json');
    const playersArr: number[] = [];

    dataSta.forEach((serverSta) => {
      if(!serverSta?.data?.players?.[0]) return;
      serverSta.data.players.forEach((player) => {
        playersArr.push(player[2]);
      });
    });

    if (playersArr.length === 0) return;

    const aliveServer = await getAliveServer();
    if (!aliveServer) return;

    playersArr.forEach((vrpId, index) => {
      setTimeout((vrpId, aliveServer, date) => {
        axios.get(`${aliveServer}/status/dataadv/${vrpId}`, {
          timeout: 10000,
          headers: {
            'X-Tycoon-Key': process.env.TYCOONTOKEN
          },
        }).then(async (res: { data: UserData }) => {
          if (!res?.data?.data) return;
          const data = res.data.data;
          const vrpId = res.data.user_id;
          
          /*Object.keys(data.inventory).forEach((itemName) => {
            if (itemName.includes('.')) {
              const item = data.inventory[itemName];
              delete data.inventory[itemName];
              data.inventory[itemName.replace('.', '\u002e')] = item;
            }
          });*/

          await dataModel.findOneAndUpdate({ vrpId },
            { vrpId, data, date, },
            { new: true, upsert: true }
          );
        }).catch( (err) => { 
          if (err?.isAxiosError && ['423', '412'].includes((err?.code || err?.response?.status).toString())) return;
          //console.error(err); 
        });
      }, index * 1000, vrpId, aliveServer, date);
    });


    console.log(`Caught ${playersArr.length} player's data at ${date.toString()}`);
  } catch (err) { 
    console.warn(err); 
  }
}

