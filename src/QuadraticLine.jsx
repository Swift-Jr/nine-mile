import React from "react";
import {Shape} from "react-konva";

export const QuadraticLine = props => {
  const {start, control, end} = props;

  const draw = (context, shape) => {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.quadraticCurveTo(control.x, control.y, end.x, end.y);
    context.fillStrokeShape(shape);
  }

  return <Shape {...props} sceneFunc={draw}/>;
}
