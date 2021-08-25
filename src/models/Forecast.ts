import { Weather } from '../models/Weather';
export type Forecast = [Weather['weather'],...[]];
