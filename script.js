(function() {

  const CARD_WIDTH = 800;
  const CARD_HEIGHT = 1000;

  /* ══════════════════════════════════════════
     MOBILE TAB SWITCHING
  ══════════════════════════════════════════ */
  window.switchTab = function(tab) {
    const editPane    = document.getElementById('pane-edit');
    const previewPane = document.getElementById('pane-preview');
    const editBtn     = document.getElementById('tab-edit-btn');
    const previewBtn  = document.getElementById('tab-preview-btn');

    if (tab === 'edit') {
      editPane.classList.add('tab-active');
      previewPane.classList.remove('tab-active');
      editBtn.classList.add('active');
      previewBtn.classList.remove('active');
    } else {
      previewPane.classList.add('tab-active');
      editPane.classList.remove('tab-active');
      previewBtn.classList.add('active');
      editBtn.classList.remove('active');
      // Re-scale card when preview tab becomes visible
      scaleCard();
    }
  };

  /* ══════════════════════════════════════════
     PROGRESS BADGES
  ══════════════════════════════════════════ */


  /* ══════════════════════════════════════════
     SCALE card-live to fit its container
  ══════════════════════════════════════════ */
  const cardLive  = document.getElementById('card-live');
  const scaleCont = document.getElementById('scale-container');

  function scaleCard() {
    const containerW = scaleCont.offsetWidth;
    const scale = containerW / CARD_WIDTH;
    cardLive.style.transform = `scale(${scale})`;
  }
  scaleCard();
  window.addEventListener('resize', scaleCard);

  /* ══════════════════════════════════════════
     LIVE TEXT UPDATES
  ══════════════════════════════════════════ */
  function bind(inputId, liveId) {
    const inp  = document.getElementById(inputId);
    const live = document.getElementById(liveId);
    if (!inp || !live) return;
    inp.addEventListener('input', () => { live.textContent = inp.value; });
  }

  bind('inp-header',    'live-header');
  bind('inp-subheader', 'live-subheader');
  bind('inp-name',      'live-name');

  // Name badge
  const nameInp = document.getElementById('inp-name');
  if (nameInp) {
    nameInp.addEventListener('input', () => {
      updateBadge('step-name', nameInp.value.trim().length > 0);
    });
  }

  // Stand / optional
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

  // Occupation allows line breaks + badge
  const occInp = document.getElementById('inp-occupation');
  if (occInp) {
    occInp.addEventListener('input', function() {
      document.getElementById('live-occupation').innerHTML = this.value.replace(/\n/g, '<br>');
      updateBadge('step-title', this.value.trim().length > 0);
    });
  }

  /* ══════════════════════════════════════════
     PORTRAIT PHOTO UPLOAD + DRAG
  ══════════════════════════════════════════ */
  let imgEl      = null;
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

  const floatingZoom       = document.getElementById('floating-zoom');
  const floatingZoomSlider = document.getElementById('floating-zoom-slider');
  const floatingZoomVal    = document.getElementById('floating-zoom-val');

  uploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFile);

  uploadArea.addEventListener('dragover',  e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--accent)'; });
  uploadArea.addEventListener('dragleave', ()  => { uploadArea.style.borderColor = ''; });
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImage(file);
  });

  /* ── Company logo ── */
  const companyUploadArea    = document.getElementById('company-upload-area');
  const fileCompanyInput     = document.getElementById('file-company-input');
  const bannerCompanyImg     = document.getElementById('banner-company-img');
  const bannerLogoPlaceholder = document.getElementById('banner-logo-placeholder');

  if (companyUploadArea && fileCompanyInput) {
    companyUploadArea.addEventListener('click', () => fileCompanyInput.click());
    companyUploadArea.addEventListener('dragover',  e => { e.preventDefault(); companyUploadArea.style.borderColor = 'var(--accent)'; });
    companyUploadArea.addEventListener('dragleave', ()  => { companyUploadArea.style.borderColor = ''; });
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
      imgEl.style.cssText = 'position:absolute;width:100%;height:100%;object-fit:cover;object-position:center;cursor:grab;user-select:none;-webkit-user-drag:none;';
      imgX = 0; imgY = 0; zoom = 100;
      zoomSlider.value = 100;
      zoomVal.textContent = '100%';
      floatingZoomSlider.value = 100;
      floatingZoomVal.textContent = '100%';
      applyTransform();
      photoInner.appendChild(imgEl);
      zoomSection.style.display = 'block';
      floatingZoom.classList.add('active');
      uploadArea.querySelector('p').innerHTML = '<strong>Klik for at ændre foto</strong>';
      updateBadge('step-photo', true);
      enableDrag();
    };
    reader.readAsDataURL(file);
  }

  function loadCompanyImage(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      if (bannerCompanyImg) {
        bannerCompanyImg.src = ev.target.result;
        bannerCompanyImg.style.display = 'block';
      }
      if (bannerLogoPlaceholder) bannerLogoPlaceholder.style.display = 'none';
      companyUploadArea.querySelector('p').innerHTML = '<strong>Klik for at ændre logo</strong>';
      updateBadge('step-logo', true);
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
    photoInner.addEventListener('mousedown',  startDrag);
    photoInner.addEventListener('touchstart', startDragTouch, { passive: false });
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
    e.preventDefault();
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

  zoomSlider.addEventListener('input', function() { updateZoom(this.value); });
  floatingZoomSlider.addEventListener('input', function() { updateZoom(this.value); });

  /* ══════════════════════════════════════════
     BACKGROUND IMAGE
  ══════════════════════════════════════════ */
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

  /* ══════════════════════════════════════════
     DOWNLOAD  (shared logic, two buttons)
  ══════════════════════════════════════════ */
  function doDownload(btn) {
    btn.textContent = '⏳  Genererer…';
    btn.classList.add('loading');

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `position:fixed;left:-20000px;top:0;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;overflow:hidden;`;

    const clone = scaleCont.cloneNode(true);
    clone.style.width  = CARD_WIDTH  + 'px';
    clone.style.height = CARD_HEIGHT + 'px';
    clone.style.boxSizing = 'border-box';

    const clonedCardLive = clone.querySelector('#card-live');
    if (clonedCardLive) {
      clonedCardLive.style.cssText += `;position:absolute;top:0;left:0;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;transform:scale(1);transform-origin:top left;overflow:hidden;`;
    }

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    function fixPhotoInClone() {
      if (!imgEl || !imgEl.src) return Promise.resolve();
      const clonedPhotoInner = clone.querySelector('#photo-inner');
      if (!clonedPhotoInner) return Promise.resolve();

      const photoW = clonedPhotoInner.offsetWidth  || photoInner.offsetWidth;
      const photoH = clonedPhotoInner.offsetHeight || photoInner.offsetHeight;

      return new Promise(resolve => {
        const nativeImg = new Image();
        nativeImg.onload = () => {
          const cvs = document.createElement('canvas');
          cvs.width  = photoW;
          cvs.height = photoH;
          const ctx = cvs.getContext('2d');

          const containScale = Math.min(photoW / nativeImg.naturalWidth, photoH / nativeImg.naturalHeight) * (zoom / 100);
          const scaledW = nativeImg.naturalWidth  * containScale;
          const scaledH = nativeImg.naturalHeight * containScale;
          const drawX = (photoW - scaledW) / 2 + imgX;
          const drawY = (photoH - scaledH) / 2 + imgY;

          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, photoW, photoH);
          ctx.clip();
          ctx.drawImage(nativeImg, drawX, drawY, scaledW, scaledH);
          ctx.restore();

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

        const outputMime = 'image/png';
        const outputExt  = outputMime === 'image/jpeg' ? 'jpg' : 'png';
        const name = document.getElementById('inp-name').value.trim().replace(/\s+/g, '-') || 'attendee';
        const filename = `optimeet-card-${name}.${outputExt}`;

        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

        function fallbackDownload(href, cleanup) {
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
          resetBtn(btn);
        }

        function resetBtn(b) {
          b.textContent = '⬇ \u00a0Hent kort';
          b.classList.remove('loading');
        }

        try {
          if (canvas.toBlob) {
            canvas.toBlob(async blob => {
              if (!blob) throw new Error('toBlob returned null');

              if (isIOS && navigator.share) {
                try {
                  const file = new File([blob], filename, { type: outputMime, lastModified: Date.now() });
                  // iOS: use share sheet so user can choose "Save Image" to Photos.
                  await navigator.share({ files: [file], title: filename });
                  resetBtn(btn);
                  return;
                } catch (shareErr) {
                  if (shareErr.name === 'AbortError') { resetBtn(btn); return; }
                  // If share fails on iOS, open image so user can long-press and save to Photos.
                  const iOSUrl = URL.createObjectURL(blob);
                  window.open(iOSUrl, '_blank', 'noopener');
                  setTimeout(() => URL.revokeObjectURL(iOSUrl), 30000);
                  resetBtn(btn);
                  return;
                }
              }

              if (isIOS && !navigator.share) {
                // Older iOS fallback: open image and let user save to Photos manually.
                const iOSUrl = URL.createObjectURL(blob);
                window.open(iOSUrl, '_blank', 'noopener');
                setTimeout(() => URL.revokeObjectURL(iOSUrl), 30000);
                resetBtn(btn);
                return;
              }

              const url = URL.createObjectURL(blob);
              fallbackDownload(url, () => URL.revokeObjectURL(url));
            }, outputMime);
          } else {
            if (isIOS) {
              const dataUrl = canvas.toDataURL(outputMime);
              const popup = window.open('', '_blank', 'noopener');
              if (popup) {
                popup.document.write(`<img src="${dataUrl}" style="max-width:100%;height:auto;display:block;margin:0 auto;" alt="Optimeet card">`);
                popup.document.close();
              }
              resetBtn(btn);
              return;
            }
            fallbackDownload(canvas.toDataURL(outputMime), null);
          }
        } catch (err) {
          console.error('Download error:', err);
          resetBtn(btn);
          alert('Download mislykkedes pga. en sikkerhedsbegrænsning.');
        }
      }).catch(err => {
        if (wrapper.parentNode) document.body.removeChild(wrapper);
        console.error('html2canvas error:', err);
        resetBtn(btn);
        alert('Download mislykkedes. Åbn DevTools og tjek konsollen for detaljer.');
      });
    });
  }

  // Wire up both buttons
  const btnDesktop = document.getElementById('btn-download');
  const btnMobile  = document.getElementById('btn-download-mobile');
  if (btnDesktop) btnDesktop.addEventListener('click', () => doDownload(btnDesktop));
  if (btnMobile)  btnMobile.addEventListener('click',  () => doDownload(btnMobile));

})();
