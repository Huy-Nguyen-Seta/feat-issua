export function getImageBlob(image) {
  return new Promise((resolve) => {
    image.toBlob((blob) => resolve(blob));
  });
}
