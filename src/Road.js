import {QuadraticCurve, Point} from "./QuadraticCurve";

const LANE_WIDTH = 6;
const LANE_SPACING = 2;

export default class Road extends QuadraticCurve {
  constructor(p0, p1, p2, lanes = 2) {
    super(p0, p1, p2);

    //We need each lane by adding/substracting lane with from p0, p1, p2???
    this.lanes = [];
    this.laneMatrix = [];
    this.rightLane = [];
    this.leftLane = [];

    let laneAndSpacing = LANE_WIDTH + LANE_SPACING;

    //vertical 50,0   50,50  50,100   -x  -x  -x
    //horizont 0, 50  50,50  100,50   -y  -y  -y
    //topleft  50,0   50,50  0, 50    -x  --  -y
    //topright 50,0   50,50  100, 50  -x  +-  +y
    //botleft  100,50 50,50  50, 100  -y  --  -x
    //botright 0,50   50,50  50, 100  -y  ++  +x

    for (let i = 1; i >= -1; i -= 2) {
      let laneAndSpacingAdjusted;

      let laneP0 = new Point(),
        laneP1 = new Point(),
        laneP2 = new Point();

      laneAndSpacingAdjusted = laneAndSpacing * i;

      if (p0.x === p1.x && p1.x == p2.x) {
        //vertical
        laneP0.x = p0.x - laneAndSpacingAdjusted;
        laneP0.y = p0.y;
        laneP1.x = p1.x - laneAndSpacingAdjusted;
        laneP1.y = p1.y;
        laneP2.x = p2.x - laneAndSpacingAdjusted;
        laneP2.y = p2.y;
      } else if (p0.y === p1.y && p1.y == p2.y) {
        //horizontal
        laneP0.x = p0.x;
        laneP0.y = p0.y + laneAndSpacingAdjusted;
        laneP1.x = p1.x;
        laneP1.y = p1.y + laneAndSpacingAdjusted;
        laneP2.x = p2.x;
        laneP2.y = p2.y + laneAndSpacingAdjusted;
      } else if (p0.x > p2.x && p0.y < p2.y && p0.y < p1.y) {
        //topLeft
        laneP0.x = p0.x - laneAndSpacingAdjusted;
        laneP0.y = p0.y;
        laneP1.x = p1.x - laneAndSpacingAdjusted;
        laneP1.y = p1.y - laneAndSpacingAdjusted;
        laneP2.x = p2.x;
        laneP2.y = p2.y - laneAndSpacingAdjusted;
      } else if (p0.x < p2.x && p0.y < p2.y && p0.y < p1.y) {
        //topRight
        laneP0.x = p0.x - laneAndSpacingAdjusted;
        laneP0.y = p0.y;
        laneP1.x = p1.x - laneAndSpacingAdjusted;
        laneP1.y = p1.y + laneAndSpacingAdjusted;
        laneP2.x = p2.x;
        laneP2.y = p2.y + laneAndSpacingAdjusted;
      } else if (p0.x < p2.x && p0.y < p2.y) {
        //bottomLeft
        laneP0.x = p0.x;
        laneP0.y = p0.y + laneAndSpacingAdjusted;
        laneP1.x = p1.x - laneAndSpacingAdjusted;
        laneP1.y = p1.y + laneAndSpacingAdjusted;
        laneP2.x = p2.x - laneAndSpacingAdjusted;
        laneP2.y = p2.y;
      } else if (p0.x > p2.x && p0.y < p2.y) {
        //bototmRight
        laneP0.x = p0.x;
        laneP0.y = p0.y - laneAndSpacingAdjusted;
        laneP1.x = p1.x - laneAndSpacingAdjusted;
        laneP1.y = p1.y - laneAndSpacingAdjusted;
        laneP2.x = p2.x - laneAndSpacingAdjusted;
        laneP2.y = p2.y;
      }

      this.lanes.push(new QuadraticCurve(laneP0, laneP1, laneP2));
    }
  }

  static createRoad(startX, startY, controlX, controlY, endX, endY) {
    let start = new Point(startX, startY);
    let control = new Point(controlX, controlY);
    let end = new Point(endX, endY);

    return new Road(start, control, end);
  }

  render(context) {
    context.save();
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(this.p0.x, this.p0.y);
    context.quadraticCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    context.stroke();
    context.restore();

    /*this.lanes.forEach(lane => {
      context.save();
      context.strokeStyle = "white";
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(lane.p0.x, lane.p0.y);
      context.quadraticCurveTo(lane.p1.x, lane.p1.y, lane.p2.x, lane.p2.y);
      context.stroke();
      context.restore();
    });*/

    this.rightLane.forEach(lane => {
      context.save();
      context.strokeStyle = "red";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(lane.p0.x, lane.p0.y);
      context.quadraticCurveTo(lane.p1.x, lane.p1.y, lane.p2.x, lane.p2.y);
      context.stroke();
      context.restore();

      //Draw directional arrow at 1/2 distance
      let halfWayPoint = lane.getPointAtPercent(0.5);

      context.save();

      context.translate(halfWayPoint.x, halfWayPoint.y);
      context.rotate(
        Math.atan2(lane.p2.y - lane.p0.y, lane.p2.x - lane.p0.x) +
          1.5707963267948966
      );
      context.strokeStyle = "yellow";
      context.fillStyle = "yellow";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(5, 5);
      context.lineTo(-5, 5);
      context.closePath();
      context.fill();
      context.restore();
    });

    this.leftLane.forEach(lane => {
      context.save();
      context.strokeStyle = "green";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(lane.p0.x, lane.p0.y);
      context.quadraticCurveTo(lane.p1.x, lane.p1.y, lane.p2.x, lane.p2.y);
      context.stroke();
      context.restore();

      //Draw directional arrow at 1/2 distance
      let halfWayPoint = lane.getPointAtPercent(0.25);

      context.save();

      context.translate(halfWayPoint.x, halfWayPoint.y);
      context.rotate(
        Math.atan2(lane.p2.y - lane.p0.y, lane.p2.x - lane.p0.x) +
          1.5707963267948966
      );
      context.strokeStyle = "yellow";
      context.fillStyle = "yellow";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(5, 5);
      context.lineTo(-5, 5);
      context.closePath();
      context.fill();
      context.restore();
    });
  }
}
