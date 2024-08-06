import React from 'react';
import { Footer } from './components/Footer';
import { SelfieCapture } from './SelfieCapture';

function App() {
  const [openCamera, setOpenCamera] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [screenshot, setScreenshot] = React.useState<string | null>(null);

  return (
    <>
      {!openCamera && !screenshot && (
        <div className='flex flex-col items-center p-5'>
          <img className='md:hidden block' src={'/mobile.png'} alt='Mobile' />

          <img className='hidden md:block' src={'/desktop.png'} alt='Desktop' />
        </div>
      )}

      <SelfieCapture
        screenshot={screenshot}
        setScreenshot={setScreenshot}
        onCapture={(image) => {
          setOpenCamera(false);
          setPreviewImage(image);
        }}
        isCameraOpen={openCamera}
      />

      {!openCamera && (
        <Footer
          onNext={() => {
            if (!openCamera) {
              setOpenCamera(true);
              setPreviewImage(null);
            }
          }}
          onBack={() => {
            if (!previewImage) return;

            setOpenCamera(true);
            setPreviewImage(null);
            setScreenshot(null);
          }}
          backLabel={previewImage ? 'Retake' : 'Back'}
          nextLabel={!previewImage ? 'Open Camera' : 'Use this one'}
        />
      )}
    </>
  );
}

export default App;
