/* eslint-disable react/prop-types */
import * as React from 'react';
import Two from 'two.js';
import { calculatePosition } from '../../utils';

const WIDTH = 325;
const HEIGHT = 325;
const RADIUS = 139;
const numberOfDots = 100;

export default function ActivityHud({ color, className = 'any' }) {
  const twoRef = React.useRef();
  const containerRef = React.useRef();

  React.useEffect(() => {
    twoRef.current = new Two({
      type: Two.Types.canvas,
      width: WIDTH,
      height: HEIGHT
    }).appendTo(containerRef.current);

    for (let i = 0; i < numberOfDots; i += 1) {
      const alpha = ((2 * Math.PI) / numberOfDots) * (numberOfDots - i) - Math.PI;
      const x = WIDTH / 2;
      const y = HEIGHT / 2;
      const radius = RADIUS;
      const line = twoRef.current.makeLine(
        ...calculatePosition({
          x, y, radius, alpha, value: 4
        })
      );
      line.stroke = color;
      line.linewidth = 4;
      twoRef.current.update();
    }
  }, [color]);

  return <div ref={containerRef} className={className} />;
}
