import {QuadraticCurve, Point} from "./QuadraticCurve";

const LANE_WIDTH = 6;
const LANE_SPACING = 0;

export default class Road extends QuadraticCurve {
  constructor(p0, p1, p2, lanes = 2) {
    super(p0, p1, p2);

    this.lanes = [];
    this.laneMatrix = [];

    this.rightLanes = [];
    this.leftLanes = [];

    this.laneAndSpacing = LANE_WIDTH + LANE_SPACING;

    for (let lane = 1; lane <= lanes; lane++) {
      this.generateLanesFromRoads(lane);
    }
  }

  static createRoad(startX, startY, controlX, controlY, endX, endY) {
    let start = new Point(startX, startY);
    let control = new Point(controlX, controlY);
    let end = new Point(endX, endY);

    return new Road(start, control, end);
  }

  generateLanesFromRoads(lanes = 1) {
    const {p0, p1, p2} = this;

    for (let i = 1; i >= -1; i -= 2) {
      let laneAndSpacingAdjusted;

      let laneP0 = new Point(),
        laneP1 = new Point(),
        laneP2 = new Point();

      laneAndSpacingAdjusted = this.laneAndSpacing * 2 * lanes * i;

      if (p0.x === p1.x && p1.x === p2.x) {
        //vertical
        laneP0.x = p0.x - laneAndSpacingAdjusted;
        laneP0.y = p0.y;
        laneP1.x = p1.x - laneAndSpacingAdjusted;
        laneP1.y = p1.y;
        laneP2.x = p2.x - laneAndSpacingAdjusted;
        laneP2.y = p2.y;
      } else if (p0.y === p1.y && p1.y === p2.y) {
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

      let newLane = new QuadraticCurve(laneP0, laneP1, laneP2);

      newLane.road = this;
      this.lanes.push(newLane);

      if (i > 0) {
        this.leftLanes.push(newLane);
      } else {
        this.rightLanes.push(newLane);
      }
    }
  }

  drawLane(context, lane, colour) {
    context.save();
    context.strokeStyle = colour;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(lane.p0.x, lane.p0.y);
    context.quadraticCurveTo(lane.p1.x, lane.p1.y, lane.p2.x, lane.p2.y);
    context.stroke();
    context.closePath();
    context.restore();

    //Draw directional arrow at 1/2 distance
    let halfWayPoint = lane.getPointAtPercent(0.4);

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
  }

  render(context) {
    if (!this.laneMatrixGenerated) return;

    context.save();
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(this.p0.x, this.p0.y);
    context.quadraticCurveTo(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    context.stroke();
    context.restore();

    this.leftLanes.forEach(lane => {
      this.drawLane(context, lane, "red");
    });

    this.rightLanes.forEach(lane => {
      this.drawLane(context, lane, "green");
    });
  }
}
