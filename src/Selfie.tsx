import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';

// Constants for frame dimensions and thresholds
const FRAME_WIDTH = 320;
const FRAME_HEIGHT = 320;
const MIN_FACE_SIZE_RATIO = 0.3;
const MAX_FACE_SIZE_RATIO = 0.5;

export function Selfie() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [isTooClose, setIsTooClose] = useState(false);
  const [isTooFar, setIsTooFar] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image onto the canvas
        ctx?.drawImage(img, 0, 0);

        // Calculate the frame's dimensions and position
        const frameWidth = img.width * 0.6;
        const frameHeight = img.height * 0.6;
        const frameX = (img.width - frameWidth) / 2;
        const frameY = (img.height - frameHeight) / 2;

        // Crop the image to the frame
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = frameWidth;
        croppedCanvas.height = frameHeight;
        const croppedCtx = croppedCanvas.getContext('2d');

        croppedCtx?.drawImage(
          canvas,
          frameX,
          frameY,
          frameWidth,
          frameHeight,
          0,
          0,
          frameWidth,
          frameHeight
        );

        // Update the state with the cropped image
        setImgSrc(croppedCanvas.toDataURL('image/jpeg'));
      };
      img.src = imageSrc;
    }
  }, [webcamRef, setImgSrc]);

  useEffect(() => {
    // Load face-api.js models
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ]).then(startFaceDetection);
  }, []);

  const startFaceDetection = () => {
    setInterval(() => {
      detectFace();
    }, 1000);
  };

  const detectFace = async () => {
    if (webcamRef.current && webcamRef.current.video) {
      const video = webcamRef.current.video;
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      if (detections.length > 0) {
        console.log('Face detected');

        const face = detections[0];
        const landmarks = face.landmarks;

        const frameWidth = FRAME_WIDTH;
        const frameHeight = FRAME_HEIGHT;
        const frameX = (video.offsetWidth - frameWidth) / 2;
        const frameY = (video.offsetHeight - frameHeight) / 2;

        const isLeftEyeWithinFrame = isPointInsideFrame(
          landmarks.getLeftEye()[0],
          frameX,
          frameY,
          frameWidth,
          frameHeight
        );
        const isRightEyeWithinFrame = isPointInsideFrame(
          landmarks.getRightEye()[0],
          frameX,
          frameY,
          frameWidth,
          frameHeight
        );
        const isNoseWithinFrame = isPointInsideFrame(
          landmarks.getNose()[0],
          frameX,
          frameY,
          frameWidth,
          frameHeight
        );

        if (
          isLeftEyeWithinFrame &&
          isRightEyeWithinFrame &&
          isNoseWithinFrame
        ) {
          setIsFaceDetected(true);
        } else {
          setIsFaceDetected(false);
        }

        const faceSize = face.detection.box.width * face.detection.box.height;
        const frameSize = FRAME_WIDTH * FRAME_HEIGHT;

        const faceSizeRatio = faceSize / frameSize;

        if (faceSizeRatio < MIN_FACE_SIZE_RATIO) {
          setIsTooClose(false);
          setIsTooFar(true);
        } else if (faceSizeRatio > MAX_FACE_SIZE_RATIO) {
          setIsTooFar(false);
          setIsTooClose(true);
        } else {
          setIsTooClose(false);
          setIsTooFar(false);
        }
      } else {
        setIsFaceDetected(false);
        setIsTooClose(false);
        setIsTooFar(false);
        console.log('No face detected');
      }
    }
  };

  const isPointInsideFrame = (
    point: faceapi.Point,
    frameLeft: number,
    frameTop: number,
    frameWidth: number,
    frameHeight: number
  ) => {
    const pointX = point.x;
    const pointY = point.y;
    return (
      pointX >= frameLeft &&
      pointX <= frameLeft + frameWidth &&
      pointY >= frameTop &&
      pointY <= frameTop + frameHeight
    );
  };

  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '640px',
          margin: 'auto',
        }}
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat='image/jpeg'
          style={{ width: '100%', height: 'auto', transform: 'scaleX(-1)' }} // Added transform property here
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            height: `${FRAME_HEIGHT}px`, // Adjust based on your requirements
            width: `${FRAME_WIDTH}px`, // Maintain the aspect ratio
            transform: 'translate(-50%, -50%)',
            boxSizing: 'border-box',
          }}
        >
          {/* Corner divs */}
          <div
            style={{
              position: 'absolute',
              top: -10,
              left: -10,
              borderLeft: '2px solid red',
              borderTop: '2px solid red',
              height: '20px',
              width: '20px',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              borderRight: '2px solid red',
              borderTop: '2px solid red',
              height: '20px',
              width: '20px',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              bottom: -10,
              left: -10,
              borderLeft: '2px solid red',
              borderBottom: '2px solid red',
              height: '20px',
              width: '20px',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              bottom: -50,
              left: -10,
              textAlign: 'left',
              width: '100%',
            }}
          >
            {isFaceDetected && (
              <>
                {isTooClose && <p>You're too close!</p>}
                {isTooFar && <p>You're too far!</p>}
                {!isTooClose && !isTooFar && <p>Hold still...</p>}
              </>
            )}
            {!isFaceDetected && <p>Face not detected</p>}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: -10,
              right: -10,
              borderRight: '2px solid red',
              borderBottom: '2px solid red',
              height: '20px',
              width: '20px',
            }}
          ></div>
        </div>
      </div>

      <button
        onClick={capture}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        Capture photo
      </button>
      {imgSrc && (
        <img
          src={imgSrc}
          alt='Captured'
          style={{
            display: 'block',
            marginTop: '20px',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      )}
    </>
  );
}
