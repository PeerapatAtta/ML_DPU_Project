let videoElement = document.getElementById('videoElement');
let canvasElement = document.getElementById('outputCanvas');
let canvasCtx = canvasElement.getContext('2d');
let counter = 0;
let status = false;
let pose;
let camera;

// Initialize Mediapipe Pose
function initializePose() {
  pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  pose.onResults(onResults);
}

// Adjust Canvas Size to Match Video
function adjustCanvasSize() {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
}

// Start Webcam
document.getElementById('startWebcam').addEventListener('click', async () => {
  try {
    videoElement.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });

    // Initialize Pose and Camera
    initializePose();
    camera = new Camera(videoElement, {
      onFrame: async () => {
        await pose.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });
    camera.start();

    console.log("Webcam started");
  } catch (err) {
    alert("Unable to access webcam. Please check camera permissions.");
    console.error(err);
  }
});

// Upload Video
document.getElementById('uploadVideo').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const videoURL = URL.createObjectURL(file);
    videoElement.src = videoURL;
    videoElement.onloadeddata = () => {
      adjustCanvasSize();
      initializePose();
    };
    console.log("Video uploaded");
  }
});

// Start Counting
document.getElementById('startCounting').addEventListener('click', () => {
  status = true;
  document.getElementById('status').innerText = 'Running';
});

// Stop Counting
document.getElementById('stopCounting').addEventListener('click', () => {
  status = false;
  document.getElementById('status').innerText = 'Stopped';
});

// Mediapipe Results
function onResults(results) {
  adjustCanvasSize();

  if (results.poseLandmarks) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Draw landmarks
    results.poseLandmarks.forEach((landmark) => {
      canvasCtx.beginPath();
      canvasCtx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 5, 0, 2 * Math.PI);
      canvasCtx.fillStyle = 'red';
      canvasCtx.fill();
    });

    // Logic to count jumping jacks
    const leftElbow = results.poseLandmarks[13];
    const rightElbow = results.poseLandmarks[14];
    const leftWrist = results.poseLandmarks[15];
    const rightWrist = results.poseLandmarks[16];

    if (status) {
      // Basic logic to detect upward motion of arms
      if (leftElbow.y < 0.5 && rightElbow.y < 0.5 && leftWrist.y < 0.5 && rightWrist.y < 0.5) {
        counter += 1;
        document.getElementById('counter').innerText = counter;
        console.log(`Counter: ${counter}`);
      }
    }
  }
}
