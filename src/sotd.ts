import db from 'mongoose';
import { TT } from './helpers';
import { SOTD } from './models/Sotd';

const schema = new db.Schema ({
  bonus: { type: Number },
  short: { type: String },
  skill: { type: String },
  aptitude: { type: String },
  timestamp: { type: Date },
});

const Model = db.model('sotd', schema, 'sotd');

export default async function():Promise<void> {
  const date = new Date(); 
  try {   
    const { data }: { data: SOTD } = await TT({ endpoint: '/status/skillrotation.json' });
    
    const final = {
      timestamp: date,
      bonus: data.bonus, short: data.short, skill: data.skill, aptitude: data.aptitude,
    };
    await Model.replaceOne({ timestamp: date }, final, { upsert: true });
  } catch(err) {
    console.log('Failed to write SOTD');
    console.error('Failed to write SOTD');
    console.error(err);
  }
  console.log(`Caught SOTD at ${date.toString()}`);
}