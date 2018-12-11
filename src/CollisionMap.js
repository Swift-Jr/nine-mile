import SAT from "sat";

export class CollisionMap {
  constructor(args) {
    this.map = args.map;
    this.objects = args.objects;
  }

  moveTo(object, x, y) {
    let objectPolygon = object.getSATPolygon(x, y);

    let collisionDetected = this.objects
      .filter(
        possibleCollisionObject => object !== possibleCollisionObject
        //TODO: Add in filters to reduce collission objects
        /*possibleCollisionObject =>
          (possibleCollisionObject.onMap &&
            object !== possibleCollisionObject &&
            (possibleCollisionObject.currentLane === object.currentLane ||
              possibleCollisionObject.currentLane === object.nextLane ||
              possibleCollisionObject.nextLane === object.nextLane ||
              (possibleCollisionObject.currentLane.road.tile ===
                object.currentLane.road.tile &&
                possibleCollisionObject.currentLane.road !==
                  object.currentLane.road))) ||
          possibleCollisionObject.currentLane.road.tile ===
            object.nextLane.road.tile*/
      )
      .some(collisionObject => {
        return SAT.testPolygonPolygon(
          objectPolygon,
          collisionObject.SATPolygon
        );
      });

    if (!collisionDetected) {
      object.updatePosition(x, y, objectPolygon);
    }
  }

  moveTo_bounding(object, x, y) {
    let objectBounding = object.bounding(x, y);

    let collisionDetected = this.objects
      .filter(
        collisionObject => collisionObject.onMap && object !== collisionObject
      )
      .some(collisionObject => {
        let collisionBounding = collisionObject.bounding();

        if (
          objectBounding.x < collisionBounding.x + collisionBounding.width &&
          objectBounding.x + objectBounding.width > collisionBounding.x &&
          objectBounding.y < collisionBounding.y + collisionBounding.height &&
          objectBounding.height + objectBounding.y > collisionBounding.y
        ) {
          return true;
        }
        return false;
      });

    if (!collisionDetected) {
      object.updatePosition(x, y);
    }
  }
}
