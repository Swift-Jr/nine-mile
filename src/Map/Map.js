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

  generateLaneMatrix(currentLane, intersect) {
    if (!currentLane) {
      let entryRoad = this.randomEntryRoad();

      //Get left lane
      if (entryRoad.lanes[0].p0.y === 0) {
        //top
        currentLane =
          entryRoad.lanes[0].p0.x < entryRoad.lanes[1].p0.x
            ? entryRoad.lanes[1]
            : entryRoad.lanes[0];
        intersect = currentLane.p2;
      } else if (entryRoad.lanes[0].p0.x === 0) {
        //left
        currentLane =
          entryRoad.lanes[0].p0.y > entryRoad.lanes[1].p0.y
            ? entryRoad.lanes[0]
            : entryRoad.lanes[1];
        intersect = currentLane.p2;
      } else if (entryRoad.lanes[0].p2.y === this.height) {
        //bottom
        currentLane =
          entryRoad.lanes[0].p2.x < entryRoad.lanes[1].p2.x
            ? entryRoad.lanes[0]
            : entryRoad.lanes[1];
        intersect = currentLane.p0;
      } else if (entryRoad.lanes[0].p2.x === this.width) {
        //right
        currentLane =
          entryRoad.lanes[0].p2.y > entryRoad.lanes[1].p2.y
            ? entryRoad.lanes[0]
            : entryRoad.lanes[1];
        intersect = currentLane.p0;
      }
    }

    //Direct the lane so intersect at p0
    if (currentLane.p0.x === intersect.x && currentLane.p0.y === intersect.y) {
      let newP2 = currentLane.p0;
      currentLane.p0 = currentLane.p2;
      currentLane.p2 = newP2;
    }
    currentLane.road.rightLane.push(currentLane);

    currentLane.road.lanes.filter(lane => lane != currentLane).forEach(lane => {
      if (lane.p2.x === intersect.x || lane.p2.y === intersect.y) {
        let newP2 = lane.p0;
        lane.p0 = lane.p2;
        lane.p2 = newP2;
      }

      currentLane.road.leftLane.push(lane);
    });

    this.laneJunctions[intersect.x][intersect.y]
      .filter(
        lane =>
          lane.road.tile != currentLane.road.tile &&
          lane.road.rightLane.length === 0
      )
      .forEach(nextLane => {
        let nextIntersect =
          intersect.x === nextLane.p0.x && intersect.y === nextLane.p0.y
            ? nextLane.p2
            : nextLane.p0;
        this.generateLaneMatrix(nextLane, nextIntersect);
      });
  }

  fixMissingLanes() {
    this.roads
      .filter(road => road.rightLane.length === 0 || road.leftLane.length === 0)
      .forEach(road => {
        road.lanes.forEach(lane => {
          let laneAtP0Intersect = this.laneJunctions[lane.p0.x][
            lane.p0.y
          ].filter(
            junctionLane =>
              junctionLane != lane && junctionLane.road.tile != lane.road.tile
          )[0];

          if (
            lane.p0.x === laneAtP0Intersect.p0.x &&
            lane.p0.y === laneAtP0Intersect.p0.y
          ) {
            let newP2 = lane.p0;
            lane.p0 = lane.p2;
            lane.p2 = newP2;
          }

          if (
            laneAtP0Intersect.road.leftLane.filter(
              roadLane => roadLane === laneAtP0Intersect
            ).length === 1
          ) {
            lane.road.leftLane.push(lane);
          } else {
            lane.road.rightLane.push(lane);
          }
        });
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
