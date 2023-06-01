document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");

  startButton.addEventListener("click", function () {
    chrome.runtime.sendMessage("startRecording");
  });

  stopButton.addEventListener("click", function () {
    chrome.runtime.sendMessage("stopRecording")
  });
});
/*
const audioCapture = (timeLimit, muteTab, format, quality, limitRemoved) => {
  let startTabId;
  let microphoneStream;
  let tabStream;
  let audioContext;
  let mediaRecorder;
  let mixedStream;

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      microphoneStream = stream;
      return chrome.tabCapture.capture({ audio: true });
    })
    .then((captureStream) => {
      tabStream = captureStream;
      audioContext = new AudioContext();

      const microphoneSource = audioContext.createMediaStreamSource(microphoneStream);
      const tabSource = audioContext.createMediaStreamSource(tabStream);

      const outputNode = audioContext.createMediaStreamDestination();
      microphoneSource.connect(outputNode);
      tabSource.connect(outputNode);

      mixedStream = outputNode.stream;

      mediaRecorder = new MediaRecorder(mixedStream);

      mediaRecorder.ondataavailable = (event) => {
        const audioURL = URL.createObjectURL(event.data);
        chrome.tabs.create({ url: "complete.html" }, (tab) => {
          const completeTabID = tab.id;
          const completeCallback = () => {
            chrome.tabs.sendMessage(tab.id, {
              type: "createTab",
              format: format,
              audioURL,
              startID: startTabId,
            });
          };
          setTimeout(completeCallback, 500);
        });
      };

      mediaRecorder.start();

      function stopCapture() {
        mediaRecorder.stop();
        audioContext.close();
        microphoneStream.getTracks().forEach((track) => track.stop());
        tabStream.getTracks().forEach((track) => track.stop());
      }

      mediaRecorder.onstop = stopCapture;

      if (!muteTab) {
        const audio = new Audio();
        audio.srcObject = mixedStream;
        audio.play();
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        startTabId = tabs[0].id;
      });

      if (!limitRemoved) {
        setTimeout(stopCapture, timeLimit);
      }
    })
    .catch((error) => {
      console.error("Error accessing microphone or tab audio:", error);
    });
};

 */