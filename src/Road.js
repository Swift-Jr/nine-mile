import {QuadraticCurve, Point} from "../QuadraticCurve";

class Road extends QuadraticCurve {
  getPointAtDistance(distance, inverted = false) {
    if (inverted == true) {
    }
    super.getPointAtDistance(distance, inverted);
  }
}
