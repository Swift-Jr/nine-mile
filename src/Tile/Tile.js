import tiles from "./images";
import QuadraticCurve from "../QuadraticCurve";

export const TILE_WIDTH = 100;
export const TILE_HEIGHT = 100;

function isDebug() {
  return true;
}

const tileTypes = {
  0: {
    imageSrc: undefined,
    width: 1,
    height: 1,
    roads: []
  },
  1: {
    imageSrc: tiles.straight_vertical,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [{p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 50, p2y: 100}]
  },
  2: {
    imageSrc: tiles.straight_vertical,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [{p0x: 0, p0y: 50, p1x: 50, p1y: 50, p2x: 100, p2y: 50}]
  },
  3: {
    imageSrc: tiles.straight_vertical,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [
      {p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 100, p2y: 50},
      {p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 50, p2y: 100}
    ]
  },
  4: {
    imageSrc: tiles.straight_vertical,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [{p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 100, p2y: 50}]
  },
  5: {
    imageSrc: tiles.straight_vertical,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [{p0x: 0, p0y: 50, p1x: 50, p1y: 50, p2x: 50, p2y: 100}]
  }
};

const tyleType = {};

export class Tile {
  constructor(type) {
    this.type = tileTypes[type];

    if (this.type.imageSrc && !this.type.image) {
      this.type.image = new Image();
      this.type.image.src = this.type.imageSrc;
    }

    this.currentPosition = {x: 0, y: 0};
  }

  position(x, y) {
    this.currentPosition.x = x;
    this.currentPosition.y = y;
  }

  getRoads() {
    this.mappedRoads = this.type.roads.map(road => {
      return QuadraticCurve.create(
        road.p0x + this.currentPosition.x,
        road.p0y + this.currentPosition.y,
        road.p1x + this.currentPosition.x,
        road.p1y + this.currentPosition.y,
        road.p2x + this.currentPosition.x,
        road.p2y + this.currentPosition.y
      );
    });

    return this.mappedRoads;
  }

  getX() {
    return this.currentPosition.x;
  }

  getY() {
    return this.currentPosition.y;
  }

  isEdge(isEdge) {
    this.isEdge = isEdge;
  }

  getWidth() {
    return this.type.width * TILE_WIDTH;
  }

  getHeight() {
    return this.type.height * TILE_HEIGHT;
  }

  render(context) {
    if (!this.type.image) return;
    context.drawImage(
      this.type.image,
      this.currentPosition.x,
      this.currentPosition.y
    );

    if (isDebug()) {
      this.mappedRoads.forEach(road => {
        context.beginPath();
        context.moveTo(road.p0.x, road.p0.y);
        context.quadraticCurveTo(road.p1.x, road.p1.y, road.p2.x, road.p2.y);
        context.stroke();
      });
    }
  }
}
