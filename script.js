(() => {
  const CARD_WIDTH = 800;
  const CARD_HEIGHT = 1000;
  const MAX_LOGO_UPLOAD_WIDTH = 2000;
  const MAX_LOGO_UPLOAD_HEIGHT = 2000;
  const BG_IMAGE_URL = './baggrund.jpg';

  const byId = (id) => document.getElementById(id);

  const dom = {
    editPane: byId('pane-edit'),
    previewPane: byId('pane-preview'),
    tabEditBtn: byId('tab-edit-btn'),
    tabPreviewBtn: byId('tab-preview-btn'),
    cardLive: byId('card-live'),
    scaleContainer: byId('scale-container'),
    cardBg: byId('card-bg'),

    headerInput: byId('inp-header'),
    liveHeader: byId('live-header'),
    nameInput: byId('inp-name'),
    liveName: byId('live-name'),

    photoInner: byId('photo-inner'),
    photoPlaceholder: byId('photo-placeholder'),
    uploadArea: byId('upload-area'),
    fileInput: byId('file-input'),
    zoomSection: byId('zoom-section'),
    zoomSlider: byId('zoom-slider'),
    zoomVal: byId('zoom-val'),
    floatingZoom: byId('floating-zoom'),
    floatingZoomSlider: byId('floating-zoom-slider'),
    floatingZoomVal: byId('floating-zoom-val'),

    companyUploadArea: byId('company-upload-area'),
    fileCompanyInput: byId('file-company-input'),
    bannerCompanyImg: byId('banner-company-img'),
    bannerLogoPlaceholder: byId('banner-logo-placeholder'),
    logoSizeSection: byId('logo-size-section'),
    logoSizeSlider: byId('logo-size-slider'),
    logoSizeVal: byId('logo-size-val'),
    floatingLogoSizeSection: byId('floating-logo-size'),
    floatingLogoSizeSlider: byId('floating-logo-size-slider'),
    floatingLogoSizeVal: byId('floating-logo-size-val'),

    btnDesktop: byId('btn-download'),
    btnMobile: byId('btn-download-mobile')
  };

  let imgEl = null;
  let dragActive = false;
  let lastX = 0;
  let lastY = 0;
  let imgX = 0;
  let imgY = 0;
  let zoom = 100;
  let logoScale = 100;
  let photoDragBound = false;

  window.switchTab = (tab) => {
    if (!dom.editPane || !dom.previewPane || !dom.tabEditBtn || !dom.tabPreviewBtn) return;

    const showEdit = tab === 'edit';
    dom.editPane.classList.toggle('tab-active', showEdit);
    dom.previewPane.classList.toggle('tab-active', !showEdit);
    dom.tabEditBtn.classList.toggle('active', showEdit);
    dom.tabPreviewBtn.classList.toggle('active', !showEdit);

    if (!showEdit) scaleCard();
  };

  function scaleCard() {
    if (!dom.scaleContainer || !dom.cardLive) return;
    const scale = dom.scaleContainer.offsetWidth / CARD_WIDTH;
    dom.cardLive.style.transform = `scale(${scale})`;
  }

  function bindLiveText(input, target) {
    if (!input || !target) return;
    input.addEventListener('input', () => {
      target.textContent = input.value;
    });
  }

  function updateHeaderPreview() {
    if (!dom.headerInput || !dom.liveHeader) return;

    const value = dom.headerInput.value || '';
    const trimmed = value.trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
    const charCount = value.replace(/\s+/g, '').length;

    let fontSize = 50;
    if (wordCount > 8) fontSize = 46;
    if (wordCount > 12) fontSize = 42;
    if (wordCount > 16) fontSize = 38;
    if (wordCount > 20) fontSize = 34;
    if (charCount > 70) fontSize = Math.min(fontSize, 36);
    if (charCount > 90) fontSize = Math.min(fontSize, 32);

    dom.liveHeader.textContent = value;
    dom.liveHeader.style.fontSize = `${fontSize}px`;
    dom.liveHeader.style.lineHeight = fontSize <= 36 ? '1.08' : '1.04';
  }

  function setUploadAreaHighlight(area, active) {
    if (!area) return;
    area.style.borderColor = active ? 'var(--accent)' : '';
  }

  function setupUploadArea({ area, input, onFile }) {
    if (!area || !input) return;

    area.addEventListener('click', () => input.click());

    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      setUploadAreaHighlight(area, true);
    });

    area.addEventListener('dragleave', () => {
      setUploadAreaHighlight(area, false);
    });

    area.addEventListener('drop', (e) => {
      e.preventDefault();
      setUploadAreaHighlight(area, false);
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) onFile(file);
    });

    input.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    });
  }

  function applyTransform() {
    if (!imgEl) return;
    const scale = zoom / 100;
    imgEl.style.transform = `translate(${imgX}px, ${imgY}px) scale(${scale})`;
    imgEl.style.objectFit = 'contain';
  }

  function startDrag(e) {
    e.preventDefault();
    dragActive = true;
    lastX = e.clientX;
    lastY = e.clientY;
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
    if (!dragActive || !dom.scaleContainer) return;
    const scale = dom.scaleContainer.offsetWidth / CARD_WIDTH;
    imgX += (e.clientX - lastX) / scale;
    imgY += (e.clientY - lastY) / scale;
    lastX = e.clientX;
    lastY = e.clientY;
    applyTransform();
  }

  function onDragTouch(e) {
    if (!dragActive || e.touches.length !== 1 || !dom.scaleContainer) return;
    e.preventDefault();
    const scale = dom.scaleContainer.offsetWidth / CARD_WIDTH;
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

  function bindPhotoDragHandlers() {
    if (!dom.photoInner || photoDragBound) return;
    dom.photoInner.addEventListener('mousedown', startDrag);
    dom.photoInner.addEventListener('touchstart', startDragTouch, { passive: false });
    photoDragBound = true;
  }

  function updateZoom(value) {
    zoom = parseInt(value, 10) || 100;
    const zoomText = `${zoom}%`;

    if (dom.zoomVal) dom.zoomVal.textContent = zoomText;
    if (dom.floatingZoomVal) dom.floatingZoomVal.textContent = zoomText;
    if (dom.zoomSlider) dom.zoomSlider.value = String(zoom);
    if (dom.floatingZoomSlider) dom.floatingZoomSlider.value = String(zoom);

    applyTransform();
  }

  function loadImage(file) {
    if (!dom.photoInner || !dom.photoPlaceholder) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      dom.photoPlaceholder.style.display = 'none';

      if (imgEl) imgEl.remove();
      imgEl = document.createElement('img');
      imgEl.src = ev.target?.result;
      imgEl.style.cssText = 'position:absolute;width:100%;height:100%;object-fit:cover;object-position:center;cursor:grab;user-select:none;-webkit-user-drag:none;';

      imgX = 0;
      imgY = 0;
      zoom = 100;
      updateZoom(100);
      applyTransform();

      dom.photoInner.appendChild(imgEl);

      if (dom.zoomSection) dom.zoomSection.style.display = 'block';
      if (dom.floatingZoom) dom.floatingZoom.classList.add('active');
      if (dom.uploadArea) {
        const text = dom.uploadArea.querySelector('p');
        if (text) text.innerHTML = '<strong>Klik for at skifte foto</strong>';
      }

      bindPhotoDragHandlers();
    };

    reader.readAsDataURL(file);
  }

  function applyLogoSize() {
    if (!dom.bannerCompanyImg) return;

    const maxWidth = Math.round(160 * (logoScale / 100));
    const maxHeight = Math.round(100 * (logoScale / 100));

    dom.bannerCompanyImg.style.maxWidth = `${maxWidth}px`;
    dom.bannerCompanyImg.style.maxHeight = `${maxHeight}px`;

    if (dom.logoSizeSlider) dom.logoSizeSlider.value = String(logoScale);
    if (dom.logoSizeVal) dom.logoSizeVal.textContent = `${logoScale}%`;
    if (dom.floatingLogoSizeSlider) dom.floatingLogoSizeSlider.value = String(logoScale);
    if (dom.floatingLogoSizeVal) dom.floatingLogoSizeVal.textContent = `${logoScale}%`;
  }

  function loadCompanyImage(file) {
    const probeUrl = URL.createObjectURL(file);
    const probeImg = new Image();

    probeImg.onload = () => {
      const tooLarge = probeImg.naturalWidth > MAX_LOGO_UPLOAD_WIDTH || probeImg.naturalHeight > MAX_LOGO_UPLOAD_HEIGHT;
      URL.revokeObjectURL(probeUrl);

      if (tooLarge) {
        alert(`Logoet er for stort (${probeImg.naturalWidth}x${probeImg.naturalHeight}px). Maks er ${MAX_LOGO_UPLOAD_WIDTH}x${MAX_LOGO_UPLOAD_HEIGHT}px.`);
        if (dom.fileCompanyInput) dom.fileCompanyInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (dom.bannerCompanyImg) {
          dom.bannerCompanyImg.src = ev.target?.result;
          dom.bannerCompanyImg.style.display = 'block';
        }

        if (dom.bannerLogoPlaceholder) dom.bannerLogoPlaceholder.style.display = 'none';

        logoScale = 100;
        applyLogoSize();

        if (dom.logoSizeSection) dom.logoSizeSection.style.display = 'block';
        if (dom.floatingLogoSizeSection) dom.floatingLogoSizeSection.classList.add('active');

        if (dom.companyUploadArea) {
          const text = dom.companyUploadArea.querySelector('p');
          if (text) text.innerHTML = '<strong>Klik for at ændre logo</strong>';
        }
      };

      reader.readAsDataURL(file);
    };

    probeImg.onerror = () => {
      URL.revokeObjectURL(probeUrl);
      alert('Kunne ikke læse logo-filen.');
      if (dom.fileCompanyInput) dom.fileCompanyInput.value = '';
    };

    probeImg.src = probeUrl;
  }

  function setBackgroundImage() {
    if (!dom.cardBg || !BG_IMAGE_URL) return;
    dom.cardBg.style.backgroundImage = `
      linear-gradient(160deg, rgba(10,14,50,0.72) 0%, rgba(20,10,60,0.55) 50%, rgba(5,5,20,0.85) 100%),
      url('${BG_IMAGE_URL}')
    `;
    dom.cardBg.style.backgroundSize = 'cover';
    dom.cardBg.style.backgroundPosition = 'center';
  }

  function resetDownloadButton(btn) {
    if (!btn) return;
    const originalHtml = btn.dataset.defaultHtml;
    if (originalHtml) {
      btn.innerHTML = originalHtml;
    } else {
      btn.textContent = '⬇ Hent billede';
    }
    btn.classList.remove('loading');
  }

  function createDownloadFallback({ href, filename, cleanup, button }) {
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        link.remove();
      } catch (_) {
        // no-op
      }
      if (cleanup) cleanup();
    }, 1000);

    resetDownloadButton(button);
  }

  function fixPhotoInClone(clone) {
    if (!imgEl || !imgEl.src || !dom.photoInner) return Promise.resolve();

    const clonedPhotoInner = clone.querySelector('#photo-inner');
    if (!clonedPhotoInner) return Promise.resolve();

    const photoW = clonedPhotoInner.offsetWidth || dom.photoInner.offsetWidth;
    const photoH = clonedPhotoInner.offsetHeight || dom.photoInner.offsetHeight;

    return new Promise((resolve) => {
      const nativeImg = new Image();
      nativeImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = photoW;
        canvas.height = photoH;

        const ctx = canvas.getContext('2d');
        const containScale = Math.min(photoW / nativeImg.naturalWidth, photoH / nativeImg.naturalHeight) * (zoom / 100);
        const scaledW = nativeImg.naturalWidth * containScale;
        const scaledH = nativeImg.naturalHeight * containScale;
        const drawX = (photoW - scaledW) / 2 + imgX;
        const drawY = (photoH - scaledH) / 2 + imgY;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, photoW, photoH);
        ctx.clip();
        ctx.drawImage(nativeImg, drawX, drawY, scaledW, scaledH);
        ctx.restore();

        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';

        const clonedImg = clonedPhotoInner.querySelector('img');
        if (clonedImg) clonedImg.remove();

        clonedPhotoInner.appendChild(canvas);
        resolve();
      };

      nativeImg.src = imgEl.src;
    });
  }

  function doDownload(btn) {
    if (!btn || !dom.scaleContainer) return;

    btn.textContent = '⏳ Genererer...';
    btn.classList.add('loading');

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `position:fixed;left:-20000px;top:0;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;overflow:hidden;`;

    const clone = dom.scaleContainer.cloneNode(true);
    clone.style.width = `${CARD_WIDTH}px`;
    clone.style.height = `${CARD_HEIGHT}px`;
    clone.style.boxSizing = 'border-box';

    const clonedCardLive = clone.querySelector('#card-live');
    if (clonedCardLive) {
      clonedCardLive.style.cssText += `;position:absolute;top:0;left:0;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;transform:scale(1);transform-origin:top left;overflow:hidden;`;
    }

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    fixPhotoInClone(clone).then(() => {
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
      }).then((canvas) => {
        document.body.removeChild(wrapper);

        const outputMime = 'image/png';
        const outputExt = 'png';
        const rawName = dom.nameInput ? dom.nameInput.value.trim() : '';
        const safeName = rawName.replace(/\s+/g, '-') || 'attendee';
        const filename = `optimeet-card-${safeName}.${outputExt}`;
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

        try {
          if (canvas.toBlob) {
            canvas.toBlob(async (blob) => {
              if (!blob) throw new Error('toBlob returned null');

              if (isIOS && navigator.share) {
                try {
                  const file = new File([blob], filename, { type: outputMime, lastModified: Date.now() });
                  await navigator.share({ files: [file], title: filename });
                  resetDownloadButton(btn);
                  return;
                } catch (shareErr) {
                  if (shareErr.name === 'AbortError') {
                    resetDownloadButton(btn);
                    return;
                  }

                  const iOSUrl = URL.createObjectURL(blob);
                  window.open(iOSUrl, '_blank', 'noopener');
                  setTimeout(() => URL.revokeObjectURL(iOSUrl), 30000);
                  resetDownloadButton(btn);
                  return;
                }
              }

              if (isIOS) {
                const iOSUrl = URL.createObjectURL(blob);
                window.open(iOSUrl, '_blank', 'noopener');
                setTimeout(() => URL.revokeObjectURL(iOSUrl), 30000);
                resetDownloadButton(btn);
                return;
              }

              const url = URL.createObjectURL(blob);
              createDownloadFallback({
                href: url,
                filename,
                cleanup: () => URL.revokeObjectURL(url),
                button: btn
              });
            }, outputMime);
          } else {
            if (isIOS) {
              const dataUrl = canvas.toDataURL(outputMime);
              const popup = window.open('', '_blank', 'noopener');
              if (popup) {
                popup.document.write(`<img src="${dataUrl}" style="max-width:100%;height:auto;display:block;margin:0 auto;" alt="Optimeet card">`);
                popup.document.close();
              }
              resetDownloadButton(btn);
              return;
            }

            createDownloadFallback({
              href: canvas.toDataURL(outputMime),
              filename,
              cleanup: null,
              button: btn
            });
          }
        } catch (err) {
          console.error('Download error:', err);
          resetDownloadButton(btn);
          alert('Download mislykkedes pga. en sikkerhedsbegrænsning.');
        }
      }).catch((err) => {
        if (wrapper.parentNode) document.body.removeChild(wrapper);
        console.error('html2canvas error:', err);
        resetDownloadButton(btn);
        alert('Download mislykkedes. Åbn DevTools og tjek konsollen for detaljer.');
      });
    });
  }

  function init() {
    scaleCard();
    window.addEventListener('resize', scaleCard);

    document.querySelectorAll('[data-switch-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        const tab = button.getAttribute('data-switch-tab');
        if (tab) window.switchTab(tab);
      });
    });

    bindLiveText(dom.nameInput, dom.liveName);

    if (dom.headerInput && dom.liveHeader) {
      dom.headerInput.addEventListener('input', updateHeaderPreview);
      updateHeaderPreview();
    }

    setupUploadArea({ area: dom.uploadArea, input: dom.fileInput, onFile: loadImage });
    setupUploadArea({ area: dom.companyUploadArea, input: dom.fileCompanyInput, onFile: loadCompanyImage });

    if (dom.zoomSlider) dom.zoomSlider.addEventListener('input', function onInput() { updateZoom(this.value); });
    if (dom.floatingZoomSlider) dom.floatingZoomSlider.addEventListener('input', function onInput() { updateZoom(this.value); });

    if (dom.logoSizeSlider) {
      dom.logoSizeSlider.addEventListener('input', function onInput() {
        logoScale = parseInt(this.value, 10) || 100;
        applyLogoSize();
      });
    }

    if (dom.floatingLogoSizeSlider) {
      dom.floatingLogoSizeSlider.addEventListener('input', function onInput() {
        logoScale = parseInt(this.value, 10) || 100;
        applyLogoSize();
      });
    }

    setBackgroundImage();

    [dom.btnDesktop, dom.btnMobile].forEach((btn) => {
      if (!btn) return;
      btn.dataset.defaultHtml = btn.innerHTML;
      btn.addEventListener('click', () => doDownload(btn));
    });
  }

  init();
})();
