(function() {

  const CARD_WIDTH = 800;
  const CARD_HEIGHT = 1000;

  /* ── SCALE card-live to fit its container ── */
  const cardLive = document.getElementById('card-live');
  const scaleCont = document.getElementById('scale-container');

  function scaleCard() {
    const containerW = scaleCont.offsetWidth;
    const scale = containerW / CARD_WIDTH;
    cardLive.style.transform = `scale(${scale})`;
  }
  scaleCard();
  window.addEventListener('resize', scaleCard);

  /* ── LIVE TEXT UPDATES ── */
  function bind(inputId, liveId) {
    const inp = document.getElementById(inputId);
    const live = document.getElementById(liveId);
    if (!inp || !live) return;
    inp.addEventListener('input', () => { live.textContent = inp.value; });
  }

  bind('inp-header',     'live-header');
  bind('inp-subheader',  'live-subheader');
  bind('inp-name',       'live-name');

  const standInp   = document.getElementById('inp-stand');
  const standLive  = document.getElementById('live-stand');
  const standBlock = document.getElementById('banner-stand-block');

  if (standInp && standLive && standBlock) {
    const updateStand = () => {
      const v = standInp.value.trim();
      standLive.textContent = v;
      standBlock.classList.toggle('visible', v.length > 0);
    };
    standInp.addEventListener('input', updateStand);
    updateStand();
  }

  // Occupation allows line breaks
  document.getElementById('inp-occupation').addEventListener('input', function() {
    document.getElementById('live-occupation').innerHTML = this.value.replace(/\n/g, '<br>');
  });

  /* ── PORTRAIT PHOTO UPLOAD + DRAG ── */
  let imgEl = null;
  let dragActive = false;
  let lastX = 0, lastY = 0;
  let imgX = 0, imgY = 0;
  let zoom = 100;

  const photoInner  = document.getElementById('photo-inner');
  const placeholder = document.getElementById('photo-placeholder');
  const uploadArea  = document.getElementById('upload-area');
  const fileInput   = document.getElementById('file-input');
  const zoomSection = document.getElementById('zoom-section');
  const zoomSlider  = document.getElementById('zoom-slider');
  const zoomVal     = document.getElementById('zoom-val');
  
  // Floating zoom controls for mobile
  const floatingZoom = document.getElementById('floating-zoom');
  const floatingZoomSlider = document.getElementById('floating-zoom-slider');
  const floatingZoomVal = document.getElementById('floating-zoom-val');

  uploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFile);

  uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--accent)'; });
  uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImage(file);
  });

  // Company logo upload handlers
  const companyUploadArea = document.getElementById('company-upload-area');
  const fileCompanyInput = document.getElementById('file-company-input');
  const bannerCompanyImg = document.getElementById('banner-company-img');
  const bannerLogoPlaceholder = document.getElementById('banner-logo-placeholder');

  if (companyUploadArea && fileCompanyInput) {
    companyUploadArea.addEventListener('click', () => fileCompanyInput.click());
    companyUploadArea.addEventListener('dragover', e => { e.preventDefault(); companyUploadArea.style.borderColor = 'var(--accent)'; });
    companyUploadArea.addEventListener('dragleave', () => { companyUploadArea.style.borderColor = ''; });
    companyUploadArea.addEventListener('drop', e => {
      e.preventDefault();
      companyUploadArea.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) loadCompanyImage(file);
    });
    fileCompanyInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) loadCompanyImage(file);
    });
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) loadImage(file);
  }

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      placeholder.style.display = 'none';
      if (imgEl) imgEl.remove();
      imgEl = document.createElement('img');
      imgEl.src = ev.target.result;
      // Use contain so we show the full image by default (no automatic crop)
imgEl.style.cssText = 'position:absolute;width:100%;height:100%;object-fit:cover;object-position:center;cursor:grab;user-select:none;-webkit-user-drag:none;';
        imgX = 0; imgY = 0; zoom = 100;
      zoomSlider.value = 100;
      zoomVal.textContent = '100%';
      applyTransform();
      photoInner.appendChild(imgEl);
      zoomSection.style.display = 'block';
      floatingZoom.classList.add('active');
      uploadArea.querySelector('p').innerHTML = '<strong>Klik for at ændre foto</strong>';
      enableDrag();
    };
    reader.readAsDataURL(file);
  }

  function loadCompanyImage(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      if (bannerCompanyImg) {
        bannerCompanyImg.src = ev.target.result;
        bannerCompanyImg.style.display = '';
      }
      if (bannerLogoPlaceholder) bannerLogoPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function applyTransform() {
    if (!imgEl) return;
    const scale = zoom / 100;
    imgEl.style.transform = `translate(${imgX}px, ${imgY}px) scale(${scale})`;
    imgEl.style.objectFit = 'contain';
  }

  function enableDrag() {
    photoInner.addEventListener('mousedown', startDrag);
    photoInner.addEventListener('touchstart', startDragTouch, { passive: true });
  }

  function startDrag(e) {
    e.preventDefault();
    dragActive = true;
    lastX = e.clientX; lastY = e.clientY;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    if (imgEl) imgEl.style.cursor = 'grabbing';
  }

  function startDragTouch(e) {
    if (e.touches.length !== 1) return;
    dragActive = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    document.addEventListener('touchmove', onDragTouch, { passive: false });
    document.addEventListener('touchend', stopDrag);
  }

  function onDrag(e) {
    if (!dragActive) return;
    const scale = scaleCont.offsetWidth / CARD_WIDTH;
    imgX += (e.clientX - lastX) / scale;
    imgY += (e.clientY - lastY) / scale;
    lastX = e.clientX; lastY = e.clientY;
    applyTransform();
  }

  function onDragTouch(e) {
    if (!dragActive || e.touches.length !== 1) return;
    e.preventDefault();
    const scale = scaleCont.offsetWidth / CARD_WIDTH;
    imgX += (e.touches[0].clientX - lastX) / scale;
    imgY += (e.touches[0].clientY - lastY) / scale;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    applyTransform();
  }

  function stopDrag() {
    dragActive = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onDragTouch);
    document.removeEventListener('touchend', stopDrag);
    if (imgEl) imgEl.style.cursor = 'grab';
  }

  // Sync both zoom sliders
  function updateZoom(value) {
    zoom = parseInt(value);
    const zoomText = zoom + '%';
    zoomVal.textContent = zoomText;
    floatingZoomVal.textContent = zoomText;
    zoomSlider.value = zoom;
    floatingZoomSlider.value = zoom;
    applyTransform();
  }
  
  zoomSlider.addEventListener('input', function() {
    updateZoom(this.value);
  });
  
  floatingZoomSlider.addEventListener('input', function() {
    updateZoom(this.value);
  });

  /* ── BACKGROUND IMAGE ── */
  const BG_IMAGE_URL = './baggrund.jpg';
  const cardBg = document.getElementById('card-bg');
  if (BG_IMAGE_URL && BG_IMAGE_URL !== 'YOUR_BACKGROUND_IMAGE_URL_HERE') {
    cardBg.style.backgroundImage = `
      linear-gradient(160deg, rgba(10,14,50,0.72) 0%, rgba(20,10,60,0.55) 50%, rgba(5,5,20,0.85) 100%),
      url('${BG_IMAGE_URL}')
    `;
    cardBg.style.backgroundSize = 'cover';
    cardBg.style.backgroundPosition = 'center';
  }

  /* ── DOWNLOAD ── */
document.getElementById('btn-download').addEventListener('click', function() {
    const btn = this;
    btn.textContent = '⏳  Genererer…';
    btn.classList.add('loading');

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `position:fixed;left:-20000px;top:0;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;overflow:hidden;`;

    const clone = scaleCont.cloneNode(true);
    clone.style.width = CARD_WIDTH + 'px';
    clone.style.height = CARD_HEIGHT + 'px';
    clone.style.boxSizing = 'border-box';

    const clonedCardLive = clone.querySelector('#card-live');
    if (clonedCardLive) {
      clonedCardLive.style.cssText += `;position:absolute;top:0;left:0;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;transform:scale(1);transform-origin:top left;overflow:hidden;`;
    }

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // ── Erstat clonens <img> med et canvas der tegner billedet korrekt ──
    function fixPhotoInClone() {
      if (!imgEl || !imgEl.src) return Promise.resolve();

      const clonedPhotoInner = clone.querySelector('#photo-inner');
      if (!clonedPhotoInner) return Promise.resolve();

      // Find dimensions af photo-boksen i fuld (1:1) skala
      const photoW = clonedPhotoInner.offsetWidth  || photoInner.offsetWidth;
      const photoH = clonedPhotoInner.offsetHeight || photoInner.offsetHeight;

      return new Promise(resolve => {
        const nativeImg = new Image();
        nativeImg.onload = () => {
          const cvs = document.createElement('canvas');
          cvs.width  = photoW;
          cvs.height = photoH;
          const ctx = cvs.getContext('2d');

          // Beregn cover-scale (samme som object-fit: cover)
          const coverScale = Math.max(photoW / nativeImg.naturalWidth, photoH / nativeImg.naturalHeight) * (zoom / 100);
          const scaledW = nativeImg.naturalWidth  * coverScale;
          const scaledH = nativeImg.naturalHeight * coverScale;

          // Centrer + anvend brugerens drag-offset
          const drawX = (photoW - scaledW) / 2 + imgX;
          const drawY = (photoH - scaledH) / 2 + imgY;

          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, photoW, photoH);
          ctx.clip();
          ctx.drawImage(nativeImg, drawX, drawY, scaledW, scaledH);
          ctx.restore();

          // Sæt canvas ind i stedet for den clonede img
          cvs.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
          const clonedImg = clonedPhotoInner.querySelector('img');
          if (clonedImg) clonedImg.remove();
          clonedPhotoInner.appendChild(cvs);

          resolve();
        };
        nativeImg.src = imgEl.src;
      });
    }

    fixPhotoInClone().then(() => {
      const captureScale = Math.max(2, Math.round(window.devicePixelRatio || 2));
      const target = clonedCardLive || clone;

      html2canvas(target, {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        scale: captureScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      }).then(canvas => {
        document.body.removeChild(wrapper);

        const name = document.getElementById('inp-name').value.trim().replace(/\s+/g, '-') || 'attendee';
        const filename = `optimeet-card-${name}.png`;

        // Detect iOS devices
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        function finalizeDownload(href, cleanup) {
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = href;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            try { a.remove(); } catch (e) {}
            if (cleanup) cleanup();
          }, 1000);
          btn.textContent = '⬇ \u00a0Hent kort';
          btn.classList.remove('loading');
        }

        try {
          if (canvas.toBlob) {
            canvas.toBlob(async blob => {
              if (!blob) throw new Error('toBlob gav ikke en blob');
              
              // iOS: Use Web Share API to allow saving to Photos
              if (isIOS && navigator.share) {
                try {
                  const file = new File([blob], filename, { type: 'image/png' });
                  await navigator.share({
                    files: [file],
                    title: 'Optimeet Kort',
                    text: 'Mit Optimeet netværkskort'
                  });
                  btn.textContent = '⬇ \u00a0Hent kort';
                  btn.classList.remove('loading');
                } catch (shareErr) {
                  // If share fails or is cancelled, fall back to download
                  if (shareErr.name !== 'AbortError') {
                    const url = URL.createObjectURL(blob);
                    finalizeDownload(url, () => URL.revokeObjectURL(url));
                  } else {
                    btn.textContent = '⬇ \u00a0Hent kort';
                    btn.classList.remove('loading');
                  }
                }
              } else {
                // Non-iOS or no share API: regular download
                const url = URL.createObjectURL(blob);
                finalizeDownload(url, () => URL.revokeObjectURL(url));
              }
            }, 'image/png');
          } else {
            finalizeDownload(canvas.toDataURL('image/png'), null);
          }
        } catch (err) {
          console.error('Download error:', err);
          btn.textContent = '⬇ \u00a0Hent kort';
          btn.classList.remove('loading');
          alert('Download mislykkedes pga. en sikkerhedsbegrænsning.');
        }
      }).catch(err => {
        if (wrapper.parentNode) document.body.removeChild(wrapper);
        console.error('html2canvas error:', err);
        btn.textContent = '⬇ \u00a0Hent kort';
        btn.classList.remove('loading');
        alert('Download mislykkedes. Åbn DevTools og tjek konsollen for detaljer.');
      });
    });
  });
})();
