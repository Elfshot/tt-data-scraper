export interface FactionMember {
  username: string;
  earned: number;
  admin: number;
  joined: any;
  recruiter: number;
  user_id: number;
  management: number;
}

export interface FactionInfo {
  faction_id: number;
  tag: string;
  name: string;
}