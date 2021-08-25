interface Top {
  user_id: number;
  username: string;
  amount: number;
}

export interface Top10 {
  stat: string;
  top: Top[];
  code: string;
}