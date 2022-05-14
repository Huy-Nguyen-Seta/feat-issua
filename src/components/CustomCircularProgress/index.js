/* eslint-disable react/prop-types */
import * as React from 'react';
import Two from 'two.js';
import { calculatePosition } from '../../utils';

const WIDTH = 325;
const HEIGHT = 325;
const RADIUS = 150;
const numberOfDots = 300;

export default function CircularProgress({
  progress,
  color,
  className = 'any',
  isStatic = true,
  multipleColor = false,
  twoSideProgress = false
}) {
  const twoRef = React.useRef();
  const containerRef = React.useRef();

  React.useEffect(() => {
    twoRef.current = new Two({
      type: Two.Types.canvas,
      width: WIDTH,
      height: HEIGHT
    }).appendTo(containerRef.current);
  }, []);

  React.useEffect(() => {
    if (progress && progress === 1) {
      twoRef.current.clear();
    }

    if (progress && progress <= 100 && !isStatic && !twoSideProgress) {
      for (let i = (progress - 0.5) * 3; i < (progress - 0.5) * 3 + 3; i += 1) {
        const alpha = ((2 * Math.PI) / numberOfDots) * (numberOfDots - i) - Math.PI;
        const x = WIDTH / 2;
        const y = HEIGHT / 2;
        const radius = RADIUS;
        let value = 10;
        if (multipleColor && progress > 12 && progress < 38) {
          value = 5;
        }
        const line = twoRef.current.makeLine(
          ...calculatePosition({
            x, y, radius, alpha, value
          })
        );
        if (multipleColor && progress > 87) {
          line.stroke = '#D0021B';
        } else {
          line.stroke = color;
        }
        line.linewidth = 2;
        twoRef.current.update();
      }
    }

    if (progress && progress <= 100 && !isStatic && twoSideProgress) {
      for (
        let i = (progress - 1.5) * 1.5;
        i < (progress - 1.5) * 1.5 + 1.5;
        i += 1
      ) {
        const alpha = ((2 * Math.PI) / numberOfDots) * (numberOfDots - i) - Math.PI;
        const x = WIDTH / 2;
        const y = HEIGHT / 2;
        const radius = RADIUS;
        const line = twoRef.current.makeLine(
          ...calculatePosition({
            x, y, radius, alpha, value: 10
          })
        );
        line.stroke = color;
        line.linewidth = 2;
        twoRef.current.update();
      }

      for (let i = 300 - progress * 1.5; i > 300 - progress * 1.5 - 1.5; i -= 1) {
        const alpha = ((2 * Math.PI) / numberOfDots) * (numberOfDots - i) - Math.PI;
        const x = WIDTH / 2;
        const y = HEIGHT / 2;
        const radius = RADIUS;
        const line = twoRef.current.makeLine(
          ...calculatePosition({
            x, y, radius, alpha, value: 10
          })
        );
        line.stroke = color;
        line.linewidth = 2;
        twoRef.current.update();
      }
    }

    if (progress && progress <= 100 && isStatic) {
      for (let i = 0; i < numberOfDots; i += 1) {
        const alpha = ((2 * Math.PI) / numberOfDots) * (numberOfDots - i) - Math.PI;
        const x = WIDTH / 2;
        const y = HEIGHT / 2;
        const radius = RADIUS;
        const line = twoRef.current.makeLine(
          ...calculatePosition({
            x, y, radius, alpha, value: 10
          })
        );
        line.stroke = color;
        line.linewidth = 2;
        twoRef.current.update();
      }
    }
  }, [progress, color]);
  return <div ref={containerRef} className={className} />;
}
