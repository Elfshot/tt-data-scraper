export interface Business {
  user_id: number;
  code: string;
  business: {
    [business: string]: number;
  };
}