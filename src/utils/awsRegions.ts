import type { RegionData, Region } from '../types';

import regions from '../data/aws-regions.json';

const awsRegions = (): Array<Region> => {
  return regions.map((region: RegionData) => ({
    code: region.code,
    country: region.country,
  }));
};

export default awsRegions;
