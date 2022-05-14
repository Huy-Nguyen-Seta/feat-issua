import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { showNotification } from '../state/modules/notification/actions';

export function useUserMedia(requestedMedia) {
  const [mediaStream, setMediaStream] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    async function enableVideoStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          requestedMedia
        );
        setMediaStream(stream);
      } catch (err) {
        dispatch(
          showNotification('failed', 'Please connect to a camera', true)
        );
      }
    }

    if (!mediaStream) {
      enableVideoStream();
    } else {
      return function cleanup() {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      };
    }
  }, [mediaStream, requestedMedia]);

  return mediaStream;
}
