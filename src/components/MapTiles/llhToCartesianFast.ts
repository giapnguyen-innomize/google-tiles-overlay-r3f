import { Vector3 } from 'three';

/**
 * A simplified method that converts LLH to cartesian (EPSG:4978).
 * The transform is slightly inaccurate compared to "proj4" but it's 3 times faster.
 * Use proj4js to get optimal accuracy
 *
 * @param {*} longitude longitude as a degree decimal
 * @param {*} latitude latitude as a degree decimal
 * @param {*} height height in meters
 * @param {*} radians if true the input angles are considered to be in radians, degrees otherwise
 */
export function llhToCartesianFast(longitude: number, latitude: number, height: number, radians = false) {
  const lon = radians ? longitude : 0.017453292519 * longitude;
  const lat = radians ? latitude : 0.017453292519 * latitude;
  const N = 6378137.0 / Math.sqrt(1.0 - 0.006694379990141316 * Math.pow(Math.sin(lat), 2.0));
  const cosLat = Math.cos(lat);
  const cosLon = Math.cos(lon);
  const sinLat = Math.sin(lat);
  const sinLon = Math.sin(lon);
  const nPh = N + height;

  return new Vector3(nPh * cosLat * cosLon, nPh * cosLat * sinLon, (0.9933056200098586 * N + height) * sinLat);
}
