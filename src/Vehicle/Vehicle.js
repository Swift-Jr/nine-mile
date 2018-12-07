import {randomNumBetween} from "../utils";
import {Point} from "../QuadraticCurve";

import SAT from "sat";

export class Vehicle {
  constructor(args) {
    this.currentMap = args.currentMap;
    this.maximumSpeed = randomNumBetween(0.9, 1);
    this.minimumSpeed = randomNumBetween(0.1, 0.3);
    this.create = args.create;

    this.angle = 0;
    this.speed = 0;
    this.width = 10;
    this.height = 20;
    this.onMap = false;
    this.collisionMap = args.collisionMap;
    this.space = randomNumBetween(2, 8);
    this.entryRoad = this.currentMap.randomEntryRoad();
    this.entryLane = this.entryLaneFromRoad(this.entryRoad);
    this.travelHistory = [];

    this.distanceTraveled = 0;
    this.distanceOnLane = 0;

    this.position = new Point();

    this.setPositionOnLane(this.entryLane);
    this.setLane(this.entryLane);
  }

  entryLaneFromRoad(road) {
    let options = road.lanes.filter(lane => {
      return (
        lane.p0.y === 0 ||
        lane.p0.x === 0 ||
        lane.p0.y === this.currentMap.height ||
        lane.p0.x === this.currentMap.width
      );
    });

    return options[0];
  }

  setPositionOnLane(lane) {
    let {position} = this;
    let x = Math.round(position.x / 10) * 10;
    let y = Math.round(position.y / 10) * 10;

    position.x = lane.p0.x;
    position.y = lane.p0.y;
  }

  setLane(lane) {
    this.currentLane = lane;
    this.travelHistory.push(lane);

    this.setNextLane();
  }

  setNextLane() {
    let options = this.currentMap.laneJunctions[this.currentLane.p2.x][
      this.currentLane.p2.y
    ].filter(possibility => {
      return possibility.road.tile != this.currentLane.road.tile;
    });

    let option = options.length;
    if (option > 1) {
      option = Math.ceil(randomNumBetween(0, option - 1));
    }

    this.nextLane = options[option - 1];
  }

  updatePosition(x, y) {
    this.position.x = x;
    this.position.y = y;

    if (!this.onMap && (x > 0 || y > 0)) {
      this.onMap = true;
    }
  }

  destroy() {
    this.delete = true;
  }

  bounding(x = null, y = null) {
    let space2 = 2 * this.space;
    return {
      x: (x || this.position.x) - this.width / 2,
      y: (y || this.position.y) - this.height / 2 - space2 / 2,
      width: this.width,
      height: this.height + space2
    };
  }

  accelerate() {
    if (this.speed < this.maximumSpeed) {
      let newSpeed = (this.speed || this.minimumSpeed) * 1.05;
      if (newSpeed > this.maximumSpeed) newSpeed = this.maximumSpeed;

      this.speed = Math.ceil(newSpeed * 1000) / 1000;
    }
  }

  decelerate() {
    if (this.speed > 0) {
      let newSpeed = this.speed * 0.8;

      this.speed = Math.ceil(newSpeed * 10) / 10;
    }
  }

  render(state) {
    if (this.speed === 0) {
      this.accelerate();
    }

    if (randomNumBetween(0, 1) > 1.5) {
      this.decelerate();
    }

    if (this.distanceOnLane >= this.currentLane.getLength()) {
      if (this.nextLane) {
        this.distanceOnLane -= this.currentLane.getLength();
        this.setLane(this.nextLane);
      } else {
        this.destroy();
      }
    }

    // Move
    let newPosition = this.currentLane.getPointAtDistance(
      this.distanceOnLane + this.speed
    );

    this.collisionMap.moveTo(this, newPosition.x, newPosition.y);

    if (
      this.position.x === newPosition.x &&
      this.position.y === newPosition.y
    ) {
      this.distanceOnLane += this.speed;
      this.distanceTraveled += this.speed;

      this.accelerate();
    } else {
      this.decelerate();
    }

    // Screen edges
    if (this.onMap && this.currentMap.outOfBounds(this)) {
      return this.destroy();
    }

    // Draw
    if (this.onMap) {
      const context = state.context;

      this.angle =
        this.currentLane.getAngleAtDistance(this.distanceOnLane) -
        1.5707963267948966;

      context.save();

      context.translate(this.position.x, this.position.y);
      context.rotate(this.angle);

      context.fillStyle = "grey";
      context.fillRect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );

      context.strokeStyle = "grey";
      context.lineWidth = 2;
      context.rect(
        this.bounding().x - this.position.x,
        this.bounding().y - this.position.y,
        this.bounding().width,
        this.bounding().height
      );
      context.stroke();

      context.restore();
    }
  }
}
