/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/prop-types */
import * as React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { verifySelector } from '../../state/modules/faceCapturing';

const landmarksPosition = [29, 36, 39, 42, 45, 48, 54];

const useStyles = makeStyles(() => createStyles({
  blur: {
    position: 'absolute',
    filter: 'blur(8px)',
  },
  landmarksContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  videoContainer: {
    width: 282,
    height: 282,
    position: 'relative',
    top: 22.5,
    borderRadius: '100%',
    '-webkit-mask-image':
      '-webkit-radial-gradient(circle, white 100%, black 100%)',
    '-webkit-border-radius': '100%',
    '-moz-border-radius': '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    zIndex: 1,
    objectFit: 'contain',
  },
  blurVideo: {
    position: 'absolute',
    zIndex: 1,
    objectFit: 'contain',
    filter: 'blur(8px)',
  },
}));

export default function LiveVideo({
  image,
  videoSrcObject = null,
  landmarks = [],
  isBlur = false,
}) {
  const classes = useStyles({});
  const canvasRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const { verifying, verifyingURL } = useSelector(verifySelector);

  React.useEffect(() => {
    if (videoSrcObject && videoRef.current) {
      videoRef.current.srcObject = videoSrcObject;
    }
  }, [videoSrcObject]);

  React.useEffect(() => {
    if (image) {
      const ctx = canvasRef.current.getContext('2d');
      if (isBlur) {
        ctx.drawImage(image, 110, 90, 374, 280, 0, 0, 374, 280);
      }
      if (landmarks && videoSrcObject) {
        ctx.clearRect(
          0,
          0,
          videoRef.current.offsetWidth,
          videoRef.current.height
        );
        // eslint-disable-next-line array-callback-return
        landmarks.map((point, index) => {
          if (landmarksPosition.includes(index)) {
            ctx.strokeStyle = 'white';
            ctx.strokeRect(
              point.x * videoRef.current.offsetWidth,
              point.y * videoRef.current.height,
              2,
              2
            );
          }
        });
      }
    }
  }, [image, landmarks, isBlur]);

  return (
    <div className={classes.videoContainer}>
      {(verifying && verifyingURL && verifyingURL[0])
        ? (
          <img
            src={verifyingURL}
            width={352}
            height={280}
            alt="face-verifying"
          />
        )
        : (
          <>
            <canvas
              ref={canvasRef}
              width={videoRef.current ? videoRef.current.offsetWidth : 374}
              height={280}
              className={isBlur ? classes.blur : classes.landmarksContainer}
            />
            {videoSrcObject ? (
              <video
                ref={videoRef}
                autoPlay
                height={280}
                className={classes.video}
              />
            ) : null}
          </>
        )}

    </div>
  );
}
