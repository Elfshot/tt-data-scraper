export interface OwnedVehicles {
  user_id: number;
  vehicles: {
    [vehicle: string]: [veh_class: string, inventory_size: number]
  };
  code: string;
}