export interface Track {
  class: string,
  type: string,
  length: number,
  index: number,
  name: string,
  wr: { 
    name: string,
    time: number,
    vehicle: string,
  }
}