import timer from 'node-schedule';
import dxp from './dxp';
import players from './players';
import dataAdv from './dataAdv';
import race from './raceRotation';
import sotd from './sotd';
import db from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

db.set('useFindAndModify', false);

db.connect(process.env.DBLINK, { useNewUrlParser: true, useUnifiedTopology: true }, (error) => {
  if (!error) {
    console.log('Connected to Mongo and Alive');
    timer.scheduleJob('dataAdv', '*/10 * * * *', dataAdv);
    timer.scheduleJob('dxp', '0,30 * * * *', dxp);
    timer.scheduleJob('players', '*/2 * * * *', players);
    timer.scheduleJob('racetracks', '4 */3 * * *', race);
    timer.scheduleJob('sotd', { tz: 'Etc/UTC', hour: 0, minute: 10 } , sotd);
  } else { console.error(error); process.kill(process.pid); }
});