document.addEventListener('DOMContentLoaded', () => {
  const encodeProgress = document.getElementById('encodeProgress');
  const saveButton = document.getElementById('saveCapture');
  const closeButton = document.getElementById('close');
  const review = document.getElementById('review');
  const status = document.getElementById('status');
  let format;
  let audioURL;
  let encoding = false;
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "createTab") {
      format = request.format;
      let startID = request.startID;
      status.innerHTML = "Please wait..."
      closeButton.onclick = () => {
        chrome.runtime.sendMessage({ cancelEncodeID: startID });
        chrome.tabs.getCurrent((tab) => {
          chrome.tabs.remove(tab.id);
        });
      }

      //if the encoding completed before the page has loaded
      if (request.audioURL) {
        encodeProgress.style.width = '100%';
        status.innerHTML = "File is ready!" + request.audioURL;
        console.log(request)
        generateSave(request.audioURL);
      } else {
        encoding = true;
      }
    }

    //when encoding completes
    if (request.type === "encodingComplete" && encoding) {
      console.log(request)
      encoding = false;
      status.innerHTML = "File is ready!" + request.audioURL;
      encodeProgress.style.width = '100%';
      generateSave(request.audioURL);
    }
    //updates encoding process bar upon messages
    if (request.type === "encodingProgress" && encoding) {
      encodeProgress.style.width = `${request.progress * 100}%`;
    }
    // function generateSave(url) { //creates the save button
    //   const currentDate = new Date(Date.now()).toDateString();
    //   saveButton.onclick = () => {
    //     chrome.downloads.download({url: url, filename: `${currentDate}.${format}`, saveAs: true});
    //   };
    //   saveButton.style.display = "inline-block";
    // }
    function generateSave(url) {
      const currentDate = new Date(Date.now()).toDateString();
      const filename = `${currentDate}.${format}`;

      saveButton.onclick = () => {
        fetch(url)
          .then(response => response.blob())
          .then(async blob => {
            
            const deepgramUrl = "https://api.deepgram.com/v1/listen";

            const headers = {
              "Accept": "application/json",
              //"Content-Type": "multipart/",
              "Content-Type": "application/json",
              "Authorization": "Token 97929edd7d5d7af4ef70331f67f48ac178e23d6c"
            };


            blobToBase64(blob).then(async res => {
              // do what you wanna do
              let responseUrl = await uploadToCloudinary(res)
              if (!responseUrl) {
                console.log("Error uploading to cloudinary")
                return
              }
              const payloadToSend = {
                url: responseUrl
              };
              const options = {
                method: "POST",
                // body: formData,
                headers: headers,
                body: JSON.stringify(payloadToSend)
              };

              fetch(deepgramUrl, options)
                .then(response => response.json())
                .then(data => {
                  // Handle the response from Deepgram API
                  console.log(data)
                  console.log(data?.results?.channels?.[0]?.alternatives?.[0]?.transcript);
                  status.innerHTML = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
                  // Perform any further processing or actions with the response data
                })
                .catch(error => {
                  // Handle any errors that occur during the request
                  console.error("Error:", error);
                });

            });

            // fetch(deepgramUrl, options)
            //   .then(response => response.json())
            //   .then(data => {
            //     // Handle the response from Deepgram API
            //     console.log(data)
            //     console.log(data?.results?.channels?.[0]?.alternatives?.[0]?.transcript);
            //     status.innerHTML = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
            //     // Perform any further processing or actions with the response data
            //   })
            //   .catch(error => {
            //     // Handle any errors that occur during the request
            //     console.error("Error:", error);
            //   });
          })
          .catch(error => {
            // Handle any errors that occurred while fetching the audio file
            console.error('Error:', error);
          });
      };

      saveButton.style.display = 'inline-block';
    }

  });

  const blobToBase64 = blob => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
      reader.onloadend = () => {
        resolve(reader.result);
      };
    });
  };

  const uploadToCloudinary = async (base64) => {
    const cloudName = 'dxgk3lc63';
    const uploadPreset = 'uh4af0oz';
    const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const payload = {
      //file: base64,
      upload_preset: "uh4af0oz"
    }

    const data = new FormData();
    data.append("file", base64);
    data.append("upload_preset", uploadPreset);

    let res = await fetch(apiUrl, {
      method: 'POST',
      body: data,
      //body: JSON.stringify(payload),
    });

    res = await res.json();
    console.log(res)
    return res.secure_url
  }
  review.onclick = () => {
    chrome.tabs.create({ url: "https://chrome.google.com/webstore/detail/chrome-audio-capture/kfokdmfpdnokpmpbjhjbcabgligoelgp/reviews" });
  }


})
