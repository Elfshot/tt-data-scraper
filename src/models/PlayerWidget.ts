interface Server {
  number: string;
  dxp: [active: boolean, host: string, time_remaining: number, unk: number];
  motd: string;
  name: string;
  region: string;
  limit: number;
  uptime: string;
  beta: string;
}

export interface PlayerWidget {
  players: [name: string, source: number, user_id: number, avatar: string, staff: boolean, job: string, donator: boolean][];
  server: Server; 
}