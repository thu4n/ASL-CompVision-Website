// Copyright 2023 The MediaPipe Authors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//      http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
let gestureRecognizer;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";
// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createGestureRecognizer = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "./model/asl_gesture_recognizer.task",
      delegate: "GPU",
    },
    runningMode: runningMode,
  });
};
createGestureRecognizer();
/********************************************************************
Grab image from webcam stream and detect it.
********************************************************************/
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const gestureOutput = document.getElementById("gesture_output-container");
const nextBtn = document.getElementById("nextButton");
const restartBtn = document.getElementById("restartButton");
// load data
const keywordValue = document.getElementById("keyword-value");
const lessonParam = new URLSearchParams(window.location.search).get("lesson");
const indexParam = new URLSearchParams(window.location.search).get(
  "keywordIndex"
);
const dataKeywordLesson1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
console.log(dataKeywordLesson1[dataKeywordLesson1.length - 1]);

const dataKeywordLesson2 = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];
// load Keyword
const loadKeyword = async () => {
  if (lessonParam == "1") {
    keywordValue.innerHTML = dataKeywordLesson1[indexParam];
  } else {
    keywordValue.innerHTML = dataKeywordLesson2[indexParam];
  }
};
loadKeyword();

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}
function nextLesson() {
  window.location.href = `./question.html?lesson=${lessonParam}&keywordIndex=${
    Number(indexParam) + 1
  }`;
  if (lessonParam == "1") {
    if (indexParam == dataKeywordLesson1.length - 1) {
      window.location.href = `./goal.html`;
    }
  }
  if (lessonParam == "2") {
    if (indexParam == dataKeywordLesson2.length - 1) {
      window.location.href = `./goal.html`;
    }
  }
}
nextBtn.addEventListener("click", nextLesson);
function restartLesson() {
  window.location.reload(false);
}
restartBtn.addEventListener("click", restartLesson);
// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!gestureRecognizer) {
    alert("Please wait for gestureRecognizer to load");
    return;
  }
  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "START LESSON";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "STOP LESSON";
  }
  // getUsermedia parameters.
  const constraints = {
    video: true,
  };
  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}
let lastVideoTime = -1;
let results = undefined;
async function predictWebcam() {
  const webcamElement = document.getElementById("webcam");
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
  }
  let nowInMs = Date.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    results = gestureRecognizer.recognizeForVideo(video, nowInMs);
  }
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  const drawingUtils = new DrawingUtils(canvasCtx);
  canvasElement.style.height = videoHeight;
  webcamElement.style.height = videoHeight;
  canvasElement.style.width = videoWidth;
  webcamElement.style.width = videoWidth;
  if (results.landmarks) {
    for (const landmarks of results.landmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        GestureRecognizer.HAND_CONNECTIONS,
        {
          color: "#00FF00",
          lineWidth: 5,
        }
      );
      drawingUtils.drawLandmarks(landmarks, {
        color: "#FF0000",
        lineWidth: 2,
      });
    }
  }
  canvasCtx.restore();
  if (results.gestures.length > 0) {
    gestureOutput.style.width = 480;
    gestureOutput.style.display = "block";
    const categoryName = results.gestures[0][0].categoryName;
    const categoryScore = parseFloat(
      results.gestures[0][0].score * 100
    ).toFixed(2);
    const handedness = results.handednesses[0][0].displayName;
    let realhandedness = "";
    if (handedness === "Left") {
      realhandedness = "Right";
    } else {
      realhandedness = "Left";
    }

    if (categoryScore > 80 && categoryName == keywordValue.innerHTML) {
      nextBtn.style.display = "flex";
      gestureOutput.innerText = "ĐÚNG";
    } else {
      gestureOutput.innerText = "SAI";
    }
    console.log(categoryName == keywordValue.innerHTML);
    console.log(keywordValue.innerHTML);
    console.log(categoryName);
    if (categoryScore > 80 && categoryName == keywordValue.innerHTML) {
      nextBtn.style.display = "flex";
    }
  }
  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
