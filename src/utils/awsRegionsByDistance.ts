import getDistance from 'geolib/es/getDistance';
import type { Point, RegionData, RegionByDistance } from '../types';

import regions from '../data/aws-regions.json';

const awsRegionsByDistance = async (): Promise<Array<RegionByDistance>> => {
  const position = await new Promise(
    (resolve: (position: Point) => void, reject: (message: string) => void) => {
      navigator.geolocation.getCurrentPosition(
        (success) =>
          resolve({ latitude: success.coords.latitude, longitude: success.coords.longitude }),
        (error) => reject(error.message),
      );
    },
  );
  return regions
    .map((region: RegionData) => ({
      code: region.code,
      country: region.country,
      distance: getDistance(position, region),
    }))
    .toSorted(
      (region1: RegionByDistance, region2: RegionByDistance) => region1.distance - region2.distance,
    );
};

export default awsRegionsByDistance;
