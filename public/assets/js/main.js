// const baseURL = "http://92.220.132.213:40045"
// const baseURL = "https://d6910820daa95904e7.gradio.live"
// const baseURL = "http://localhost:7860"
const baseURL = "https://9b56-130-250-185-236.ngrok-free.app"
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
let image_extention = 'png';

const status = ['Uploading', 'In Queue', 'Pre Processing', 'Scaling', 'Post Processing', 'Ready for Download'];
const upscalers = ['R-ESRGAN 4x+', 'R-ESRGAN 4x+ Anime6B', '4x-UltraSharp'];
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

function createImageComparisonSlider(parent, image2, image1, index, img_ext = 'png') {

  parent.style.justifyContent = 'center';
  parent.style.display = 'flex';
  parent.style.alignItems = 'center';

  // Create the wrapper
  let wrapper = document.createElement('div');
  wrapper.style.marginBottom = '20px';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.display = 'flex';

  // Create the radio button and label
  let radioButton = document.createElement('input');
  radioButton.type = 'radio';
  radioButton.name = 'imageComparisonSlider';
  radioButton.id = 'radio' + index;
  radioButton.value = index;
  radioButton.style.marginRight = '20px';
  
  wrapper.appendChild(radioButton);

  // Create the container and images
  let container = document.createElement('div');
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.width = '450px';
  container.style.height = '300px';

  let img1 = document.createElement('img');
  img1.src = `data:image/${img_ext};base64,${image1}`;
  img1.style.position = 'absolute';
  img1.style.width = '100%';
  img1.style.height = '100%';
  img1.style.objectFit = 'cover';

  // container.style.width = img1.naturalWidth.toString() + 'px';
  // container.style.height = img1.naturalHeight.toString() + 'px';

  let img2 = document.createElement('img');
  img2.src = `data:image/${img_ext};base64,${image2}`;
  img2.style.position = 'absolute';
  img2.style.width = '100%';
  img2.style.height = '100%';
  img2.style.objectFit = 'cover';

  let bar = document.createElement('div');
  bar.id = 'bar';

  // Add the images and bar to the container
  container.appendChild(img1);
  container.appendChild(img2);
  container.appendChild(bar);

  // Add the container to the wrapper
  wrapper.appendChild(container);

  // Add the wrapper to the body
  parent.appendChild(wrapper);

  // Set up the event listeners
  let isDragging = false;
  let containerRect = container.getBoundingClientRect();
  img2.style.clipPath = `inset(0 ${containerRect.width * 0.5}px 0 0)`;

  function handleMouseMove(e) {
    if (!isDragging) return;
    let containerRect = container.getBoundingClientRect();
    let x = e.pageX - containerRect.left;
    x = Math.min(Math.max(x, 0), containerRect.width); // Constrain x to the container
    bar.style.left = x + 'px';
    // Update the clip path of the second image
    img2.style.clipPath = `inset(0 ${containerRect.width - x}px 0 0)`;
  }

  bar.addEventListener('mousedown', (e) => {
    isDragging = true;
    document.addEventListener('mousemove', handleMouseMove);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
  });
}

function createExampleImageComparisonSlider(parent, image2, image1) {

  parent.style.display = 'flex';
  parent.style.justifyContent = 'center';
  parent.style.alignItems = 'center';

  // Create the container and images
  let container = document.createElement('div');
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.width = '450px';
  container.style.height = '300px';

  let img1 = document.createElement('img');
  img1.src = image1;
  img1.style.position = 'absolute';
  img1.style.objectFit = 'cover';
  img1.style.width = '100%';
  img1.style.height = '100%';

  // container.style.width = img1.naturalWidth.toString() + 'px';
  // container.style.height = img1.naturalHeight.toString() + 'px';

  let img2 = document.createElement('img');
  img2.src = image2;
  img2.style.position = 'absolute';
  img2.style.width = '100%';
  img2.style.height = '100%';
  img2.style.objectFit = 'cover';

  let bar = document.createElement('div');
  bar.id = 'bar';

  // Add the images and bar to the container
  container.appendChild(img1);
  container.appendChild(img2);
  container.appendChild(bar);

  // Add the wrapper to the body
  parent.appendChild(container);

  // Set up the event listeners
  let isDragging = false;
  let containerRect = container.getBoundingClientRect();
  img2.style.clipPath = `inset(0 ${containerRect.width * 0.5}px 0 0)`;

  function handleMouseMove(e) {
    if (!isDragging) return;
    let containerRect = container.getBoundingClientRect();
    let x = e.pageX - containerRect.left;
    x = Math.min(Math.max(x, 0), containerRect.width); // Constrain x to the container
    bar.style.left = x + 'px';
    // Update the clip path of the second image
    img2.style.clipPath = `inset(0 ${containerRect.width - x}px 0 0)`;
  }

  bar.addEventListener('mousedown', (e) => {
    isDragging = true;
    document.addEventListener('mousemove', handleMouseMove);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
  });
}

function get_scaling_method() {
  // Returns the selected upscaler

  let imageComparisonSlider = document.getElementsByName('imageComparisonSlider');
  let selected_index = -1;
  for (var i = 0, length = imageComparisonSlider.length; i < length; i++) { 
    if (imageComparisonSlider[i].checked) {
      selected_index = imageComparisonSlider[i].value;
      return upscalers[selected_index];
    }
  }
  return -1;
}

async function fetchPreview() {
  preview_button.disabled = true;
  // determine if the user is uploading an image or using an image url
  const image_url = document.getElementById('image_url').value;
  const image_file = document.getElementById('image_file').value;
  // console.log(image_url, image_file);
  if (image_url === '' && image_file === '') {
    alert('Please enter an image url or upload an image');
    return;
  }

  application_state = 1;
  // Start updating the status once the second HTTP POST call is made
  // console.log('Get status first called');
  // getStatus();
  processing_status_row.style.display = 'block';
  const clientId = getCookie('client_id');
  const form = document.getElementById('uploadForm');
  const formData = new FormData(form);

  // get the image from "image_file" input form

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
  }else{
    image_extention = image_url.split('.').pop();
    // replace all characters that are not allowed in a directory name
    // file_url = file_url.replace(/[^a-zA-Z0-9_]/g, '');
  }

  var scale_factor = 2;
  for (var i = 0, length = scaling_factor_radio.length; i < length; i++) {
    if (scaling_factor_radio[i].checked) {
      scale_factor = scaling_factor_radio[i].value;
      break;
    }
  }

  fetch(preUpscaleAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "upscaling_resize": scale_factor,
      "upscalers_list": upscalers,
      "imageKey": file_key,
      "imageURL": image_url,
      "client_id": clientId
    })
  }).then(response => {
    console.log(response);
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    return response.json();
  }).then(data => {
    const images = data.images;
    const original_image = data.original_image;
    console.log(images);
    // remove preview row div elements
    let all_divs = preview_row.querySelectorAll("div");
    for (let index = 0; index < all_divs.length; index++) {
      all_divs[index].innerHTML = "";
    }
    for (var i = 0; i < images.length; i++) {
      createImageComparisonSlider(preview_row, original_image ,images[i], i, image_extention);
    }
    previewView();
  }).catch(function() {
    console.log("Fetch error");
  });
}

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

async function fetchData() {
  // determine if the user is uploading an image or using an image url
  // const image_url = document.getElementById('image_url').value;
  // const image_file = document.getElementById('image_file').value;
  // // console.log(image_url, image_file);
  // if (image_url === '' && image_file === '') {
  //   alert('Please enter an image url or upload an image');
  //   return;
  // }
  

  application_state = 1;
  // Start updating the status once the second HTTP POST call is made
  // console.log('Get status first called');
  getStatus();
  processing_status_row.style.display = 'block';
  const clientId = getCookie('client_id');
  // const form = document.getElementById('uploadForm');
  // const formData = new FormData(form);
  // // First HTTP POST call
  // const response1 = await fetch('/upload', {
  //   method: 'POST',
  //   body: formData,
  // });
  // const file_json = await response1.json();

  // // console.log('Data from endpoint1:', file_json);
  // const file_key = file_json.key;

  var scale_factor = 2;
  const upscaler = get_scaling_method();
  if (upscaler === -1) {
    alert('Please select an upscaler');
    return;
  }
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
      "upscaler_1": upscaler,
      "upscaler_2": upscaler,
      "extras_upscaler_2_visibility": 0,
      "upscale_first": false,
      "imagePath": file_key,
      "imageURL": file_url,
      "client_id": clientId
    })
  }).then(response => {
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    return response.json();
  }).then(data => {
    // console.log(data);
    resultReadyView();
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


///////
createExampleImageComparisonSlider(interactive_example_row, "/assets/img/before_2.jpg", "/assets/img/after_2.png");

//////////////////////////////// server down timer
// Set the target date and time
// var countDownDate = new Date();
// countDownDate.setFullYear(2023, 11, 10);

// // Update the countdown every 1 second
// var countdownInterval = setInterval(function() {
//   // Get the current date and time
//   var now = new Date().getTime();

//   // Find the distance between now and the countdown date
//   var distance = countDownDate - now;

//   // Calculate days, hours, minutes, and seconds
//   var days = Math.floor(distance / (1000 * 60 * 60 * 24));
//   var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//   var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//   var seconds = Math.floor((distance % (1000 * 60)) / 1000);

//   // Display the result in the element with id="countdown"
//   document.getElementById("countdown").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

//   // If the countdown is finished, write some text 
//   if (distance < 0) {
//     clearInterval(countdownInterval);
//     document.getElementById("countdown").innerHTML = "EXPIRED";
//   }
// }, 1000);

// // Use the function
// // createImageComparisonSlider('image1.jpg', 'image2.jpg');