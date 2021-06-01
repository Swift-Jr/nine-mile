import React, {Component} from "react";
import {Map} from "./Map";
import {Vehicle} from "./Vehicle";
import {CollisionMap} from "./CollisionMap";
import {randomNumBetween} from "./utils";
import GameConfig from './Config';

import RequestAnimationFrame from './RequestAnimationFrame';

import Konva from "konva";
import {Stage, Layer, Rect, Animation} from 'react-konva';

const OBJECT_TYPE = {
  'VEHICLE': 1
}

const level1tilemap = [
  /*[
    0, 0, 1, 0, 0
  ],
  [
    0, 0, 1, 0, 0
  ],
  [
    0, 0, 11, 12, 0
  ],
  [
    0, 0, 0, 1, 0
  ],
  [0, 0, 0, 1, 0]
  /*
  [
    1, 11, 23, 2, 2
  ],
  [
    1, 0, 1, 0, 0
  ],
  [
    22, 23, 24, 13, 12
  ],
  [
    22, 21, 21, 10, 1
  ],
  [
    11, 23, 23, 2, 10
  ],
  [
    13, 10, 1, 0, 0
  ],
  [1, 13, 10, 0, 0]
  */
  /*
  [
    11,
    12,
    13,
    2,
    23,
    2
  ],
  [
    13, 10, 1, 0, 1
  ],
  [
    11,
    2,
    20,
    2,
    20,
    2
  ]*/
  [
    1, 11, 23, 2, 2
  ],
  [
    1, 0, 1, 0, 0
  ],
  [
    22, 2, 24, 13, 12
  ],
  [
    1, 0, 11, 10, 1
  ],
  [
    11, 23, 2, 23, 10
  ],
  [
    13, 10, 0, 1, 0
  ],
  [
    1, 0, 13, 10, 0
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
    currentMap: new Map([
      [1]
    ]),
    objects: {
      [OBJECT_TYPE.VEHICLE]: []
    }
  };

  vehiclesCount = 0;
  pendingVehiclesCount = 0;

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

  componentWillUnmount() {
    this
      .konvaAnimation
      .stop();
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
    RequestAnimationFrame(() => {
      this.updateGame()
    });
  }

  startGame = () => {
    this.setState({currentMap: new Map(level1tilemap)});

    this.vehicleCollisionMap = new CollisionMap({
      map: this.state.currentMap,
      objects: this
        .state
        .objects[OBJECT_TYPE.VEHICLE]
    });

    this.konvaAnimation = new Konva.Animation((frame) => {
      let vehicles = this
        .state
        .objects[OBJECT_TYPE.VEHICLE];

      vehicles.forEach(vehicle => vehicle.updateKonva());
    }, this.vehicleLayer);

    this
      .konvaAnimation
      .start();
  }

  updateGame = () => {
    const {context} = this.state;

    context.save();
    context.clearRect(0, 0, this.state.screen.width, this.state.screen.height);

    context.fillStyle = '#000';
    context.globalAlpha = 0.4;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

    //TODO: Map could live on a separate canvas that only get redrawn on resize
    this
      .state
      .currentMap
      .render(context);
    //this.drawMap(level1tilemap);
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    if (!this.maximumVehiclesReached()) {
      this.createVehicle();
    }

    this.updateObjects(OBJECT_TYPE.VEHICLE);

    context.restore();
    this.animate();
  }

  maximumVehiclesReached() {
    const {vehiclesCount, pendingVehiclesCount} = this;

    return (vehiclesCount + pendingVehiclesCount) >= GameConfig.MAX_VEHICLES;
  }

  createVehicle = () => {
    this.pendingVehiclesCount++;

    setTimeout(() => {
      this.generateVehicle()
    }, randomNumBetween(1, 3) * 1000)
  }

  generateVehicle = () => {
    let vehicle = new Vehicle({
      currentMap: this.state.currentMap,
      collisionMap: this.vehicleCollisionMap,
      create: object => {
        this.createObject(object, OBJECT_TYPE.VEHICLE)
      }
    });
    this.createObject(vehicle, OBJECT_TYPE.VEHICLE);

    this.vehiclesCount++;
    this.pendingVehiclesCount--;
  }

  createObject = (object, type) => {
    let objects = this
      .state
      .objects[type];
    objects.push(object);

    this.setState({
      objects: {
        ...this.state.objects,
        type: objects
      }
    });
  }

  updateObjects = (type) => {
    let index = 0;
    let objects = this
      .state
      .objects[type];

    objects.forEach((object, index) => {
      if (object.delete) {
        this.setState({
          objects: {
            ...this.state.objects,
            type: objects.splice(index, 1)
          }
        });
        this.vehiclesCount--;
      } else {
        object.render(this.state);
      }
    });
  }

  render() {
    let vehicles = this
      .state
      .objects[OBJECT_TYPE.VEHICLE];

    let konvaVehicles = vehicles.map(vehicle => vehicle.renderKonva())

    /*<Layer listening={false} name="vehicles"></Layer>
    <Layer listening={false} name="lights"></Layer>*/
    return (<div>
      <canvas className="old" ref="canvas" width={(this.state.screen.width * this.state.screen.ratio) / 2} height={this.state.screen.height * this.state.screen.ratio}/>
      <Stage name="game" width={(this.state.screen.width * this.state.screen.ratio) / 2} height={this.state.screen.height * this.state.screen.ratio}>
        <Layer listening={false} name="background">
          <Rect width={(this.state.screen.width * this.state.screen.ratio) / 2} height={this.state.screen.height * this.state.screen.ratio} fill="#000000"></Rect>
        </Layer>

        {
          this
            .state
            .currentMap
            .renderKonva()
        }
        <Layer listening={false} name="vehicles" ref={node => this.vehicleLayer = node}>
          {konvaVehicles}
        </Layer>
      </Stage>
    </div>);
  }
}

export default App;
