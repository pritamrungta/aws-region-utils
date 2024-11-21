export interface Point {
  latitude: number;
  longitude: number;
}

export interface Region {
  code: string;
  country: string;
}

export type RegionData = Region & Point;

export interface RegionByDistance extends Region {
  distance: number;
}
