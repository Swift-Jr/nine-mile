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

    console.log(this.laneJunctions);

    this.generateLaneMatrix2();
    //this.generateLaneMatrix("leftLane");
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

  //TODO: Repeat this until all entry roads have A lanes.
  //Then repeat for B lanes

  generateLaneMatrix2(currentLane, intersect) {
    if (!currentLane) {
      let entryRoad = this.randomEntryRoad();

      //Get left lane
      if (entryRoad.lanes[0].p0.x === 0) {
        //top
        currentLane =
          entryRoad.lanes[0].p0.x < entryRoad.lanes[1].p0.x
            ? entryRoad.lanes[0]
            : entryRoad.lanes[1];
        intersect = currentLane.p2;
      } else if (entryRoad.lanes[0].p0.y === 0) {
        //left
        currentLane =
          entryRoad.lanes[0].p0.y > entryRoad.lanes[1].p0.y
            ? entryRoad.lanes[0]
            : entryRoad.lanes[1];
        intersect = currentLane.p2;
      } else if (entryRoad.lanes[0].p2.y === this.height) {
        //bottom
        currentLane =
          entryRoad.lanes[0].p0.x < entryRoad.lanes[1].p0.x
            ? entryRoad.lanes[0]
            : entryRoad.lanes[1];
        intersect = currentLane.p0;
      } else if (entryRoad.lanes[0].p2.x === this.width) {
        //right
        currentLane =
          entryRoad.lanes[0].p0.y > entryRoad.lanes[1].p0.y
            ? entryRoad.lanes[0]
            : entryRoad.lanes[1];
        intersect = currentLane.p0;
      } else {
        debugger;
      }
    }
    currentLane = currentLane ? currentLane : this.randomEntryRoad().lanes[0];
    intersect = intersect ? intersect : currentLane.p2;

    currentLane.road.rightLane.push(currentLane);
    /*currentLane.road.lanes
      .filter(lane => lane != currentLane)
      .forEach(lane => currentLane.road.leftLane.push(lane));*/

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
        this.generateLaneMatrix2(nextLane, nextIntersect);
      });
  }

  generateLaneMatrix(direction, currentRoad, currentLane, junctionIntersect) {
    //console.log(this.ti++);
    //Pick a starting road
    currentRoad = currentRoad ? currentRoad : this.randomEntryRoad();

    //Get the current lane
    currentLane = currentLane
      ? currentLane
      : direction === "rightLane"
        ? currentRoad.lanes[0]
        : currentRoad.lanes[1];

    //Get a current lane intersect
    //laneIntersect = laneIntersect ? laneIntersect : currentRoad.lanes[0].p0;

    //Get the next junction
    junctionIntersect = junctionIntersect ? junctionIntersect : currentLane.p2; //TODO: Support for other edges -> x = 0, x/y = width/height

    //Add the lane direction to the road
    currentRoad[direction].push(currentLane);

    this.lastLaneGenerated = currentLane;

    //Recurse each road at the next junction
    if (
      this.laneJunctions[junctionIntersect.x][junctionIntersect.y].length > 2
    ) {
      debugger;
    }
    this.laneJunctions[junctionIntersect.x][junctionIntersect.y]
      .filter(lane => lane.road[direction].length === 0)
      .some(nextLane => {
        let nextJunctionIntersect =
          nextLane.p0.x === junctionIntersect.x &&
          nextLane.p0.y === junctionIntersect.y
            ? nextLane.p2
            : nextLane.p0;

        //TODO: Filter has to stop you going back on yourself
        //Maybe checking that nextJunctionIntersect is not behind us
        //if (this.lastLaneGenerated.road.tile === nextLane.road.tile) return;

        this.generateLaneMatrix(
          direction,
          nextLane.road,
          nextLane,
          nextJunctionIntersect
        );
        return true;
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

      /*if (
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
      }*/

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

        /*context.save();
        //context.strokeStyle = "green";
        context.rect(
          x - boundingSize / 2,
          y - boundingSize / 2,
          boundingSize,
          boundingSize
        );
        context.stroke();
        context.restore();*/
      });
    });
  }
}
