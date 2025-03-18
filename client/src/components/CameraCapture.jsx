import { useRef, useState, useEffect } from "react";
import domtoimage from "dom-to-image";

const filters = [
  "none",
  "grayscale",
  "sepia",
  "brightness",
  "contrast",
  "blur",
  "saturate",
  
  "vintage",
  "warm",

  "noir",
];

const getCanvasFilter = (filter) => {
  switch (filter) {
    case "grayscale":
      return "grayscale(100%)";
    case "sepia":
      return "sepia(100%)";
 
    case "brightness":
      return "brightness(150%)";
    case "contrast":
      return "contrast(150%)";
    case "blur":
      return "blur(2px)";
    case "saturate":
      return "saturate(200%)";
   
    case "vintage":
      return "sepia(60%) contrast(90%) brightness(80%)";
    case "warm":
      return "sepia(40%) brightness(110%)";
   
    case "noir":
      return "grayscale(100%) contrast(120%)";
    default:
      return "none";
  }
};

const CameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const polaroidRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);
  const [filter, setFilter] = useState("none");

  const date = new Date(Date.now()); // Get the current date
  const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhotoSequence = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setCapturedImages([]);

    for (let i = 0; i < 3; i++) {
      for (let j = 3; j > 0; j--) {
        setCountdown(j);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setCountdown(null);

      setFlash(true);
      setTimeout(() => setFlash(false), 200);

      capturePhoto();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
        console.error("Canvas or Video element is not available!");
        return;
      }
    
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
    
      if (!context) {
        console.error("Failed to get canvas context!");
        return;
      }
    
      // Set canvas size to match video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
    
      // Apply selected filter
      context.filter = getCanvasFilter(filter);
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
      // Save image as a high-quality blob
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setCapturedImages((prevImages) => [...prevImages, url]);
      }, "image/png", 1.0); // 1.0 means highest quality
  };

  const downloadPolaroid = async () => {
    const element = document.getElementById("polaroid-preview");
  
    if (!element) {
      console.error("Polaroid element not found!");
      return;
    }
  
    domtoimage
      .toPng(element, {
        quality: 1.0, // Ensures the best image quality
        width: element.offsetWidth * 2, // Doubles the resolution
        height: element.offsetHeight * 2,
        style: {
          transform: "scale(2)", // Ensures higher quality capture
          transformOrigin: "top left",
        },
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "polaroid.png";
        link.click();
      })
      .catch((error) => console.error("Error capturing image:", error));
  };
  
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5DC] p-6 relative">
      {/* Flash Effect */}
  

      {/* Countdown Timer */}
      {countdown !== null && (
        <div className="absolute top-1/3 z-10 text-6xl font-bold text-white bg-gray-800 bg-opacity-50 px-6 py-3 rounded-lg shadow-lg">
          {countdown}
        </div>
      )}

      <div className="card w-[28rem] bg-[#FFF8E1] shadow-2xl p-4 rounded-xl border border-gray-400">
        <div className="card-body items-center">
          <h2 className="card-title text-2xl font-bold text-gray-700 tracking-wide">
             Polaroid 📸
          </h2>

          {/* Camera Preview */}
          <div className="relative w-80 h-64 border-8 border-[#D4A373] rounded-lg shadow-lg bg-black mt-2">
          {flash && (
    <div className="absolute inset-0 bg-white opacity-50 transition-opacity duration-150"></div>
  )}
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                className="w-full h-full object-cover"
                style={{ filter: getCanvasFilter(filter),transform: "scaleX(-1)", }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#E6D5B8]">
                <span className="text-gray-600 font-semibold">Camera Off</span>
              </div>
            )}
          </div>

          {/* Filter Selection Dropdown */}
          <select
            className="mt-4 p-2 border rounded"
            onChange={(e) => setFilter(e.target.value)}
          >
            {filters.map((f, index) => (
              <option key={index} value={f}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button onClick={() => setCameraActive(true)} className="btn bg-[#D4A373] text-white px-4 py-2 rounded-md">
              Start Camera
            </button>
            <button onClick={() => setCameraActive(false)} className="btn bg-[#C84630] text-white px-4 py-2 rounded-md">
              Stop Camera
            </button>
            <button
              onClick={capturePhotoSequence}
              disabled={!cameraActive || isCapturing}
              className="btn bg-[#4E6C50] text-white px-4 py-2 rounded-md"
            >
              {isCapturing ? "Capturing... " : "Capture"}
            </button>
          </div>

          {/* Polaroid Preview & Download */}
          {capturedImages.length === 3 && (
            <div className="flex flex-col items-center mt-6">
              <div id="polaroid-preview" ref={polaroidRef} className="relative bg-white p-4 w-72 shadow-lg rounded-md">
                {capturedImages.map((img, index) => (
                  <img key={index} src={img} alt={`Captured ${index + 1}`} className="w-full rounded-md shadow-md mb-2" />
                ))}
                 <p className="text-center text-gray-700 font-bold mt-2 text-lg tracking-wide">
                   {formattedDate} 🎞️
                </p>
              </div>
              <button onClick={downloadPolaroid} className="btn mt-4 bg-[#3A543E] text-white px-4 py-2 rounded-md">
                Download Polaroid 📥
              </button>
            </div>
          )}
        </div>
        
      </div>
      {/* Hidden Canvas for Image Capture */}
<canvas ref={canvasRef} className="hidden"></canvas>

    </div>
  );
};

export default CameraCapture;
