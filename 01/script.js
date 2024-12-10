import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

let videoElement = document.getElementById('videoElement');
let canvasElement = document.getElementById('outputCanvas');
let canvasCtx = canvasElement.getContext('2d');
let counter = 0;
let status = false;
let pose;

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

// Start Webcam
document.getElementById('startWebcam').addEventListener('click', async () => {
  const constraints = {
    video: true,
  };
  videoElement.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
  initializePose();
});

// Upload Video
document.getElementById('uploadVideo').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const videoURL = URL.createObjectURL(file);
    videoElement.src = videoURL;
    initializePose();
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
  if (results.poseLandmarks) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Draw landmarks
    results.poseLandmarks.forEach((landmark, index) => {
      canvasCtx.beginPath();
      canvasCtx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 5, 0, 2 * Math.PI);
      canvasCtx.fillStyle = 'red';
      canvasCtx.fill();
    });

    // Logic to count jumping jacks
    const leftElbow = results.poseLandmarks[13];
    const rightElbow = results.poseLandmarks[14];

    if (status) {
      // Basic logic for detecting jumping jacks (extendable)
      if (leftElbow.y < 0.5 && rightElbow.y < 0.5) {
        counter += 1;
        document.getElementById('counter').innerText = counter;
      }
    }
  }
}
