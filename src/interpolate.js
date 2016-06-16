import {asin, atan2, cos, degrees, haversin, radians, sin, sqrt} from "./math";

function interpolate(x0, y0, x1, y1) {
  var cy0 = cos(y0),
      sy0 = sin(y0),
      cy1 = cos(y1),
      sy1 = sin(y1),
      kx0 = cy0 * cos(x0),
      ky0 = cy0 * sin(x0),
      kx1 = cy1 * cos(x1),
      ky1 = cy1 * sin(x1),
      d = 2 * asin(sqrt(haversin(y1 - y0) + cy0 * cy1 * haversin(x1 - x0))),
      k = 1 / sin(d);

  var interpolate = d ? function(t) {
    t *= d;
    var B = sin(t) * k,
        A = sin(d - t) * k,
        x = A * kx0 + B * kx1,
        y = A * ky0 + B * ky1,
        z = A * sy0 + B * sy1;
    return [
      atan2(y, x) * degrees,
      atan2(z, sqrt(x * x + y * y)) * degrees
    ];
  } : function() { return [x0 * degrees, y0 * degrees]; };

  interpolate.distance = d;

  return interpolate;
}

export default function(source, target) {
  return interpolate(
    source[0] * radians, source[1] * radians,
    target[0] * radians, target[1] * radians
  );
}
