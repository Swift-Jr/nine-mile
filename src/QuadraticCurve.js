export class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

export class QuadraticCurve {
  /**
   * [constructor description]
   * @param Point p0 start point
   * @param Point p1 control point
   * @param Point p2 end point
   */
  constructor(p0, p1, p2) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
  }

  static create(startX, startY, controlX, controlY, endX, endY) {
    let start = new Point(startX, startY);
    let control = new Point(controlX, controlY);
    let end = new Point(endX, endY);

    return new QuadraticCurve(start, control, end);
  }

  getLength() {
    if (!this.length) {
      const {p0, p1, p2} = this;

      if (p0.x === p1.x && p0.x === p2.x) {
        this.length = p2.y - p0.y;
      } else if (p0.y === p1.y && p0.y === p2.y) {
        this.length = p2.x - p0.x;
      } else {
        let ax = p0.x - 2 * p1.x + p2.x;
        let ay = p0.y - 2 * p1.y + p2.y;
        let bx = 2 * p1.x - 2 * p0.x;
        let by = 2 * p1.y - 2 * p0.y;
        let A = 4 * (ax * ax + ay * ay);
        let B = 4 * (ax * bx + ay * by);
        let C = bx * bx + by * by;

        let Sabc = 2 * Math.sqrt(A + B + C);
        let A_2 = Math.sqrt(A);
        let A_32 = 2 * A * A_2;
        let C_2 = 2 * Math.sqrt(C);
        let BA = B / A_2;

        this.length =
          (A_32 * Sabc +
            A_2 * B * (Sabc - C_2) +
            (4 * C * A - B * B) *
              Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) /
          (4 * A_32);
      }

      this.length = Math.abs(this.length);
    }
    return this.length;
  }

  getPointAtDistance(distance, fromP2 = false) {
    let length = this.getLength();
    return this.getPointAtPercent(distance / length, fromP2);
  }

  getPointAtDistance2(distance, travelingToo) {
    let length = this.getLength();
    let fromP2 = travelingToo !== this.p2;

    return this.getPointAtPercent(distance / length, fromP2);
  }

  getPointAtPercent(t, fromP2 = false) {
    const {p0, p1, p2} = this;

    let point = new Point();

    if (fromP2) {
      t = 1 - t;
    }

    let t1 = 1 - t;

    point.x = t1 * (t1 * p0.x + t * p1.x) + t * (t1 * p1.x + t * p2.x);
    point.y = t1 * (t1 * p0.y + t * p1.y) + t * (t1 * p1.y + t * p2.y);

    return point;
  }

  getAngleAtDistance(distance, fromP2 = false) {
    let length = this.getLength();
    return this.getAngleAtPercent(distance / length, fromP2);
  }

  getAngleAtDistance2(distance, travelingToo) {
    let length = this.getLength();
    let fromP2 = travelingToo !== this.p2;
    return this.getAngleAtPercent(distance / length, fromP2);
  }

  getAngleAtPercent(t, fromP2 = false) {
    const {p0, p1, p2} = this;

    let tangentX, tangentY;

    if (fromP2) {
      t = 1 - t;
    }

    let t1 = 1 - t;

    /*tangentX = t1 * p1.x + t * p2.x - (t1 * p0.x + t * p1.x);
    tangentY = t1 * p1.y + t * p2.y - (t1 * p0.y + t * p1.y);*/

    tangentX = 2 * t1 * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
    tangentY = 2 * t1 * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);

    return Math.atan2(tangentY, tangentX);
  }
}

export default QuadraticCurve;
