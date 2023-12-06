// const baseURL = "http://92.220.132.213:40045"
// const baseURL = "https://d6910820daa95904e7.gradio.live"
// const baseURL = "http://localhost:7860"
const baseURL = "https://ddb8-184-67-78-114.ngrok-free.app"
const upscaleAPI = baseURL + "/sdapi/v1/upscale";
const statusAPI = baseURL + "/sdapi/v1/progress";
// progress bar
const progressBar = document.getElementById('progress_bar');
const statusText = document.getElementById('status');
const download_btn = document.getElementById('download_btn');
const downloadLink = document.getElementById('downloadLink');
const processing_status_row = document.getElementById('processing_status_row');
const results_row = document.getElementById('results_row');
const coffee_row = document.getElementById('coffee_row');
const scaling_factor_radio = document.getElementsByName('inlineRadioOptions');
const example_row = document.getElementById('example_row');
const example_image = document.getElementById('example_image');
const status = ['Uploading', 'In Queue', 'Pre Processing', 'Scaling', 'Post Processing', 'Ready for Download'];
let application_state = 0;

// Clean everything to be ready for a second run
function clean() {
  download_btn.disabled = true;
  results_row.style.display = 'none';
  processing_status_row.style.display = 'none';
}

function validateInput() {
  const imageUrl = document.getElementById('image_url').value;
  const imageFile = document.getElementById('image_file').value;

  if (imageUrl && imageFile) {
    alert('Please use only one input: URL or File');
    return false;
  }

  if (!imageUrl && !imageFile) {
    alert('Please provide either a URL or a File');
    return false;
  }

  // Continue with form submission or processing
  return true;
}

async function fetchData() {
  // determine if the user is uploading an image or using an image url
  const image_url = document.getElementById('image_url').value;
  const image_file = document.getElementById('image_file').value;
  // console.log(image_url, image_file);
  if (image_url === '' && image_file === '') {
    alert('Please enter an image url or upload an image');
    return;
  }
  

  application_state = 1;
  example_row.style.display = 'none';
  // Start updating the status once the second HTTP POST call is made
  // console.log('Get status first called');
  getStatus();
  processing_status_row.style.display = 'block';
  const clientId = getCookie('client_id');
  const form = document.getElementById('uploadForm');
  const formData = new FormData(form);
  // First HTTP POST call
  const response1 = await fetch('/upload', {
    method: 'POST',
    body: formData,
  });
  const file_json = await response1.json();

  // console.log('Data from endpoint1:', file_json);
  const file_key = file_json.key;

  var scale_factor = 2;
  for (var i = 0, length = scaling_factor_radio.length; i < length; i++) {
    if (scaling_factor_radio[i].checked) {
      scale_factor = scaling_factor_radio[i].value;
      break;
    }
  }
  fetch(upscaleAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "resize_mode": 0,
      "show_extras_results": false,
      "gfpgan_visibility": 0.02,
      "codeformer_visibility": 0.02,
      "codeformer_weight": 0,
      "upscaling_resize": scale_factor,
      "upscaling_crop": true,
      "upscaler_1": "R-ESRGAN 4x+",
      "upscaler_2": "R-ESRGAN 4x+",
      "extras_upscaler_2_visibility": 0,
      "upscale_first": false,
      "imagePath": file_key,
      "imageURL": image_url,
      "client_id": clientId
    })
  }).then(response => {
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    return response.json();
  }).then(data => {
    console.log(data);
    results_row.style.display = 'block';
    if (data.imagePath) {
      const image_name = data.imagePath;
      // const extensionIndex = image_name.lastIndexOf(".");
      // const newFileName = 'result_' + image_name.substring(0, extensionIndex) + '.png';
      // Download compress image/group of images
      const newFileName = image_name + '.zip';
      downloadLink.href = '/download/' + newFileName;
    }else{
      statusText.innerHTML = 'Error occured please contact us';
    }
  }).catch(function() {
    console.log("Fetch error");
  });
}

async function getStatus() {
  try {
    const clientId = getCookie('client_id');
    const response = await fetch(`${statusAPI}?client_id=${clientId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const data = await response.json();
      // console.log('Data from endpoint3:', data);

      if (data.client_position === -1){
        if (application_state === 1) {
          // console.log('Uploading');
          statusText.innerHTML = 'Uploading';
          progressBar.style.width = '10%';
          setTimeout(getStatus, 400);
        } else if (application_state !== 0) {
          progressBar.style.width = '100%';
          // console.log('complete');
          statusText.innerHTML = 'Ready for Download';
          results_row.style.display = 'block';
          download_btn.disabled = false;
          application_state = 0;
        }
      } 
      else if (data.client_position === 0) {

        // console.log('Position in Queue is 0');
        // console.log('doing', data.state.job);
        statusText.innerHTML = data.state.job;
        application_state = 2;
        if (data.state.job === 'Preprocessing') {
          progressBar.style.width = '25%';
          coffee_row.style.display = 'block';
        }
        else if (data.state.job === 'Scaling') {
          progressBar.style.width = '40%';
        }
        else if (data.state.job === 'Post Processing') {
          progressBar.style.width = '80%';
        }
        else if (data.state.job === 'Writting') {
          progressBar.style.width = '95%';
          coffee_row.style.display = 'block';
        }
        setTimeout(getStatus, 400);
      } else {
        progressBar.style.width = '20%';
        statusText.innerHTML = 'Position in Queue is ' + data.client_position.toString();
        // console.log('Position in Queue is ', data.client_position);
        application_state = 1;
        setTimeout(getStatus, 400);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

download_btn.addEventListener('click', downloadImage);
function downloadImage() {
  downloadLink.click();
  clean();
}

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

// Set the target date and time
var countDownDate = new Date();
countDownDate.setFullYear(2023, 11, 9);

// Update the countdown every 1 second
var countdownInterval = setInterval(function() {
  // Get the current date and time
  var now = new Date().getTime();

  // Find the distance between now and the countdown date
  var distance = countDownDate - now;

  // Calculate days, hours, minutes, and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="countdown"
  document.getElementById("countdown").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

  // If the countdown is finished, write some text 
  if (distance < 0) {
    clearInterval(countdownInterval);
    document.getElementById("countdown").innerHTML = "EXPIRED";
  }
}, 1000);