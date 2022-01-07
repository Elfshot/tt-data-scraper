import db from 'mongoose';
import { TT } from './helpers';
import { Track } from './models/RaceTrack';

const schema = new db.Schema ({
  class: { type: String },
  type: { type: String },
  length: { type: Number },
  index: { type: Number },
  name: { type: String },
  wr: { 
    name: { type: String },
    time: { type: Number },
    vehicle: { type: String },
  },
});

const Model = db.model('raceTracks', schema, 'racetracks');


export default async function():Promise<void> {
  try {
    const date = new Date();    
    const { data: dataTracks }: { data: Track[] } = await TT({ endpoint: '/status/racing/tracks.json' });

    dataTracks.forEach(async (track) => {
      try {
        const final: Track = {
          class: track.class,
          type: track.type,
          length: track.length,
          index: track.index,
          name: track.name,
          wr: { 
            name: track.wr.name,
            time: track.wr.time,
            vehicle: track.wr.vehicle,
          }
        };
        await Model.replaceOne({ index: track.index }, final, { upsert: true, });
      } catch(err) {
        console.error('Failed to write track');
        console.error(err);
      }
    });
  
    console.log(`Caught Races at ${date.toString()}`);
  } catch (err) { console.log(err); }
}