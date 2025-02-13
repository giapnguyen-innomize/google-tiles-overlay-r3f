import { Matrix4, Object3D, Quaternion, Vector3 } from 'three';

import { llhToCartesianFast } from './llhToCartesianFast';

/**
 * transforms an Object3D representing a geographically correct 3D earth (cartesian WGS84) so that the given longitude latitude height
 * are at 0,0,0 with the earth normal at that location pointing up towards the y-axis
 * @param {Object3D} googleTiles google tiles tileset
 * @param {Number} longitude in degrees
 * @param {Number} latitude in degrees
 * @param {Number} height in meters above ellipsoid
 */
export function earthAntiGeoreferencing(googleTiles: Object3D, longitude: number, latitude: number, height: number) {
  const cartesianLocation = llhToCartesianFast(longitude, latitude, height);

  const quaternionToEarthNormalOrientation = new Quaternion();
  quaternionToEarthNormalOrientation.setFromUnitVectors(cartesianLocation.clone().normalize(), new Vector3(0, 1, 0));

  const rotation = new Matrix4();
  const translation = new Matrix4();
  translation.makeTranslation(-cartesianLocation.x, -cartesianLocation.y, -cartesianLocation.z);
  rotation.makeRotationFromQuaternion(quaternionToEarthNormalOrientation);

  googleTiles.matrix.multiplyMatrices(rotation, translation);
  googleTiles.matrix.decompose(googleTiles.position, googleTiles.quaternion, googleTiles.scale);
}
