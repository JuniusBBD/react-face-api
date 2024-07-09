import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

export const SelfieCapture = () => {
  const webcamRef = useRef<Webcam>(null);
  const [borderColor, setBorderColor] = useState('border-red-500');
  const [screenshot, setScreenshot] = useState<string | null>(null);

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

    const detectGlasses = (faceLandmarks: faceapi.FaceLandmarks68) => {
      const leftEye = faceLandmarks.getLeftEye();
      const rightEye = faceLandmarks.getRightEye();

      const leftEyeCenter = leftEye[0];
      const rightEyeCenter = rightEye[3];

      const leftEyeX = leftEyeCenter.x;
      const rightEyeX = rightEyeCenter.x;

      const eyeDistance = rightEyeX - leftEyeX;

      if (eyeDistance > 0) {
        return 'No Glasses';
      } else {
        return 'Glasses';
      }
    };

    if (webcamRef.current && webcamRef.current.video?.readyState === 4) {
      const video = webcamRef.current.video;
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (detections.length > 0) {
        const landmarks = detections[0].landmarks;
        const nose = landmarks.getNose();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        console.log(detectGlasses(landmarks));

        const noseCenter = nose[3];
        const leftEyeCenter = leftEye[0];
        const rightEyeCenter = rightEye[3];

        const noseX = noseCenter.x;
        const leftEyeX = leftEyeCenter.x;
        const rightEyeX = rightEyeCenter.x;

        // Assuming you have a way to calculate or retrieve the width of the face
        const faceWidth = Math.abs(rightEyeX - leftEyeX);

        // Adjust the threshold based on the width of the face
        const threshold = faceWidth * 0.9; // Example: 10% of the face width

        const isLookingForward =
          Math.abs(leftEyeX - noseX) < threshold &&
          Math.abs(rightEyeX - noseX) < threshold;

        if (isLookingForward) {
          setBorderColor('border-green-500');
        } else {
          setBorderColor('border-red-500');
        }
      } else {
        setBorderColor('border-red-500');
      }
    }
  };

  const captureScreenshot = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      setScreenshot(screenshot);
    }
  };

  return (
    <div className='flex flex-col items-center p-5'>
      <div className='relative w-[300px] h-[400px] rounded-[50%] overflow-hidden mb-5'>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat='image/jpeg'
          className='w-full h-full object-cover transform scale-x-[-1]'
        />
        <div
          className={`absolute top-0 left-0 w-full h-full rounded-[50%] border-4 ${borderColor}`}
        ></div>
      </div>
      <p className='text-base font-bold'>
        Please move your face inside the oval
      </p>
      <p className='text-sm text-gray-500'>
        Tips: Put your face inside the oval frame and wait until it turns green
      </p>
      <button
        onClick={captureScreenshot}
        className='mt-5 px-4 py-2 bg-blue-500 text-white rounded'
      >
        Capture Screenshot
      </button>
      {screenshot && (
        <div className='mt-5'>
          <img src={screenshot} alt='Screenshot' />
        </div>
      )}
    </div>
  );
};
