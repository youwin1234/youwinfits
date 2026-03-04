const track = document.getElementById("image-track");

// Preload all images to cache them and improve dragging performance
const preloadImages = () => {
  const images = track.querySelectorAll("img");
  let loadedCount = 0;
  
  images.forEach((img) => {
    const preloadImg = new Image();
    preloadImg.onload = () => {
      loadedCount++;
      console.log(`Image preloaded: ${loadedCount}/${images.length}`);
    };
    preloadImg.onerror = () => {
      loadedCount++;
      console.warn(`Failed to preload: ${img.src}`);
    };
    preloadImg.src = img.src;
  });
};

// Start preloading images when the page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", preloadImages);
} else {
  preloadImages();
}

const handleOnDown = e => track.dataset.mouseDownAt = e.clientX;

const handleOnUp = () => {
  track.dataset.mouseDownAt = "0";  
  track.dataset.prevPercentage = track.dataset.percentage;
}

const handleOnMove = e => {
  if(track.dataset.mouseDownAt === "0") return;
  
  const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
        maxDelta = window.innerWidth / 2;
  
  const percentage = (mouseDelta / maxDelta) * -100,
        nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage,
        nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);
  
  track.dataset.percentage = nextPercentage;
  
  track.animate({
    transform: `translate(${nextPercentage}%, -50%)`
  }, { duration: 1200, fill: "forwards" });
  
  for(const image of track.getElementsByClassName("image")) {
    image.animate({
      objectPosition: `${100 + nextPercentage}% center`
    }, { duration: 1200, fill: "forwards" });
  }
}

function updateTrackHalf() {
  const rect = track.getBoundingClientRect();
  const half = rect.height / 2;
  document.documentElement.style.setProperty('--track-half', `${half}px`);
}

// update on load and resize, and when any image becomes available
window.addEventListener('load', updateTrackHalf);
window.addEventListener('resize', updateTrackHalf);
for (const img of track.getElementsByTagName('img')) {
  if (img.complete) continue;
  img.addEventListener('load', updateTrackHalf);
}

updateTrackHalf(); // initial run

window.handleOnDown = e => track.dataset.mouseDownAt = e.clientX;

window.onmousedown = e => handleOnDown(e);

window.ontouchstart = e => handleOnDown(e.touches[0]);

window.onmouseup = e => handleOnUp(e);

window.ontouchend = e => handleOnUp(e.touches[0]);

window.onmousemove = e => handleOnMove(e);

window.ontouchmove = e => handleOnMove(e.touches[0]);