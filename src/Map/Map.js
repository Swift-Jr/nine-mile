import {Tile, TILE_WIDTH, TILE_HEIGHT} from "../Tile";
import {randomNumBetween} from "../utils";

export class Map {
  constructor(tileMap) {
    this.tiles = [];
    this.edgeTiles = [];
    this.edgeRoads = [];
    this.width = tileMap[0].length * TILE_WIDTH;
    this.height = tileMap.length * TILE_HEIGHT;

    this.roads = [];
    this.junctions = [];

    this.load(tileMap);
  }

  load(tileMap) {
    let cX = 0,
      cY = 0,
      pY = 0,
      pX = 0;

    tileMap.forEach(row => {
      row.forEach(tileType => {
        let tile = new Tile(tileType);
        tile.position(cX, cY);
        this.addRoadsToMap(tile.getRoads());

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

  addRoadsToMap(roads) {
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

      return road;
    });

    this.roads = this.roads.concat(roadsWithJunctions);
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
        context.strokeStyle = "green";
        context.rect(
          x - boundingSize / 2,
          y - boundingSize / 2,
          boundingSize,
          boundingSize
        );
        context.stroke();
      });
    });
  }
}
