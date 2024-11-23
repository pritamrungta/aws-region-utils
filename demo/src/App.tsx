import './index.css';
import React from 'react';

import { awsRegions, awsRegionsByDistance } from 'aws-region-utils';
import { Point, Region } from 'aws-region-utils/lib/types';

import * as d3 from 'd3';
import render from './utils/render';
import zoom from './utils/zoom';

const isMobile = window.innerWidth <= 1000;
const width = isMobile ? window.innerWidth : window.innerWidth * 0.75;
const height = isMobile ? width * 1.5 : width * 0.75;
const projection = d3.geoOrthographic();

export default function () {
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = React.useState<Point | null>(null);
  const [regions, setRegions] = React.useState<Array<Region>>([]);
  const [byLocation, setByLocation] = React.useState(false);

  React.useEffect(() => {
    async function getData() {
      if (byLocation) {
        const [position, regions] = await Promise.all([
          new Promise((resolve: (position: Point) => void) => {
            navigator.geolocation.getCurrentPosition(
              (success) =>
                resolve({
                  latitude: success.coords.latitude,
                  longitude: success.coords.longitude,
                }),
              () => setByLocation(false),
            );
          }),
          awsRegionsByDistance(),
        ]);
        setPosition(position);
        setRegions(regions);
      } else {
        setPosition(null);
        setRegions(awsRegions());
      }
    }
    getData();
  }, [byLocation]);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!canvasRef.current || !ctx) return;

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    const path = d3.geoPath(projection, ctx);

    d3.select(ctx.canvas)
      .call(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        zoom(projection)
          .on('zoom.render', () =>
            render(width, height, ctx, projection, path, regions, position, tooltipRef),
          )
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .on('end.render', () =>
            render(width, height, ctx, projection, path, regions, position, tooltipRef),
          ),
      )
      .call(() => render(width, height, ctx, projection, path, regions, position, tooltipRef))
      .node();

    return () => ctx.clearRect(0, 0, width, height);
  }, [regions, position]);

  return (
    <>
      <div id="pre-canvas">
        {byLocation && !position ? (
          <>Loading...</>
        ) : (
          <>
            Location (sort by distance):
            <input
              type="checkbox"
              checked={byLocation}
              onChange={() => setByLocation((prev) => !prev)}
            />
          </>
        )}
      </div>
      <div id="tooltip" ref={tooltipRef}></div>
      <canvas id="canvas" ref={canvasRef} />
    </>
  );
}
