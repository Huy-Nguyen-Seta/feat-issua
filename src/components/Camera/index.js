import React, { useState, useRef } from 'react';
import { func, bool, arrayOf } from 'prop-types';
import Measure from 'react-measure';
import { makeStyles } from '@material-ui/core/styles';
import { Button, CircularProgress } from '@material-ui/core';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';

import { useUserMedia } from '../../hooks/user-media';
import { useCardRatio } from '../../hooks/use-card-ratio';
import { useOffsets } from '../../hooks/user-offsets';

import { styles } from './styles';

const CAPTURE_OPTIONS = {
  audio: false,
  video: { facingMode: 'environment' }
};

const useStyles = makeStyles({
  ...styles
});

export function Camera({
  faces, setFaces, loading, setLoading, handleSubmitImages
}) {
  const classes = useStyles();

  const canvasRef = useRef();
  const videoRef = useRef();

  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const mediaStream = useUserMedia(CAPTURE_OPTIONS);
  const [aspectRatio, calculateRatio] = useCardRatio(1.586);
  const offsets = useOffsets(
    videoRef.current && videoRef.current.videoWidth,
    videoRef.current && videoRef.current.videoHeight,
    container.width,
    container.height
  );

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  function handleResize(contentRect) {
    setContainer({
      width: contentRect.bounds.width,
      height: Math.round(contentRect.bounds.width / aspectRatio)
    });
  }

  function handleCanPlay() {
    calculateRatio(videoRef.current.videoHeight, videoRef.current.videoWidth);
    setIsVideoPlaying(true);
    videoRef.current.play();
  }

  function handleCapture() {
    setLoading(true);
    const context = canvasRef.current.getContext('2d');

    context.drawImage(
      videoRef.current,
      offsets.x,
      offsets.y,
      container.width,
      container.height,
      0,
      0,
      container.width,
      container.height
    );

    canvasRef.current.toBlob(
      (blob) => setFaces((face) => [...face, blob]),
      'image/jpeg',
      1
    );

    setLoading(false);
  }

  if (!mediaStream) {
    return null;
  }

  return (
    <Measure bounds onResize={handleResize}>
      {({ measureRef }) => (
        <div>
          <div
            ref={measureRef}
            style={{
              height: `${container.height}px`,
            }}
            className={classes.container}
          >
            <video
              ref={videoRef}
              hidden={!isVideoPlaying}
              onCanPlay={handleCanPlay}
              autoPlay
              playsInline
              muted
              className={classes.video}
            />

            <div className={classes.overlay} hidden={!isVideoPlaying} />

            <canvas
              className={styles.canvas}
              ref={canvasRef}
              width={container.width}
              height={container.height}
            />

            <div
              flash={isFlashing}
              onAnimationEnd={() => setIsFlashing(false)}
            />
          </div>

          {isVideoPlaying && (
            <div className={classes.buttonContainer}>
              {faces.length < 5 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCapture}
                  disabled={loading}
                >
                  {loading
                    ? (
                      <CircularProgress
                        size={20}
                        color="#fff"
                      />
                    )
                    : <PhotoCameraIcon /> }
                </Button>
              )
                : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitImages}
                    disabled={loading}
                    style={{ display: faces.length === 5 ? '' : 'none' }}
                    startIcon={(
                      <>
                        {loading && (
                        <CircularProgress
                          size={20}
                          color="#fff"
                        />
                        )}
                      </>
                )}
                  >
                    Submit
                  </Button>
                )}
            </div>
          )}
        </div>
      )}
    </Measure>
  );
}

Camera.propTypes = {
  faces: arrayOf(),
  setFaces: func,
  loading: bool,
  setLoading: func,
  handleSubmitImages: func
};

Camera.defaultProps = {
  faces: [],
  setFaces: () => {},
  loading: false,
  setLoading: () => {},
  handleSubmitImages: () => {}
};
