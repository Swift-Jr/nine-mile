export class CollisionMap {
  constructor(args) {
    this.map = args.map;
    this.objects = args.objects;
  }

  moveTo(object, x, y) {
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
