import axios from 'axios';
import db from 'mongoose';
import { TtAll, AxiosResponse, getAliveServer } from './helpers';
import { Players } from './models/Players';
import { UserData } from './models/UserData';

const alwaysScrapeBeta = [2, 3, 81915, 179108];

const dataSchema = new db.Schema ({
  vrpId: { type: Number },
  data: { type: Object },
  date: { type: Date },
});

const dataModel = db.model('dataadvs', dataSchema);

const itemSchema = new db.Schema ({
  id: { type: String },
  name: { type: String },
  weight: { type: String },
});
 interface item {
  id: string;
  name: string
  weight: string
 }

const itemModel = db.model('itemsData', itemSchema);

const itemsIds: string[] = [];

export default async function(): Promise<void> {
  try {
    const date = new Date();

    const dataSta:AxiosResponse<Players>[] = await TtAll('/status/players.json');
    const playersArr: number[][] = [];
    
    for (let i = 1; i < dataSta.length; i++) {
      const serverSta = dataSta[i];
      if(!serverSta?.data?.players?.[0]) return;
      if (i == 1) alwaysScrapeBeta.forEach((x) => playersArr.push([x, 1]));
      serverSta.data.players.forEach((player) => {
        playersArr.push([player[2], i]);
      });
    }

    if (playersArr.length === 0) return;
    
    
    for (let i = 0; i < playersArr.length; i++) {
      const vrpId = playersArr[i][0]; const serverId = playersArr[i][1];
      const aliveServer = await getAliveServer(serverId+1);
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

          {
            const inv = res.data.data.inventory;
            Object.keys(inv).forEach(async (itemId) => {
              if (itemsIds.includes(itemId)) return;
              const item = inv[itemId];
              if (item?.name?.includes('Invalid Item')) {
                const oldInvItem: item = await itemModel.findOne({ id: itemId });
                if (oldInvItem?.name && !oldInvItem.name.includes('Invalid Item')) return;
              }

              itemsIds.push(itemId);
              await itemModel.findOneAndUpdate({ id: itemId },
                { id: itemId, name: item.name, weight: item.weight },
                { new: true, upsert: true },
              );
            });
          }
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
        }).catch(() => { 
          return;
          // if (err?.isAxiosError && ['423', '412'].includes((err?.code || err?.response?.status).toString())) return;
          // console.error(err); 
        });
      }, i * 500, vrpId, aliveServer, date);
    }

    console.log(`Caught ${playersArr.length} player's data and items at ${date.toString()}`);
  } catch (err) { 
    console.warn(err); 
  }
}

