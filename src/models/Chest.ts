export interface Chest {
  data_type: string;
  data: {
    [item: string]: {
      amount: number
      weight: number
      name: string
    }
  };
  code: string;
  chest: string;
}