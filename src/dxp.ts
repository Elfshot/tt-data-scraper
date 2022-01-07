import db from 'mongoose';
import { TtAll, AxiosResponse } from './helpers';
import { PlayerWidget } from './models/PlayerWidget';

const dxpSchema = new db.Schema ({
  Date: { type: Date },
  s1: { type: Boolean },
  s2: { type: Boolean },
  s3: { type: Boolean },
  s4: { type: Boolean },
  s5: { type: Boolean },
});

const Model = db.model('dxps', dxpSchema);


export default async function():Promise<void> {
  try {
    const date = new Date();
    const dxps:boolean[] = [];

    const responses:AxiosResponse<PlayerWidget>[] = await TtAll('/status/widget/players.json');

    responses.forEach((data) => {
      if (data?.data?.server?.dxp?.[0]) {
        dxps.push(true);
      } else dxps.push(undefined);
    });

    const final = {
      Date: date,
      s1: dxps[0], s2: dxps[1], s3: dxps[2], s4: dxps[3], s5: dxps[4],
    };
    await Model.replaceOne({ Date: date }, final, { upsert: true, omitUndefined: true, });
  
    console.log(`Caught DXP at ${date.toString()}`);
  } catch (err) { console.error(err); }
}