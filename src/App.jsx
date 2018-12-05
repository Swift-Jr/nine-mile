import
React, {Component} from "react";
import {Map} from "./Map";
import {Vehicle} from "./Vehicle";
import {CollisionMap} from "./CollisionMap";

const OBJECT_TYPE = {
  'VEHICLE': 1
}

const level1tilemap = [
  [
    0, 13, 23, 2, 2
  ],
  [
    1, 1, 1, 0, 0
  ],
  [
    22, 21, 24, 13, 12
  ],
  [
    1, 0, 11, 10, 1
  ],
  [
    11, 2, 23, 2, 10
  ],
  [
    0, 0, 0, 0, 0
  ]
];

class App extends Component {
  state = {
    context: null,
    screen: {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio || 1
    },
    vehiclesCount: 0
  };

  objects = {
    [OBJECT_TYPE.VEHICLE]: []
  };

  currentMap = [];

  componentDidMount = () => {
    window.addEventListener('resize', this.handleResize.bind(this, false));

    this.handleResize();

    this.setState({
      context: this
        .refs
        .canvas
        .getContext("2d")
    }, () => {
      this.startGame();
      this.animate();
    });
  }

  handleResize = (value, e) => {
    this.setState({
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: (window.devicePixelRatio / 2) || 1
      }
    });
  }

  animate = () => {
    requestAnimationFrame(() => {
      this.updateGame()
    });
  }

  startGame = () => {
    this.currentMap = new Map(level1tilemap);
    this.vehicleCollisionMap = new CollisionMap({
      map: this.currentMap,
      objects: this.objects[OBJECT_TYPE.VEHICLE]
    });
  }

  updateGame = () => {
    const {context} = this.state;
    const vehicles = this.objects[OBJECT_TYPE.VEHICLE];

    context.save();
    context.clearRect(0, 0, this.state.screen.width, this.state.screen.height);

    context.fillStyle = '#000';
    context.globalAlpha = 0.4;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

    //TODO: Map could live on a separate canvas that only get redrawn on resize
    this
      .currentMap
      .render(context);
    //this.drawMap(level1tilemap);
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    //TODO: Read max values from a config?
    if (!vehicles.length || vehicles.length < 1) {
      let count = vehicles.length + 1;
      this.setState({vehiclesCount: count});
      this.generateVehicle(count)
    }

    this.updateObjects(OBJECT_TYPE.VEHICLE);

    context.restore();
    this.animate();
  }

  generateVehicle = (howMany) => {
    for (let i = 0; i < howMany; i++) {
      let vehicle = new Vehicle({
        currentMap: this.currentMap,
        collisionMap: this.vehicleCollisionMap,
        create: object => {
          this.createObject(object, OBJECT_TYPE.VEHICLE)
        },
        //addScore: this.addScore
      });
      this.createObject(vehicle, OBJECT_TYPE.VEHICLE);
    }
  }

  createObject = (object, type) => {
    this
      .objects[type]
      .push(object);
  }

  updateObjects = (type) => {
    let index = 0;
    let objects = this.objects[type];

    for (let object of objects) {
      if (object.delete) {
        this
          .objects[type]
          .splice(index, 1);
      } else {
        objects[index].render(this.state);
      }
      index++;
    }
  }

  render() {
    return (<div>
      <canvas ref="canvas" width={this.state.screen.width * this.state.screen.ratio} height={this.state.screen.height * this.state.screen.ratio}/>
    </div>);
  }
}

export default App;
