/* eslint-disable react/prop-types */
import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import CircularProgress from '../CustomCircularProgress';
import ActivityHud from './activityHud';
import ThirdDots from './thirdDots';
import LiveVideo from './liveVideo';

import useStyles from './styles';

export default function VeritoneMirror({
  faceLandmarks,
  progress,
  snapshot,
  videoSrcObject,
  // isActivated,
  logMode,
  key
}) {
  const theme = useTheme();
  const classes = useStyles(theme);
  const [landMarks, setLandmarks] = React.useState([]);
  // const [isBlur, setIsBlur] = React.useState(false);

  React.useEffect(() => {
    if (faceLandmarks.length > 0) {
      const faceLandmarksMap = faceLandmarks.reduce(
        (c, p) => ({
          ...c,
          [p.type]: p.locationPoly,
        }),
        {}
      );
      setLandmarks([
        ...faceLandmarksMap.jawOutline,
        ...faceLandmarksMap.leftEyeBrow,
        ...faceLandmarksMap.rightEyeBrow,
        ...faceLandmarksMap.nose,
        ...faceLandmarksMap.leftEye,
        ...faceLandmarksMap.rightEye,
        ...faceLandmarksMap.mouth,
      ]);
    }
  }, [faceLandmarks]);

  // React.useEffect(() => {
  //   if (isActivated) {
  //     setIsBlur(false);
  //   }
  // }, [isActivated]);

  return (
    <>
      <Box className={classes.circleContainer}>
        <div className={classes.emojiController}>
          <ThirdDots color="#fff" className={classes.progressBar} />
          <ActivityHud color="orange" className={classes.progressBar} />
          <LiveVideo
            image={snapshot}
            videoSrcObject={videoSrcObject}
            landmarks={landMarks}
            logMode={logMode}
            key={key}
          />
        </div>
        <CircularProgress
          progress={progress}
          color="#00ADE7"
          className={classes.progressBar}
          isStatic={false}
          multipleColor
        />
      </Box>
    </>
  );
}
