export function isValidPose(poseLandmarks) {
  let validChecks = 0;
  const faceLandmarks = ["nose", "leftEye", "rightEye"];
  for (let landmark of poseLandmarks) {
    if (faceLandmarks.includes(landmark.type)) {
      if (landmark.confidence > 0.9) {
        validChecks++;
      } else {
        return false; // Exit early if any of the landmarks are low confidence
      }
    }
  }
  return validChecks >= 3;
}

export function handleFaceLandmarks(faceLandmarks) {
  if (faceLandmarks) {
    // console.log(faceLandmarks);
    const leftEye = faceLandmarks.find(item => item.type === "leftEye");
    const rightEye = faceLandmarks.find(item => item.type === "rightEye");
    const jawOutline = faceLandmarks.find(item => item.type === "jawOutline");
    const nose = faceLandmarks.find(item => item.type === "nose");

    // console.log(nose.locationPoly[0].x, leftEye.locationPoly[0].x, rightEye.locationPoly[3].x)
    // console.log((nose.locationPoly[0].x - leftEye.locationPoly[0].x))
    // console.log((rightEye.locationPoly[3].x - nose.locationPoly[0].x))
    // console.log(
    //   nose.locationPoly[0].x -
    //     leftEye.locationPoly[0].x -
    //     (rightEye.locationPoly[3].x - nose.locationPoly[0].x)
    // );

    if (
      nose.locationPoly[0].x -
      leftEye.locationPoly[0].x -
      (rightEye.locationPoly[3].x - nose.locationPoly[0].x) <
      -0.02
    ) {
      // console.log("Face looking too far to the right");
      return "farright";
    } else if (
      nose.locationPoly[0].x -
      leftEye.locationPoly[0].x -
      (rightEye.locationPoly[3].x - nose.locationPoly[0].x) <
      -0.01
    ) {
      // console.log("Face looking too far to the right");
      return "right";
    } else if (
      nose.locationPoly[0].x -
      leftEye.locationPoly[0].x -
      (rightEye.locationPoly[3].x - nose.locationPoly[0].x) >
      0.02
    ) {
      // console.log("Face looking too far to the left");
      return "farleft";
    } else if (
      nose.locationPoly[0].x -
      leftEye.locationPoly[0].x -
      (rightEye.locationPoly[3].x - nose.locationPoly[0].x) >
      0.01
    ) {
      // console.log("Face looking too far to the left");
      return "left";
    } else {
      return "center";
    }
  } else {
    return "empty";
  }
}

export function stringTokensCompare(str1tokens, str2tokens) {
  str1tokens = str1tokens.toLowerCase().split(" ");
  str2tokens = str2tokens.toLowerCase().split(" ");
  /* Test to see if all the str1 tokens are matched by str2 tokens */
  let i, j;
  let str1matches = 0;
  let token1, token2;
  for (i = 0; i < str1tokens.length; i++) {
    token1 = str1tokens[i];
    for (j = 0; j < str2tokens.length; j++) {
      token2 = str2tokens[j];
      if (token1 === token2) {
        str1matches++;
      }
    }
  }
  return str1matches / str1tokens.length;
}

export const delay = (timeOut = 1000) =>
  new Promise(resolve => setTimeout(resolve, timeOut));

export function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
