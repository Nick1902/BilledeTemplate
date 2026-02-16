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
      imgEl.style.cssText = 'position:absolute;width:100%;height:100%;object-fit:contain;object-position:center;cursor:grab;user-select:none;-webkit-user-drag:none;';
      imgX = 0; imgY = 0; zoom = 100;
      zoomSlider.value = 100;
      zoomVal.textContent = '100%';
      applyTransform();
      photoInner.appendChild(imgEl);
      zoomSection.style.display = 'block';
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

  zoomSlider.addEventListener('input', function() {
    zoom = parseInt(this.value);
    zoomVal.textContent = zoom + '%';
    applyTransform();
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
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-20000px';
    wrapper.style.top = '0';
    wrapper.style.width = CARD_WIDTH + 'px';
    wrapper.style.height = CARD_HEIGHT + 'px';
    wrapper.style.overflow = 'hidden';

    const clone = scaleCont.cloneNode(true);
    clone.style.width = CARD_WIDTH + 'px';
    clone.style.height = CARD_HEIGHT + 'px';
    clone.style.boxSizing = 'border-box';

    const clonedCardLive = clone.querySelector('#card-live');
    if (clonedCardLive) {
      clonedCardLive.style.position = 'absolute';
      clonedCardLive.style.top = '0';
      clonedCardLive.style.left = '0';
      clonedCardLive.style.width = CARD_WIDTH + 'px';
      clonedCardLive.style.height = CARD_HEIGHT + 'px';
      clonedCardLive.style.transform = 'scale(1)';
      clonedCardLive.style.transformOrigin = 'top left';
      clonedCardLive.style.overflow = 'hidden';
    }

    const clonedScaleCont = clone.querySelector('.card-scale-container');
    if (clonedScaleCont) {
      clonedScaleCont.style.width = CARD_WIDTH + 'px';
      clonedScaleCont.style.height = CARD_HEIGHT + 'px';
      clonedScaleCont.style.aspectRatio = '4 / 5';
      clonedScaleCont.style.overflow = 'hidden';
    }

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

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
      // Remove off-screen clone
      document.body.removeChild(wrapper);

      const name = document.getElementById('inp-name').value.trim().replace(/\s+/g, '-') || 'attendee';
      const filename = `optimeet-card-${name}.png`;

      // Prefer binary blob download (more reliable and memory-friendly)
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
          canvas.toBlob(function(blob) {
            if (!blob) {
              throw new Error('toBlob gav ikke en blob');
            }
            const url = URL.createObjectURL(blob);
            finalizeDownload(url, () => URL.revokeObjectURL(url));
          }, 'image/png');
        } else {
          // Fallback: data URL
          const dataUrl = canvas.toDataURL('image/png');
          finalizeDownload(dataUrl, null);
        }
      } catch (err) {
        console.error('Download error:', err);
        btn.textContent = '⬇ \u00a0Hent kort';
        btn.classList.remove('loading');
        alert('Download mislykkedes pga. en sikkerhedsbegrænsning. Åbn DevTools for at se fejlen, eller prøv at genindlæse siden.');
      }
    }).catch((err) => {
      if (wrapper.parentNode) document.body.removeChild(wrapper);
      console.error('html2canvas error:', err);
      btn.textContent = '⬇ \u00a0Hent kort';
      btn.classList.remove('loading');
      alert('Download mislykkedes. Åbn DevTools og tjek konsollen for detaljer.');
    });
  });

})();
