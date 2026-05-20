// Custom Video Player - Complete Implementation

(function() {
  // DOM Elements
  const player = document.querySelector('.player');
  const video = document.querySelector('.player__video');
  const progressFilled = document.querySelector('.progress__filled');
  const progressContainer = document.querySelector('.progress');
  const toggleBtn = document.querySelector('.toggle');
  const skipButtons = document.querySelectorAll('[data-skip]');
  
  let isMouseDown = false;

  // 1. Update progress bar as video plays
  function handleProgressUpdate() {
    if (!video || isNaN(video.duration) || video.duration === Infinity) return;
    const percent = (video.currentTime / video.duration) * 100;
    if (progressFilled) {
      progressFilled.style.width = `${percent}%`;
      progressFilled.style.flexBasis = `${percent}%`;
    }
  }

  // 2. Toggle Play/Pause
  function togglePlayPause() {
    if (video.paused || video.ended) {
      video.play().catch(err => {
        console.warn("Playback prevented:", err);
      });
    } else {
      video.pause();
    }
  }

  function updatePlayButton() {
    if (!toggleBtn) return;
    if (video.paused) {
      toggleBtn.textContent = '►';
      toggleBtn.setAttribute('title', 'Play');
    } else {
      toggleBtn.textContent = '❚ ❚';
      toggleBtn.setAttribute('title', 'Pause');
    }
  }

  // 3. Volume Control
  function handleVolumeUpdate() {
    const volumeSlider = document.querySelector('input[name="volume"]');
    if (volumeSlider && video) {
      video.volume = parseFloat(volumeSlider.value);
    }
  }

  // 4. Playback Speed Control
  function handlePlaybackRateUpdate() {
    const rateSlider = document.querySelector('input[name="playbackRate"]');
    if (rateSlider && video) {
      video.playbackRate = parseFloat(rateSlider.value);
    }
  }

  // 5. Skip Buttons (rewind 10s / forward 25s)
  function skipVideo(seconds) {
    if (!video) return;
    let newTime = video.currentTime + seconds;
    if (newTime < 0) newTime = 0;
    if (video.duration && newTime > video.duration) newTime = video.duration;
    video.currentTime = newTime;
  }

  // 6. Progress Bar Seeking
  function scrub(e) {
    if (!video || !progressContainer) return;
    const rect = progressContainer.getBoundingClientRect();
    let clientX = e.clientX;
    if (e.touches) clientX = e.touches[0].clientX;
    
    let clickX = clientX - rect.left;
    let width = rect.width;
    if (width <= 0) return;
    let percent = clickX / width;
    percent = Math.min(1, Math.max(0, percent));
    const newTime = percent * video.duration;
    if (!isNaN(newTime) && isFinite(newTime)) {
      video.currentTime = newTime;
    }
  }

  function handleMouseMoveScrub(e) {
    if (isMouseDown) {
      scrub(e);
    }
  }

  // 7. Graceful Error Handling
  function handleVideoError() {
    const existingError = document.querySelector('.video-error-overlay');
    if (existingError) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'video-error-overlay';
    errorDiv.innerHTML = `
      <div class="error-message-card">
        <h3>⚠️ Video failed to load</h3>
        <p>The file <strong>"download.mp4"</strong> could not be loaded.<br>
        Please check if the video file exists and is in a supported format.<br>
        Ensure the file is placed in the same directory as this page.</p>
        <button id="reloadRetry">Retry</button>
      </div>
    `;
    player.style.position = 'relative';
    player.appendChild(errorDiv);
    
    const retryBtn = errorDiv.querySelector('#reloadRetry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        video.load();
        errorDiv.remove();
      });
    }
  }

  function setupVideoErrorHandling() {
    if (!video) return;
    const currentSrc = video.getAttribute('src');
    if (!currentSrc || currentSrc.trim() === '') {
      handleVideoError();
    }
    video.addEventListener('error', () => {
      handleVideoError();
    });
  }

  // Sync controls with video state
  function syncControlsWithVideo() {
    const volSlider = document.querySelector('input[name="volume"]');
    if (volSlider && video) volSlider.value = video.volume;
    const rateSlider = document.querySelector('input[name="playbackRate"]');
    if (rateSlider && video) rateSlider.value = video.playbackRate;
    updatePlayButton();
  }

  function onVideoMetadata() {
    if (progressFilled) {
      progressFilled.style.width = '0%';
      progressFilled.style.flexBasis = '0%';
    }
    syncControlsWithVideo();
  }

  // Initialize all event listeners
  function init() {
    if (!video) {
      console.error("No video element found!");
      return;
    }

    // Ensure video source is set correctly
    if (!video.getAttribute('src') || video.getAttribute('src') !== 'download.mp4') {
      video.setAttribute('src', 'download.mp4');
    }
    video.load();

    // Progress bar updates
    video.addEventListener('timeupdate', handleProgressUpdate);

    // Play/Pause functionality
    if (toggleBtn) {
      toggleBtn.addEventListener('click', togglePlayPause);
    }
    video.addEventListener('play', updatePlayButton);
    video.addEventListener('pause', updatePlayButton);
    video.addEventListener('ended', () => {
      updatePlayButton();
      if (progressFilled) progressFilled.style.width = '100%';
    });

    // Volume control
    const volumeSlider = document.querySelector('input[name="volume"]');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', handleVolumeUpdate);
      if (video) video.volume = parseFloat(volumeSlider.value);
    }

    // Playback speed control
    const rateSlider = document.querySelector('input[name="playbackRate"]');
    if (rateSlider) {
      rateSlider.addEventListener('input', handlePlaybackRateUpdate);
      if (video) video.playbackRate = parseFloat(rateSlider.value);
    }

    // Skip buttons
    skipButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const skipValue = parseFloat(button.dataset.skip);
        if (!isNaN(skipValue)) {
          skipVideo(skipValue);
        }
      });
    });

    // Progress bar seeking (click & drag)
    if (progressContainer) {
      progressContainer.addEventListener('click', scrub);
      progressContainer.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        scrub(e);
        e.preventDefault();
      });
      document.addEventListener('mousemove', handleMouseMoveScrub);
      document.addEventListener('mouseup', () => {
        isMouseDown = false;
      });
      
      // Touch support
      progressContainer.addEventListener('touchstart', (e) => {
        isMouseDown = true;
        scrub(e);
        e.preventDefault();
      });
      document.addEventListener('touchmove', (e) => {
        if (isMouseDown && e.touches.length) {
          scrub(e);
          e.preventDefault();
        }
      });
      document.addEventListener('touchend', () => {
        isMouseDown = false;
      });
    }

    // Click video to toggle play/pause
    if (video) {
      video.addEventListener('click', togglePlayPause);
    }

    // Metadata and ready events
    video.addEventListener('loadedmetadata', onVideoMetadata);
    if (video.readyState >= 1) {
      onVideoMetadata();
    }
    
    video.addEventListener('canplay', () => {
      const errorOverlay = document.querySelector('.video-error-overlay');
      if (errorOverlay) errorOverlay.remove();
      syncControlsWithVideo();
    });

    // Error handling
    setupVideoErrorHandling();
    
    // Final check after window loads
    window.addEventListener('load', () => {
      if (video.error || video.networkState === video.NETWORK_NO_SOURCE) {
        if (!document.querySelector('.video-error-overlay')) {
          handleVideoError();
        }
      }
      if (progressFilled && (!video.currentTime || video.currentTime === 0)) {
        progressFilled.style.width = '0%';
      }
    });
    
    updatePlayButton();
  }

  // Start everything when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();