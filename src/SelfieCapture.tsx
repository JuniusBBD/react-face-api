import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const FRAME_WIDTH = 320;
const FRAME_HEIGHT = 400;
const MIN_FACE_SIZE_RATIO = 0.3;
const MAX_FACE_SIZE_RATIO = 0.5;

type SelfieCaptureProps = {
  isCameraOpen: boolean;
  onCapture: (image: string) => void;
  setScreenshot: (image: string | null) => void;
  screenshot: string | null;
};

export const SelfieCapture = ({screenshot, setScreenshot,...props}: SelfieCaptureProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [borderColor, setBorderColor] = useState('border-red-500');
  const [isFaceWithinFrame, setIsFaceWithinFrame] = useState(false);
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    };

    loadModels();
    const interval = setInterval(() => {
      detectFace();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const detectFace = async () => {
    if (webcamRef.current && webcamRef.current.video?.readyState === 4) {
      const video = webcamRef.current.video;
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (detections.length > 0) {
        const face = detections[0];
        const landmarks = face.landmarks;
        const nose = landmarks.getNose();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        const noseCenter = nose[3];
        const leftEyeCenter = leftEye[0];
        const rightEyeCenter = rightEye[3];

        const noseX = noseCenter.x;
        const leftEyeX = leftEyeCenter.x;
        const rightEyeX = rightEyeCenter.x;

        const faceWidth = Math.abs(rightEyeX - leftEyeX);
        const threshold = faceWidth * 0.9;

        const isLookingForward =
          Math.abs(leftEyeX - noseX) < threshold &&
          Math.abs(rightEyeX - noseX) < threshold;

        // Calculate face size
        const faceSize = face.detection.box.width * face.detection.box.height;
        const frameSize = FRAME_WIDTH * FRAME_HEIGHT;

        const faceSizeRatio = faceSize / frameSize;
        const isTooClose = faceSizeRatio > MAX_FACE_SIZE_RATIO;
        const isTooFar = faceSizeRatio < MIN_FACE_SIZE_RATIO;
        const isDistanceCorrect = !isTooClose && !isTooFar;

        if (isLookingForward && isDistanceCorrect) {
          setBorderColor('border-green-500');
          setIsFaceWithinFrame(true);
        } else if (isLookingForward && !isDistanceCorrect) {
          setBorderColor('border-yellow-500'); // Yellow for incorrect distance
          setIsFaceWithinFrame(false);
        } else {
          setBorderColor('border-red-500');
          setIsFaceWithinFrame(false);
        }
      } else {
        setBorderColor('border-red-500');
        setIsFaceWithinFrame(false);
      }
    }
  };

  const captureScreenshot = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        cropToOval(screenshot);
        props.onCapture(screenshot);
      }
    }
  };

  const cropToOval = (imageSrc: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      const ovalWidth = 300;
      const ovalHeight = 400;

      canvas.width = ovalWidth;
      canvas.height = ovalHeight;

      if (ctx) {
        // Draw the image with cover effect
        const aspectRatio = img.width / img.height;
        let drawWidth = ovalWidth;
        let drawHeight = ovalWidth / aspectRatio;

        if (drawHeight < ovalHeight) {
          drawHeight = ovalHeight;
          drawWidth = ovalHeight * aspectRatio;
        }

        const offsetX = (ovalWidth - drawWidth) / 2;
        const offsetY = (ovalHeight - drawHeight) / 2;

        ctx.clearRect(0, 0, ovalWidth, ovalHeight); // Clear the canvas
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.ellipse(
          ovalWidth / 2,
          ovalHeight / 2,
          ovalWidth / 2,
          ovalHeight / 2,
          0,
          0,
          2 * Math.PI
        );
        ctx.fill();

        const croppedImage = canvas.toDataURL('image/png'); // Save as PNG to support transparency
        setScreenshot(croppedImage);
      }
    };
  };

  return (
    <div className='flex flex-col items-center p-5'>
      <div className='w-80'>
        {screenshot && (
          <div className='relative w-[300px] h-[400px] rounded-[50%] overflow-hidden mb-5'>
            <div className='mt-5'>
              <img src={screenshot} alt='Screenshot' />
            </div>
          </div>
        )}
        {props.isCameraOpen && !screenshot && (
          <div className='relative w-[300px] h-[400px] rounded-[50%] overflow-hidden mb-5'>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat='image/png'
              width={300}
              height={400}
              className='object-cover w-full h-full transform scale-x-[-1] rounded-full'
            />
            <div
              className={`absolute top-0 left-0 w-full h-full rounded-[50%] border-8 ${borderColor}`}
            ></div>
          </div>
        )}
        {(props.isCameraOpen || screenshot) && <div className=' w-80 text-center space-y-2'>
          <p className='text-2xl font-bold'>
            {screenshot ? 'Is it clear enough?' : 'Take a selfie'}
          </p>
          <p className='text-sm text-gray-500'>
            {screenshot
              ? 'Make sure your face is clear, well lit and that you have removed your glasses'
              : 'Remove hats and glasses. Place your face in the oval. Take picture when the frame turns green.'}
          </p>
          {!screenshot && <button
            onClick={() => isFaceWithinFrame && captureScreenshot()}
            className={`border-[1px]  ${
              isFaceWithinFrame
                ? 'bg-green-500 border-green-500'
                : 'bg-black border-black'
            } w-[90px] h-[90px] rounded-full`}
          >
            <div className='border-2 w-full h-full rounded-full' />
          </button>}
        </div>}
      </div>
    </div>
  );
};
