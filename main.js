onload = () => {
  document.body.classList.remove("container");
  initializeFlowerInteractions();
  initializeVaseInteractions();
  initializeAutoMusic();
  initializeIOSFixes();
};

function initializeAutoMusic() {
  const backgroundMusic = document.getElementById('backgroundMusic');
  if (backgroundMusic) {
    backgroundMusic.volume = 0.3;
    
    // Try to play immediately
    const playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.then(_ => {
        console.log('Music started successfully');
      }).catch(error => {
        console.log('Auto-play prevented, trying user interaction workaround:', error);
        
        // Fallback: Create a user interaction event to start music
        document.addEventListener('click', function startMusic() {
          backgroundMusic.play().then(_ => {
            console.log('Music started after user interaction');
            document.removeEventListener('click', startMusic);
          }).catch(e => {
            console.log('Music still failed:', e);
          });
        }, { once: true });
        
        // Also try with mousemove as another fallback
        document.addEventListener('mousemove', function startMusicOnMove() {
          backgroundMusic.play().then(_ => {
            console.log('Music started after mouse movement');
            document.removeEventListener('mousemove', startMusicOnMove);
          }).catch(e => {
            console.log('Music still failed on mousemove:', e);
          });
        }, { once: true });
      });
    }
    
    // Ensure music continues after page refresh by saving state
    backgroundMusic.addEventListener('play', () => {
      sessionStorage.setItem('musicPlaying', 'true');
    });
    
    backgroundMusic.addEventListener('pause', () => {
      sessionStorage.setItem('musicPlaying', 'false');
    });
    
    // Check if music was playing before refresh
    if (sessionStorage.getItem('musicPlaying') === 'true') {
      setTimeout(() => {
        backgroundMusic.play().catch(e => {
          console.log('Could not resume music after refresh:', e);
        });
      }, 100);
    }
  }
}

function initializeIOSFixes() {
  // iOS-specific animation fixes
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    console.log('iOS detected - applying animation fixes');
    
    // Force reflow to ensure animations start
    const animatedElements = document.querySelectorAll('.flower, .firefly, .vase, .flower__grass');
    animatedElements.forEach(el => {
      // Force GPU acceleration
      el.style.webkitTransform = 'translateZ(0)';
      el.style.transform = 'translateZ(0)';
      el.style.webkitBackfaceVisibility = 'hidden';
      el.style.backfaceVisibility = 'hidden';
      
      // Trigger reflow
      el.offsetHeight;
      
      // Restart animations by removing and re-adding animation classes
      const animations = window.getComputedStyle(el).animationName;
      if (animations && animations !== 'none') {
        const animationDuration = window.getComputedStyle(el).animationDuration;
        const animationDelay = window.getComputedStyle(el).animationDelay;
        
        el.style.animation = 'none';
        el.offsetHeight; // Trigger reflow
        el.style.animation = `${animations} ${animationDuration} ${animationDelay}`;
      }
    });
    
    // iOS touch interaction fixes
    document.addEventListener('touchstart', function() {}, { passive: true });
    
    // Force iOS to respect 3D transforms
    document.body.style.webkitTransformStyle = 'preserve-3d';
    document.body.style.transformStyle = 'preserve-3d';
    
    // Fix for iOS animation performance
    setTimeout(() => {
      animatedElements.forEach(el => {
        el.style.willChange = 'transform';
      });
    }, 100);
  }
}

function initializeFlowerInteractions() {
  const flowers = document.querySelectorAll('.flower');
  flowers.forEach(flower => {
    flower.addEventListener('click', () => {
      flower.style.animation = 'none';
      flower.offsetHeight;
      flower.style.animation = '';
      flower.style.filter = 'brightness(1.3)';
      setTimeout(() => {
        flower.style.filter = '';
      }, 300);
    });
  });
}

function initializeVaseInteractions() {
  const vase = document.querySelector('.vase');
  if (vase) {
    vase.addEventListener('click', () => {
      vase.style.transform = 'translateX(-50%) scale(1.1)';
      vase.style.filter = 'brightness(1.2)';
      
      setTimeout(() => {
        vase.style.transform = 'translateX(-50%) scale(1)';
        vase.style.filter = '';
      }, 300);
      
      const flowers = document.querySelectorAll('.flower');
      flowers.forEach(flower => {
        flower.style.animation = 'none';
        flower.offsetHeight;
        flower.style.animation = '';
      });
    });
    
    vase.addEventListener('mouseenter', () => {
      vase.style.transition = 'transform 0.3s ease, filter 0.3s ease';
    });
  }
}
