import React from 'react';
import { Footer } from './components/Footer';
import { SelfieCapture } from './SelfieCapture';

function App() {
  const [openCamera, setOpenCamera] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [screenshot, setScreenshot] = React.useState<string | null>(null);

  return (
    <>
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
            setOpenCamera(true);
            setPreviewImage(null);
            setScreenshot(null);
          }}
          nextLabel={!previewImage ? 'Open Camera' : 'Use this one'}
        />
      )}
    </>
  );
}

export default App;
