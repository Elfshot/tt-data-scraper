export interface Players {
  players: [name: string, source: number, user_id: number][];
}
export interface PlayersRaw {
  endpoint: string;
  id: number;
  identifiers: string[];
  name: string;
  ping: number;
}