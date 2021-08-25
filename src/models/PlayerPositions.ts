import { Vector3 } from './General';

interface OwnedVehicles {
  trailer?: string;
  cab?: string;
  car?: string;
}

interface VehicleData {
  has_trailer: boolean;
  vehicle_model: number;
  vehicle_label: string;
  vehicle_type: string;
  vehicle_spawn: string;
  vehicle_class: number;
  vehicle_name: string;
  owned_vehicles?: OwnedVehicles;
  trailer: string;
}

interface Job {
  group: string;
  name: string;
}

export interface PlayerPositions {
  requests: number;
  caches: number;
  players: [name: string, source: number, user_id: number, position: Vector3, vehicle: VehicleData, job: Job][];
}