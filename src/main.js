import { createExampleImageComparisonSlider, getCookie, createImageComparisonSlider } from './utils.js';

// const baseURL = "http://92.220.132.213:40045"
const baseURL = "https://bc3534ffb2fa1e992e.gradio.live"
// const baseURL = "http://localhost:7860"
// const baseURL = "https://5c91-31-143-212-101.ngrok-free.app"
const upscaleAPI = baseURL + "/sdapi/v1/upscale";
const preUpscaleAPI = baseURL + "/sdapi/v1/upscale-preview";
const statusAPI = baseURL + "/sdapi/v1/progress";

// progress bar
const main_container = document.getElementById('main_container');
const main_card = document.getElementById('main_card');
const progressBar = document.getElementById('progress_bar');
const statusText = document.getElementById('status');
const download_btn = document.getElementById('download_btn');
const downloadLink = document.getElementById('downloadLink');
const processing_status_row = document.getElementById('processing_status_row');
const results_row = document.getElementById('results_row');
const preview_row = document.getElementById('preview_row');
const coffee_row = document.getElementById('coffee_row');
const scaling_factor_radio = document.getElementsByName('inlineRadioOptions');
const example_image = document.getElementById('example_image');
const upscale_button = document.getElementById('upscale_button');
const preview_button = document.getElementById('preview_button');
const interactive_example_row = document.getElementById('interactive_example_row');
const image_input_row = document.getElementById('image_input_row');
const scaling_factor_row = document.getElementById('scaling_factor_row');
let image_extention = '';
const clientId = getCookie('client_id');
let scale_factor = 2;

const status = ['Uploading', 'In Queue', 'Pre Processing', 'Scaling', 'Post Processing', 'Ready for Download'];
const upscalers = ['R-ESRGAN 4x+', 'R-ESRGAN 4x+ Anime6B', '4x-UltraSharp'];

const upscaling_options = [{ 'upscaler_1': '4x-UltraSharp', 'upscaler_2': 'R-ESRGAN 4x+', 'extras_upscaler_2_visibility': 0.2 },
{ 'upscaler_1': '4x-UltraSharp', 'upscaler_2': 'R-ESRGAN 4x+', 'extras_upscaler_2_visibility': 0.5 },
{ 'upscaler_1': 'R-ESRGAN 4x+', 'upscaler_2': '4x-UltraSharp', 'extras_upscaler_2_visibility': 0.2 },
{ 'upscaler_1': 'R-ESRGAN 4x+', 'upscaler_2': '4x-UltraSharp', 'extras_upscaler_2_visibility': 0.5 },
{ 'upscaler_1': 'R-ESRGAN 4x+ Anime6B', 'upscaler_2': '4x-UltraSharp', 'extras_upscaler_2_visibility': 0.2 },
{ 'upscaler_1': 'R-ESRGAN 4x+ Anime6B', 'upscaler_2': 'R-ESRGAN 4x+', 'extras_upscaler_2_visibility': 0.3 },
{ 'upscaler_1': 'R-ESRGAN 4x+', 'upscaler_2': 'LDSR', 'extras_upscaler_2_visibility': 0.25 },
{ 'upscaler_1': 'LDSR', 'upscaler_2': 'R-ESRGAN 4x+', 'extras_upscaler_2_visibility': 0.25 },
{ 'upscaler_1': 'LDSR', 'upscaler_2': '4x-UltraSharp', 'extras_upscaler_2_visibility': 0.5 }
];

let application_state = 0;
let file_key = '';
let file_url = '';

// Clean everything to be ready for a second run
function clean() {
  file_key = '';
  file_url = '';
  application_state = 0;
  download_btn.disabled = true;
  results_row.style.display = 'none';
  processing_status_row.style.display = 'none';
  preview_button.style.display = 'block';
  upscale_button.style.display = 'none';
  preview_row.style.display = 'none';

  scaling_factor_row.style.display = 'block';
  image_input_row.style.display = 'block';
  interactive_example_row.style.display = 'block';
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

function get_scaling_method() {
  // Returns the selected upscaler

  let imageComparisonSlider = document.getElementsByName('imageComparisonSlider');
  let selected_index = -1;
  for (var i = 0, length = imageComparisonSlider.length; i < length; i++) {
    if (imageComparisonSlider[i].checked) {
      selected_index = imageComparisonSlider[i].value;
      return upscaling_options[selected_index];
    }
  }
  return -1;
}

async function preview() {
  // Your code here
  preview_button.disabled = true;
  processing_status_row.style.display = 'block';

  // determine if the user is uploading an image or using an image url
  const image_url = document.getElementById('image_url').value;
  const image_file = document.getElementById('image_file').value;

  // console.log(image_url, image_file);
  if (image_url === '' && image_file === '') {
    alert('Please enter an image url or upload an image');
    return;
  }

  application_state = 1;
  const form = document.getElementById('uploadForm');
  const formData = new FormData(form);

  file_url = image_url;
  if (image_url === '') {
    image_extention = image_file.split('.').pop();
    // First HTTP POST call
    const response1 = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });
    const file_json = await response1.json();
    file_key = file_json.key;
  } else {
    image_extention = image_url.split('.').pop();
  }

  // clear the form
  form.reset();

  for (var i = 0, length = scaling_factor_radio.length; i < length; i++) {
    if (scaling_factor_radio[i].checked) {
      scale_factor = scaling_factor_radio[i].value;
      break;
    }
  }
  console.log(upscaling_options)
  await fetchPreview(scale_factor);
}
async function fetchPreview(scale_factor) {
  fetch(preUpscaleAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "upscaling_resize": scale_factor,
      "upscalers_params": upscaling_options,
      "imageKey": file_key,
      "imageURL": file_url,
      "client_id": clientId
    })
  }).then(response => {
    if (!response.ok) {
      errorHandler();
      throw new Error("HTTP error " + response.status);
    }
    return response.json();
  }).then(data => {
    const images = data.images;
    const original_image = data.original_image;
    const etas = data.etas;
    // remove preview row div elements
    let all_divs = preview_row.querySelectorAll("div");
    for (let index = 0; index < all_divs.length; index++) {
      all_divs[index].innerHTML = "";
    }
    for (var i = 0; i < images.length; i++) {
      createImageComparisonSlider(preview_row, original_image, images[i], i, etas[i], image_extention);
    }
    previewView();
  }).catch(function () {
    // TODO: stop the progress bar and show there was an error
    errorHandler();
    console.log("Fetch error");
  });
}

function errorHandler() {
  // reset the application and then show there was an error
  statusText.innerHTML = 'Error occured please contact us, to try again refersh the page';
}

// In your JavaScript file
document.querySelector('#preview_button').addEventListener('click', function () {
  preview();
});

document.querySelector('#preview_again_button').addEventListener('click', function () {
  fetchPreview();
});

function previewView() {
  preview_row.style.display = 'block';
  preview_button.style.display = 'none';
  upscale_button.style.display = 'block';
  scaling_factor_row.style.display = 'none';
  image_input_row.style.display = 'none';
  interactive_example_row.style.display = 'none';
}

function resultReadyView() {
  preview_row.style.display = 'none';
  preview_button.style.display = 'none';
  upscale_button.style.display = 'none';
  scaling_factor_row.style.display = 'none';
  image_input_row.style.display = 'none';
  interactive_example_row.style.display = 'none';
  download_btn.disabled = false;
  results_row.style.display = 'block';
}

// In your JavaScript file
document.querySelector('#upscale_button').addEventListener('click', async function () {
  application_state = 1;

  getStatus();
  processing_status_row.style.display = 'block';
  const clientId = getCookie('client_id');

  const upscaler_params = get_scaling_method();
  console.log(upscaler_params);
  if (upscaler_params === -1) {
    alert('Please select an upscaler');
    return;
  }

  fetch(upscaleAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "resize_mode": 0,
      "show_extras_results": false,
      "gfpgan_visibility": 0,
      "codeformer_visibility": 0,
      "codeformer_weight": 0,
      "upscaling_resize": scale_factor,
      "upscaling_crop": true,
      "upscaler_1": upscaler_params["upscaler_1"],
      "upscaler_2": upscaler_params["upscaler_2"],
      "extras_upscaler_2_visibility": upscaler_params["extras_upscaler_2_visibility"],
      "upscale_first": false,
      "imagePath": file_key,
      "imageURL": file_url,
      "client_id": clientId
    })
  }).then(response => {
    if (!response.ok) {
      errorHandler();
      throw new Error("HTTP error " + response.status);
    }
    return response.json();
  }).then(data => {
    // console.log(data);
    resultReadyView();
    if (data.imagePath) {
      const image_name = data.imagePath;
      const newFileName = image_name + '.zip';
      downloadLink.href = '/download/' + newFileName;
    } else {
      statusText.innerHTML = 'Error occured please contact us';
    }
  }).catch(function () {
    errorHandler();
    console.log("Fetch error");
  });
});


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

      if (data.client_position === -1) {
        if (application_state === 1) {
          // console.log('Uploading');
          statusText.innerHTML = 'Uploading';
          progressBar.style.width = '10%';
          setTimeout(getStatus, 1000);
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
          progressBar.style.width = '75%';
        }
        else if (data.state.job === 'Writting') {
          progressBar.style.width = '90%';
          coffee_row.style.display = 'block';
        }
        setTimeout(getStatus, 1000);
      } else {
        progressBar.style.width = '20%';
        statusText.innerHTML = 'Position in Queue is ' + data.client_position.toString();
        // console.log('Position in Queue is ', data.client_position);
        application_state = 1;
        setTimeout(getStatus, 1000);
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

createExampleImageComparisonSlider(interactive_example_row, "/assets/img/castle.png", "/assets/img/castle_2.png");
