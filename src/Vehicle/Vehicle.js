import {randomNumBetween} from "../utils";
import {Point} from "../QuadraticCurve";

export class Vehicle {
  constructor(args) {
    this.currentMap = args.currentMap;
    this.maximumSpeed = randomNumBetween(0.9, 1);
    this.minimumSpeed = randomNumBetween(0.1, 0.3);
    this.create = args.create;

    this.speed = 0;
    this.width = 10;
    this.height = 20;
    this.onMap = false;
    this.collisionMap = args.collisionMap;
    this.space = randomNumBetween(2, 8);
    this.entryRoad = this.currentMap.randomEntryRoad();
    this.travelHistory = [];

    this.distanceTraveled = 0;
    this.distanceOnRoad = 0;

    this.position = new Point();
    this.isTravelingInverted = false;

    this.setPositionOnRoad(this.entryRoad);
    this.setRoad(this.entryRoad);
    //this.addScore = args.addScore;
  }

  setPositionOnRoad(road) {
    let {position} = this;
    let newPosition = new Point();

    if (position.x === road.p0.x && position.y === road.p0.y) {
      newPosition.x = road.p0.x;
      newPosition.y = road.p0.y;
      this.isTravelingInverted = false;
    } else if (position.x === road.p2.x && position.y === road.p2.y) {
      newPosition.x = road.p2.x;
      newPosition.y = road.p2.y;
      this.isTravelingInverted = true;
    } else if (
      (position.x === 0 && road.p0.x === 0) ||
      (position.y === 0 && road.p0.y === 0)
    ) {
      newPosition.x = road.p0.x;
      newPosition.y = road.p0.y;
      this.isTravelingInverted = false;
    } else {
      newPosition.x = road.p2.x;
      newPosition.y = road.p2.y;
      this.isTravelingInverted = true;
    }

    this.position = newPosition;
  }

  setRoad(road) {
    this.currentRoad = road;
    this.travelHistory.push(road);

    this.setNextRoad();
  }

  setNextRoad() {
    let nextJunction = this.isTravelingInverted
      ? this.currentRoad.p0
      : this.currentRoad.p2;

    let options = this.currentMap.junctions[nextJunction.x][
      nextJunction.y
    ].filter(possibility => {
      return possibility != this.currentRoad;
    });

    //TODO: Pick a random option
    if (options.length == 0) debugger;
    this.nextRoad = options[0];
  }

  updatePosition(x, y) {
    this.position.x = x;
    this.position.y = y;

    if (!this.onMap && /*x > 0 ||*/ y > 0) {
      this.onMap = true;
    }
    //this.position = this.currentTile.
  }

  destroy() {
    this.delete = true;
    //this.addScore(this.score);
  }

  bounding(x = null, y = null) {
    let space2 = 2 * this.space;
    return {
      x: (x || this.position.x) - this.space,
      y: (y || this.position.y) - this.space,
      width: this.width + space2,
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

    if (this.distanceOnRoad >= this.currentRoad.getLength()) {
      //this.setRoad(this.nextRoad);
    }

    // Move
    let newPosition = this.currentRoad.getPointAtDistance(
      this.distanceOnRoad + this.speed,
      this.isTravelingInverted //TODO:This just isnt working...
    );

    this.collisionMap.moveTo(this, newPosition.x, newPosition.y);

    if (
      this.position.x === newPosition.x &&
      this.position.y === newPosition.y
    ) {
      this.distanceOnRoad += this.speed;
      this.distanceTraveled += this.speed;

      this.accelerate();
    } else {
      this.decelerate();
    }

    // Screen edges
    if (this.onMap && this.currentMap.outOfBounds(this)) {
      return this.destroy();
    }

    //Arriving

    // Draw
    if (this.onMap) {
      const context = state.context;
      context.save();
      context.fillStyle = "green";
      context.fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );

      context.strokeStyle = "green";
      context.rect(
        this.bounding().x,
        this.bounding().y,
        this.bounding().width,
        this.bounding().height
      );
      context.stroke();

      context.restore();
    }
  }
}
