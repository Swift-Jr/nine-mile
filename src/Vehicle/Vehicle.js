import React from "react";

import {randomNumBetween} from "../utils";
import {Point} from "../QuadraticCurve";

import SAT from "sat";

import {Group, RegularPolygon, Rect} from "react-konva";

export class Vehicle {
  constructor(args) {
    this.currentMap = args.currentMap;
    this.create = args.create;
    this.collisionMap = args.collisionMap;

    this.randomiseBehaviours();

    //TODO: Create an SATPolygon for the vehicle too
    this.SATPolygon = null;
    this.position = new Point();

    this.angle = 0;
    this.speed = 0;
    this.width = 10;
    this.height = 20;
    this.onMap = false;

    this.konvaNode = null;

    this.travelHistory = [];
    this.distanceTraveled = 0;
    this.distanceOnLane = 0;

    this.entryRoad = this.currentMap.randomEntryRoad();
    this.entryLane = this.entryLaneFromRoad(this.entryRoad);

    this.setPositionOnLane(this.entryLane);
    this.setLane(this.entryLane);

    this.createSATPolygon();
  }

  randomiseBehaviours() {
    this.maximumSpeed = randomNumBetween(0.9, 1);
    this.minimumSpeed = randomNumBetween(0.1, 0.3);
    this.space = randomNumBetween(2, 8);
  }

  createSATPolygon() {
    let bounding = this.bounding();

    this.SATPolygon = new SAT.Polygon(new SAT.Vector(bounding.x, bounding.y), [
      new SAT.Vector(bounding.x, bounding.y),
      new SAT.Vector(bounding.x, bounding.y + bounding.height),
      new SAT.Vector(bounding.x + bounding.width, bounding.y + bounding.height),
      new SAT.Vector(bounding.x + bounding.width, bounding.y)
    ]);
  }

  getSATPolygon(x, y) {
    let bounding = this.bounding(x, y);

    let boundingPolygon = new SAT.Polygon(new SAT.Vector(0, 0), [
      new SAT.Vector(-bounding.width / 2, -bounding.height / 2),
      new SAT.Vector(-bounding.width / 2, bounding.height / 2),
      new SAT.Vector(bounding.width / 2, bounding.height / 2),
      new SAT.Vector(bounding.width / 2, -bounding.height / 2)
    ]);

    boundingPolygon.rotate(this.angle);
    boundingPolygon.translate(x, y);

    return boundingPolygon;
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

    position.x = lane.p0.x;
    position.y = lane.p0.y;
  }

  setLane(lane) {
    this.currentLane = lane;
    this.travelHistory.push(lane);

    this.setNextLane();
  }

  setNextLane() {
    const {currentLane, currentMap} = this;

    let options = currentMap.laneJunctions[currentLane.p2.x][
      currentLane.p2.y
    ].filter(possibility => {
      return possibility.road.tile !== currentLane.road.tile;
    });

    let option = options.length;
    if (option > 1) {
      option = Math.ceil(randomNumBetween(0, option - 1));
    }

    this.nextLane = options[option - 1];
  }

  updatePosition(x, y, SATPolygon) {
    this.position.x = x;
    this.position.y = y;
    this.SATPolygon = SATPolygon;

    if (
      !this.onMap &&
      (x > 0 || y > 0) &&
      x < this.currentMap.width &&
      y < this.currentMap.height
    ) {
      this.onMap = true;
    }
  }

  destroy() {
    this.delete = true;
    this.onMap = false;
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

  updateCurrentSpeed() {
    if (this.speed === 0) {
      this.accelerate();
    }

    if (randomNumBetween(0, 1) > 1.5) {
      this.decelerate();
    }
  }

  updateCurrentLane() {
    const {currentLane} = this;

    if (this.distanceOnLane >= currentLane.getLength()) {
      if (this.nextLane) {
        this.distanceOnLane -= currentLane.getLength();
        this.setLane(this.nextLane);
      } else {
        this.destroy();
      }
    }
  }

  tryAndMove() {
    const {currentLane} = this;

    let newPosition = currentLane.getPointAtDistance(
      this.distanceOnLane + this.speed
    );

    this.collisionMap.moveTo(this, newPosition.x, newPosition.y);

    if (this.position.matches(newPosition)) {
      this.distanceOnLane += this.speed;
      this.distanceTraveled += this.speed;

      this.accelerate();
    } else {
      this.decelerate();
    }

    if (this.onMap && this.currentMap.outOfBounds(this)) {
      this.destroy();
    }
  }

  renderKonva() {
    let bounding = this.bounding();

    return (
      <Group
        ref={node => (this.knovaNode = node)}
        offsetX={this.width / 2}
        offsetY={this.height / 2}
        width={this.width}
        height={this.height}
        x={this.position.x}
        y={this.position.y}
        rotation={this.currentLane.getAngleAtDistance(
          this.distanceOnLane,
          false,
          true
        )}
      >
        <Rect
          offsetX={0}
          offsetY={this.space}
          width={bounding.width}
          height={bounding.height}
          stroke="grey"
        />
        <Rect width={this.width} height={this.height} fill="grey" />
        <RegularPolygon
          rotation={180}
          offsetX={this.width / 2}
          offsetY={this.height / 2}
          sides={3}
          radius={5}
          fill="yellow"
          x={0}
          y={0}
        />
      </Group>
    );
  }

  updateKonva() {
    this.knovaNode.position(this.position);
    this.knovaNode.rotation(
      this.currentLane.getAngleAtDistance(this.distanceOnLane, false, true) - 90
    );
  }

  render(state) {
    const {currentLane} = this;

    this.updateCurrentSpeed();
    this.updateCurrentLane();
    this.tryAndMove();

    // Draw
    if (this.onMap) {
      const context = state.context;

      this.angle =
        currentLane.getAngleAtDistance(this.distanceOnLane) -
        1.5707963267948966;

      context.save();

      context.beginPath();
      context.translate(this.position.x, this.position.y);
      context.rotate(this.angle);

      context.fillStyle = "grey";
      context.fillRect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
      context.closePath();
      context.stroke();

      context.fillStyle = "yellow";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(-5, -5);
      context.lineTo(5, -5);
      context.closePath();
      context.fill();
      context.restore();

      context.restore();

      //SAT BOunding
      context.save();
      context.beginPath();
      context.strokeStyle = "yellow";
      context.lineWidth = 1;
      for (
        let cPoint = 0;
        cPoint < this.SATPolygon.calcPoints.length;
        cPoint++
      ) {
        if (cPoint === 0) {
          context.moveTo(
            this.SATPolygon.calcPoints[cPoint].x,
            this.SATPolygon.calcPoints[cPoint].y
          );
        } else {
          context.lineTo(
            this.SATPolygon.calcPoints[cPoint].x,
            this.SATPolygon.calcPoints[cPoint].y
          );
        }
      }
      context.lineTo(
        this.SATPolygon.calcPoints[0].x,
        this.SATPolygon.calcPoints[0].y
      );
      context.stroke();
      context.closePath();

      context.restore();
    } else {
      this.destroy();
    }
  }
}
