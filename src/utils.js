export function createExampleImageComparisonSlider(parent, image2, image1) {

    parent.style.display = 'flex';
    parent.style.justifyContent = 'center';
    parent.style.alignItems = 'center';
  
    // Create the container and images
    let container = document.createElement('div');
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.width = '720px';
    container.style.height = '450px';
  
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
  
    let button = document.createElement('div');
    button.style.width = '15px';
    button.style.height = '30px';
    button.style.background = 'white';
    button.style.borderRadius = '30%';
    button.style.position = 'absolute';
    button.style.top = '50%';
    button.style.left = '50%';
    button.style.transform = 'translate(-50%, -50%)';
    bar.appendChild(button);
  
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
  
    function handleDragStart(e) {
      isDragging = true;
      e.preventDefault(); // Prevent the default touch behavior
    }
  
    function handleDragMove(e) {
      if (!isDragging) return;
      let containerRect = container.getBoundingClientRect();
      let x = (e.pageX || e.touches[0].pageX) - containerRect.left;
      x = Math.min(Math.max(x, 0), containerRect.width); // Constrain x to the container
      bar.style.left = x + 'px';
      // Update the clip path of the second image
      img2.style.clipPath = `inset(0 ${containerRect.width - x}px 0 0)`;
    }
  
    function handleDragEnd() {
      isDragging = false;
    }
  
    bar.addEventListener('mousedown', handleDragStart);
    bar.addEventListener('touchstart', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  }

export function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  }
  
export function createImageComparisonSlider(parent, image2, image1, index, eta, img_ext = 'png', width = '720px', height = '360px') {
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
    container.style.width = width;
    container.style.height = height;
  
    let img1 = document.createElement('img');
    img1.src = `data:image/${img_ext};base64,${image1}`;
    img1.style.position = 'absolute';
    img1.style.width = '100%';
    img1.style.height = '100%';
    img1.style.objectFit = 'cover';

    let img2 = document.createElement('img');
    img2.src = `data:image/${img_ext};base64,${image2}`;
    img2.style.position = 'absolute';
    img2.style.width = '100%';
    img2.style.height = '100%';
    img2.style.objectFit = 'cover';
  
    let bar = document.createElement('div');
    bar.id = 'bar';
  
    let button = document.createElement('div');
    button.style.width = '15px';
    button.style.height = '30px';
    button.style.background = 'white';
    button.style.borderRadius = '30%';
    button.style.position = 'absolute';
    button.style.top = '50%';
    button.style.left = '50%';
    button.style.transform = 'translate(-50%, -50%)';
    bar.appendChild(button);
  
    // Add the images and bar to the container
    container.appendChild(img1);
    container.appendChild(img2);
    container.appendChild(bar);
  
    // Add the container to the wrapper
    wrapper.appendChild(container);

    // Create the ETA text
    let etaText = document.createElement('div');
    etaText.textContent = eta + 's';
    etaText.style.color = 'green';
    etaText.style.marginLeft = '20px';
    etaText.style.alignSelf = 'center';

    // Add the ETA text to the wrapper
    wrapper.appendChild(etaText);
  
    // Add the wrapper to the body
    parent.appendChild(wrapper);
  
    // Set up the event listeners
    let isDragging = false;
    let containerRect = container.getBoundingClientRect();
    img2.style.clipPath = `inset(0 ${containerRect.width * 0.5}px 0 0)`;
  
    function handleDragStart(e) {
      isDragging = true;
      e.preventDefault(); // Prevent the default touch behavior
    }
  
    function handleDragMove(e) {
      if (!isDragging) return;
      let containerRect = container.getBoundingClientRect();
      let x = (e.pageX || e.touches[0].pageX) - containerRect.left;
      x = Math.min(Math.max(x, 0), containerRect.width); // Constrain x to the container
      bar.style.left = x + 'px';
      // Update the clip path of the second image
      img2.style.clipPath = `inset(0 ${containerRect.width - x}px 0 0)`;
    }
  
    function handleDragEnd() {
      isDragging = false;
    }
  
    bar.addEventListener('mousedown', handleDragStart);
    bar.addEventListener('touchstart', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  }
  