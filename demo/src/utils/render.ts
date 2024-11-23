import type { Point, Region } from 'aws-region-utils/lib/types';
import * as d3 from 'd3';
import { topojson } from 'chartjs-chart-geo';
import countriesData from 'world-atlas/countries-110m.json';
import { regionData } from 'aws-region-utils';

const sphere: d3.GeoSphere = { type: 'Sphere' };

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const countries = topojson.feature(countriesData, countriesData.objects.countries);

const regionMap = Object.fromEntries(
  regionData.map((region) => [
    region.code,
    { latitude: region.latitude, longitude: region.longitude },
  ]),
);

const countryMap = new Map<string, string>();

fetch('https://unpkg.com/world_countries_lists/data/countries/en/countries.json')
  .then((response) => response.json())
  .then((countryList) => {
    countryList.forEach((entry: { alpha2: string; name: string }) => {
      countryMap.set(entry.alpha2.toUpperCase(), entry.name);
    });
  });

let activeRegion: string | null = null;

const drawCircle = (
  ctx: CanvasRenderingContext2D,
  projection: d3.GeoProjection,
  path: d3.GeoPath,
  coordinates: Point,
  regions: Array<Region>,
  regionCode?: string,
  position?: Point | null,
  radius?: number,
  strokeColor?: string,
  fillColor?: string,
) => {
  radius =
    radius ??
    (position
      ? 2 + (5 * regions.findIndex((region) => region.code === regionCode)) / regions.length
      : 3);
  ctx.beginPath();
  path.pointRadius((radius * projection.scale()) / 249.5);
  path({
    type: 'Point',
    coordinates: [coordinates.longitude, coordinates.latitude],
  });
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

const render = (
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D,
  projection: d3.GeoProjection,
  path: d3.GeoPath,
  regions: Array<Region>,
  position: Point | null,
  tooltipRef: React.RefObject<HTMLDivElement>,
) => {
  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  path(sphere);
  ctx.fillStyle = '#a8afdbff'; // water
  ctx.fill();

  ctx.beginPath();
  path(countries);
  ctx.fillStyle = '#c6d0b3ff'; // land
  ctx.fill();

  ctx.strokeStyle = '#333333ff'; // border
  ctx.lineWidth = 0.3;
  ctx.stroke();

  regions.forEach((region) => {
    drawCircle(
      ctx,
      projection,
      path,
      regionMap[region.code],
      regions,
      region.code,
      position,
      undefined,
      '#ff0000ff',
      '#ff0000ff',
    );
  });

  if (position) {
    drawCircle(
      ctx,
      projection,
      path,
      position,
      regions,
      undefined,
      position,
      5,
      '#0000ffff',
      '#0000ffff',
    );

    const point = projection([position.longitude, position.latitude]);
    if (point) {
      ctx.beginPath();
      ctx.arc(...point, (5 * projection.scale()) / 249.5, 0, 2 * Math.PI);
      ctx.strokeStyle = '#0000ffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  const tooltip = d3.select(tooltipRef.current);

  d3.select(ctx.canvas).on('mousemove', (event: MouseEvent) => {
    const regionsWithDistance = regions
      .map((region) => ({
        ...region,
        cursorDistance: d3.geoDistance(
          [regionMap[region.code].longitude, regionMap[region.code].latitude],
          projection.invert?.([event.offsetX, event.offsetY]) ?? [0, 0],
        ),
      }))
      .sort((region1, region2) => region1.cursorDistance - region2.cursorDistance);
    if (
      regionsWithDistance[0].cursorDistance <=
      (position
        ? 0.0075 +
          (0.0225 * regions.findIndex((region) => region.code === regionsWithDistance[0].code)) /
            regions.length
        : 0.0125)
    ) {
      if (activeRegion && activeRegion !== regionsWithDistance[0].code) {
        drawCircle(
          ctx,
          projection,
          path,
          regionMap[activeRegion],
          regions,
          activeRegion,
          position,
          undefined,
          '#ff0000ff',
          '#ff0000ff',
        );
        activeRegion = null;
      }
      if (!activeRegion) {
        activeRegion = regionsWithDistance[0].code;
        drawCircle(
          ctx,
          projection,
          path,
          regionMap[activeRegion],
          regions,
          activeRegion,
          position,
          undefined,
          '#00ff00ff',
        );
      }
      tooltip
        .html(
          '<div style="text-align:left">Region: <b>' +
            activeRegion +
            '</b><br>Country: <b>' +
            (countryMap.get(regionsWithDistance[0].country) ?? regionsWithDistance[0].country) +
            '</b>' +
            (position
              ? '<br>Distance: <b>' +
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                (regionsWithDistance[0].distance / 1000).toFixed(2) +
                ' km</b><br>Avg. latency: <b>' +
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                Math.ceil((20 * regionsWithDistance[0].distance) / 1000000) +
                ' ms</b>'
              : '') +
            '</div>',
        )
        .style('left', event.pageX + 15 + 'px')
        .style('top', event.pageY + 15 + 'px')
        .style('opacity', 0.9);
    } else {
      if (activeRegion) {
        drawCircle(
          ctx,
          projection,
          path,
          regionMap[activeRegion],
          regions,
          activeRegion,
          position,
          undefined,
          '#ff0000ff',
          '#ff0000ff',
        );
        activeRegion = null;
      }
      tooltip.style('opacity', 0);
    }
  });
};

export default render;
