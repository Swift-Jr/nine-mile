import {Tile, TILE_WIDTH, TILE_HEIGHT} from "../Tile";
import {randomNumBetween} from "../utils";

export class Map {
  constructor(tileMap) {
    this.tiles = [];
    this.edgeTiles = [];
    this.edgeRoads = [];
    this.width = Math.max(...tileMap.map(tile => tile.length)) * TILE_WIDTH;
    this.height = tileMap.length * TILE_HEIGHT;

    this.roads = [];
    this.junctions = [];

    this.lanes = [];
    this.laneJunctions = [];

    this.lastLaneGenerated = null;

    this.loadTiles(tileMap);

    this.generateLaneMatrix();
    this.fixMissingLanes();
  }

  loadTiles(tileMap) {
    let cX = 0,
      cY = 0,
      pY = 0,
      pX = 0;

    tileMap.forEach(row => {
      row.forEach(tileType => {
        let tile = new Tile(tileType);
        tile.position(cX, cY);
        this.addRoadsToMap(tile.getRoads(), tile);

        if (
          pX === 0 ||
          pY === 0 ||
          pX === tileMap[0].length ||
          pY === tileMap.length
        ) {
          tile.isEdge(true);
          this.edgeTiles.push(tile);
        }

        if (!this.tiles[pY]) this.tiles[pY] = [];
        this.tiles[pY][pX] = tile;

        pY++;
        cX += tile.getWidth();
      });
      pY = 0;
      pX++;
      cX = 0;
      cY += TILE_HEIGHT;
    });

    return;
  }

  generateLaneMatrix(currentLanes, intersect, roadIntersect) {
    if (!currentLanes) {
      let entryRoad = this.randomEntryRoad();

      //Get left lane
      if (entryRoad.leftLanes[0].p0.y === 0) {
        //top
        currentLanes =
          entryRoad.leftLanes[0].p0.x < entryRoad.rightLanes[0].p0.x
            ? entryRoad.rightLanes
            : entryRoad.leftLanes;
        intersect = currentLanes[0].p2;
        roadIntersect = currentLanes[0].road.p2;
      } else if (entryRoad.leftLanes[0].p0.x === 0) {
        //left
        currentLanes =
          entryRoad.leftLanes[0].p0.y > entryRoad.rightLanes[1].p0.y
            ? entryRoad.leftLanes
            : entryRoad.rightLanes;
        intersect = currentLanes[0].p2;
        roadIntersect = currentLanes[0].road.p2;
      } else if (entryRoad.leftLanes[0].p2.y === this.height) {
        //bottom
        currentLanes =
          entryRoad.leftLanes[0].p2.x < entryRoad.rightLanes[1].p2.x
            ? entryRoad.leftLanes
            : entryRoad.rightLanes;
        intersect = currentLanes[0].p0;
        roadIntersect = currentLanes[0].road.p0;
      } else if (entryRoad.leftLanes[0].p2.x === this.width) {
        //right
        currentLanes =
          entryRoad.leftLanes[0].p2.y > entryRoad.rightLanes[1].p2.y
            ? entryRoad.leftLanes
            : entryRoad.rightLanes;
        intersect = currentLanes[0].p0;
        roadIntersect = currentLanes[0].road.p0;
      }
    }

    //Direct the lane so intersect at p0
    if (
      currentLanes[0].p0.x === intersect.x &&
      currentLanes[0].p0.y === intersect.y
    ) {
      currentLanes = currentLanes.map(currentLane => {
        let newP2 = currentLane.p0;
        currentLane.p0 = currentLane.p2;
        currentLane.p2 = newP2;
        return currentLane;
      });
    }

    //Reverse for the other lanes
    let otherLanes =
      currentLanes[0].road.leftLanes[0] === currentLanes[0]
        ? currentLanes[0].road.rightLanes
        : currentLanes[0].road.leftLanes;

    if (
      otherLanes[0].p2.x === intersect.x ||
      otherLanes[0].p2.y === intersect.y
    ) {
      otherLanes = otherLanes.map(currentLane => {
        let newP2 = currentLane.p0;
        currentLane.p0 = currentLane.p2;
        currentLane.p2 = newP2;
        return currentLane;
      });

      if (currentLanes[0].road.leftLanes[0] === currentLanes[0]) {
        currentLanes[0].road.rightLanes = otherLanes;
      } else {
        currentLanes[0].road.leftLanes = otherLanes;
      }
    }

    currentLanes[0].road.laneMatrixGenerated = true;

    this.junctions[roadIntersect.x][roadIntersect.y]
      .filter(
        road =>
          road != currentLanes[0].road &&
          road.tile != currentLanes[0].road.tile &&
          !road.laneMatrixGenerated
      )
      .forEach(nextRoad => {
        let nextLanes, nextIntersect, nextRoadIntersect;

        if (
          intersect.x === nextRoad.leftLanes[0].p0.x &&
          intersect.y === nextRoad.leftLanes[0].p0.y
        ) {
          nextLanes = nextRoad.leftLanes;
          nextIntersect = nextRoad.leftLanes[0].p2;
          nextRoadIntersect = nextRoad.p2;
        } else if (
          intersect.x === nextRoad.leftLanes[0].p2.x &&
          intersect.y === nextRoad.leftLanes[0].p2.y
        ) {
          nextLanes = nextRoad.leftLanes;
          nextIntersect = nextRoad.leftLanes[0].p0;
          nextRoadIntersect = nextRoad.p0;
        } else if (
          intersect.x === nextRoad.rightLanes[0].p0.x &&
          intersect.y === nextRoad.rightLanes[0].p0.y
        ) {
          nextLanes = nextRoad.rightLanes;
          nextIntersect = nextRoad.rightLanes[0].p2;
          nextRoadIntersect = nextRoad.p2;
        } else if (
          intersect.x === nextRoad.rightLanes[0].p2.x &&
          intersect.y === nextRoad.rightLanes[0].p2.y
        ) {
          nextLanes = nextRoad.rightLanes;
          nextIntersect = nextRoad.rightLanes[0].p0;
          nextRoadIntersect = nextRoad.p0;
        }

        this.generateLaneMatrix(nextLanes, nextIntersect, nextRoadIntersect);
      });
  }

  fixMissingLanes() {
    //TODO: Fix this up
    this.roads.filter(road => !road.laneMatrixGenerated).forEach(road => {
      let firstLeftLane = road.leftLanes[0];

      let intersectLeftLane = this.laneJunctions[firstLeftLane.p0.x][
        firstLeftLane.p0.y
      ].filter(
        junctionLane =>
          junctionLane.road.tile != firstLeftLane.road.tile &&
          junctionLane.road.laneMatrixGenerated
      )[0];

      if (
        firstLeftLane.p0.x === intersectLeftLane.p0.x &&
        firstLeftLane.p0.y === intersectLeftLane.p0.y
      ) {
        road.leftLanes = road.leftLanes.map(lane => {
          let newP2 = lane.p0;
          lane.p0 = lane.p2;
          lane.p2 = newP2;

          return lane;
        });
      }

      road.laneMatrixGenerated = true;
    });
  }

  addRoadsToMap(roads, tile) {
    let roadsWithJunctions = roads.map(road => {
      let {p0, p2} = road;
      //check the bounding points (ends of road) of p0 and p2
      //add a junction and reference if not set

      if (!this.junctions[p0.x]) {
        this.junctions[p0.x] = [];
      }

      if (!this.junctions[p0.x][p0.y]) {
        this.junctions[p0.x][p0.y] = [];
      }

      if (!this.junctions[p2.x]) {
        this.junctions[p2.x] = [];
      }

      if (!this.junctions[p2.x][p2.y]) {
        this.junctions[p2.x][p2.y] = [];
      }

      road.p0junction = this.junctions[p0.x][p0.y];
      road.p2junction = this.junctions[p2.x][p2.y];

      if (
        p0.x === 0 ||
        p0.y === 0 ||
        p0.x === this.width ||
        p0.y === this.height ||
        p2.x === 0 ||
        p2.y === 0 ||
        p2.x === this.width ||
        p2.y === this.height
      ) {
        this.edgeRoads.push(road);
      }

      this.junctions[p0.x][p0.y].push(road);
      this.junctions[p2.x][p2.y].push(road);

      road.tile = tile;

      this.addLanesToMap(road.lanes, road);

      return road;
    });

    this.roads = this.roads.concat(roadsWithJunctions);
  }

  addLanesToMap(lanes, road) {
    let lanesWithJunctions = lanes.map(lane => {
      let {p0, p2} = lane;
      //check the bounding points (ends of lane) of p0 and p2
      //add a junction and reference if not set

      if (!this.laneJunctions[p0.x]) {
        this.laneJunctions[p0.x] = [];
      }

      if (!this.laneJunctions[p0.x][p0.y]) {
        this.laneJunctions[p0.x][p0.y] = [];
      }

      if (!this.laneJunctions[p2.x]) {
        this.laneJunctions[p2.x] = [];
      }

      if (!this.laneJunctions[p2.x][p2.y]) {
        this.laneJunctions[p2.x][p2.y] = [];
      }

      lane.p0junction = this.laneJunctions[p0.x][p0.y];
      lane.p2junction = this.laneJunctions[p2.x][p2.y];

      lane.road = road;

      this.laneJunctions[p0.x][p0.y].push(lane);
      this.laneJunctions[p2.x][p2.y].push(lane);

      return lane;
    });

    this.lanes = this.lanes.concat(lanesWithJunctions);
  }

  randomEntryTile() {
    return this.edgeTiles[0];
  }

  randomEntryRoad() {
    let randomNumber = Math.floor(
      randomNumBetween(0, this.edgeRoads.length - 1)
    );
    return this.edgeRoads[randomNumber];
  }

  outOfBounds(object) {
    let {x, y, width, height} = object.bounding();

    return x < 0 - width || y < 0 - height || x > this.width || y > this.height;
  }

  render(context) {
    this.tiles.forEach(row => {
      row.forEach(tile => {
        tile.render(context);
      });
    });

    this.junctions.forEach((junctions, x) => {
      junctions.forEach((junction, y) => {
        let boundingSize = 20;

        context.save();
        context.beginPath();
        context.strokeStyle = "green";
        context.rect(
          x - boundingSize / 2,
          y - boundingSize / 2,
          boundingSize,
          boundingSize
        );
        context.stroke();
        context.closePath();
        context.restore();
      });
    });
  }
}
