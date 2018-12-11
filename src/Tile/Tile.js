//import tilesImages from "./images";
import Road from "../Road";

export const TILE_WIDTH = 100;
export const TILE_HEIGHT = 100;

function isDebug() {
  return true;
}

const TILE_TYPES = {
  UNDEFINED: 0,

  STRAIGHT_VERTICAL: 1,
  STRAIGHT_HORIZONTAL: 2,

  TURN_TOP_LEFT: 10,
  TURN_TOP_RIGHT: 11,
  TURN_BOTTOM_LEFT: 12,
  TURN_BOTTOM_RIGHT: 13,

  JUNCTION_CROSS: 20,
  JUNCTION_T_TOP: 21,
  JUNCTION_T_RIGHT: 22,
  JUNCTION_T_BOTTOM: 23,
  JUNCTION_T_LEFT: 24
};

const TILES = {
  [TILE_TYPES.UNDEFINED]: {
    imageSrc: undefined,
    width: 1,
    height: 1,
    roads: []
  },
  [TILE_TYPES.STRAIGHT_VERTICAL]: {
    //imageSrc: tiles.straight_vertical,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [{p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 50, p2y: 100}]
  },
  [TILE_TYPES.STRAIGHT_HORIZONTAL]: {
    //imageSrc: tiles.straight_horizontal,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [{p0x: 0, p0y: 50, p1x: 50, p1y: 50, p2x: 100, p2y: 50}]
  },

  [TILE_TYPES.TURN_TOP_RIGHT]: {
    //imageSrc: tiles.straight_vertical,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [{p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 100, p2y: 50}]
  },
  [TILE_TYPES.TURN_TOP_LEFT]: {
    //imageSrc: tiles.straight_vertical,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [{p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 0, p2y: 50}]
  },
  [TILE_TYPES.TURN_BOTTOM_LEFT]: {
    //imageSrc: tiles.straight_vertical,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [{p0x: 0, p0y: 50, p1x: 50, p1y: 50, p2x: 50, p2y: 100}]
  },
  [TILE_TYPES.TURN_BOTTOM_RIGHT]: {
    //imageSrc: tiles.straight_vertical,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [{p0x: 100, p0y: 50, p1x: 50, p1y: 50, p2x: 50, p2y: 100}]
  },
  [TILE_TYPES.JUNCTION_T_RIGHT]: {
    //imageSrc: tiles.t_right,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [
      {p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 50, p2y: 100},
      {p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 100, p2y: 50},
      {p0x: 100, p0y: 50, p1x: 50, p1y: 50, p2x: 50, p2y: 100}
    ]
  },
  [TILE_TYPES.JUNCTION_T_LEFT]: {
    //imageSrc: tiles.t_right,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [
      {p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 50, p2y: 100},
      {p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 0, p2y: 50},
      {p0x: 0, p0y: 50, p1x: 50, p1y: 50, p2x: 50, p2y: 100}
    ]
  },
  [TILE_TYPES.JUNCTION_T_TOP]: {
    //imageSrc: tiles.t_right,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [
      {p0x: 0, p0y: 50, p1x: 50, p1y: 50, p2x: 100, p2y: 50},
      {p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 0, p2y: 50},
      {p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 100, p2y: 50}
    ]
  },
  [TILE_TYPES.JUNCTION_T_BOTTOM]: {
    //imageSrc: tiles.t_right,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [
      {p0x: 0, p0y: 50, p1x: 50, p1y: 50, p2x: 50, p2y: 100},
      {p0x: 0, p0y: 50, p1x: 50, p1y: 50, p2x: 100, p2y: 50},
      {p0x: 100, p0y: 50, p1x: 50, p1y: 50, p2x: 50, p2y: 100}
    ]
  },
  [TILE_TYPES.JUNCTION_CROSS]: {
    //imageSrc: tiles.t_right,
    width: 1,
    height: 1,
    lanes: 2,
    oneway: false,
    //edgeTile: false,
    roads: [
      {p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 50, p2y: 100},
      {p0x: 0, p0y: 50, p1x: 50, p1y: 50, p2x: 100, p2y: 50},
      {p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 100, p2y: 50},
      {p0x: 50, p0y: 0, p1x: 50, p1y: 50, p2x: 0, p2y: 50},
      {p0x: 0, p0y: 50, p1x: 50, p1y: 50, p2x: 50, p2y: 100},
      {p0x: 100, p0y: 50, p1x: 50, p1y: 50, p2x: 50, p2y: 100}
    ]
  }
};

const tyleType = {};

export class Tile {
  constructor(type) {
    this.type = TILES[type];

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
      return Road.createRoad(
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
    if (this.type.image) {
      context.drawImage(
        this.type.image,
        this.currentPosition.x,
        this.currentPosition.y
      );
    }

    if (isDebug()) {
      this.mappedRoads.forEach(road => {
        road.render(context);
      });
    }
  }
}
