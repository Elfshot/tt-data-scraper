interface VehicleInfo {
  x: number;
  y: number;
  z: number;
  airport: string;
  name: string;
}

export interface ActiveAirline {
  [key: string]: [vehicle_name: string, vehicle: VehicleInfo, at_terminal: boolean, user_id: number];
}