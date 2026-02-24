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
  let lastViewportWidth = window.innerWidth;

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

  // FORBEDRET: Åbn billede i ny fane med korrekt HTML/CSS til iOS
  function openImageInNewTabFromCanvas(canvas) {
    // Konverter canvas til blob først (bedre for iOS)
    canvas.toBlob((blob) => {
      if (!blob) {
        alert('Kunne ikke generere billede til visning.');
        return;
      }
      
      // Lav en blob URL til billedet
      const imageUrl = URL.createObjectURL(blob);
      
      // Lav korrekt HTML til iOS med optimeret CSS
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Optimeet Card</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    
    html, body {
      width: 100%;
      min-height: 100vh;
      overflow: auto;
    }
    
    body {
      background: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      
      /* Forhindre tekstmarkering på body */
      user-select: none;
      -webkit-user-select: none;
    }
    
    img {
      max-width: 100%;
      height: auto;
      display: block;
      border-radius: 4px;
      
      /* KRITISK: Disse properties tillader iOS long-press */
      -webkit-user-select: none;
      -webkit-touch-callout: default;
      user-select: none;
      pointer-events: auto;
    }
    
    .instruction {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 14px 24px;
      border-radius: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      font-size: 15px;
      text-align: center;
      z-index: 1000;
      animation: fadeOut 5s ease-in-out forwards;
      pointer-events: none;
      max-width: 90%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    
    @keyframes fadeOut {
      0%, 60% { opacity: 1; }
      100% { opacity: 0; }
    }
  </style>
</head>
<body>
  <img src="${imageUrl}" alt="Optimeet Card">
  <div class="instruction">👆 Hold fingeren på billedet og vælg "Gem billede"</div>
</body>
</html>`;

      // Åbn i ny fane
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.open();
        newTab.document.write(htmlContent);
        newTab.document.close();
      } else {
        alert('Tillad popups i Safari for at åbne billedet.');
      }
    }, 'image/png');
  }

  // FORBEDRET: Vis fallback-besked hvis share fejler
  function showIOSFallbackNotice(canvas, button, file) {
    const existing = byId('ios-download-fallback');
    if (existing) existing.remove();

    const box = document.createElement('div');
    box.id = 'ios-download-fallback';
    box.style.cssText = [
      'position:fixed',
      'left:16px',
      'right:16px',
      'bottom:80px',
      'z-index:9999',
      'background:rgba(8,10,24,0.98)',
      'border:2px solid rgba(255,255,255,0.2)',
      'border-radius:16px',
      'padding:20px',
      'color:#fff',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif',
      'font-size:15px',
      'line-height:1.5',
      'box-shadow:0 8px 32px rgba(0,0,0,0.4)'
    ].join(';');

    const title = document.createElement('div');
    title.textContent = '📤 Vælg hvordan du vil gemme';
    title.style.cssText = 'font-weight:600;margin-bottom:16px;font-size:16px;text-align:center;';

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

    // Knap 1: Prøv deling igen
    const shareAgain = document.createElement('button');
    shareAgain.type = 'button';
    shareAgain.innerHTML = '📤 Prøv deling igen';
    shareAgain.style.cssText = 'padding:14px;background:#007AFF;color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:opacity 0.2s;';
    
    shareAgain.addEventListener('touchstart', () => {
      shareAgain.style.opacity = '0.7';
    });
    
    shareAgain.addEventListener('touchend', () => {
      shareAgain.style.opacity = '1';
    });

    shareAgain.addEventListener('click', async () => {
      if (!navigator.share) {
        alert('Deling understøttes ikke på denne enhed.');
        return;
      }

      try {
        await navigator.share({ 
          files: [file], 
          title: 'Optimeet card'
        });
        box.remove();
        resetDownloadButton(button);
      } catch (err) {
        if (err.name === 'AbortError') {
          // Bruger annullerede - lad boksen blive
          return;
        }
        console.error('Share error:', err);
        alert('Deling mislykkedes. Prøv "Åbn billede" i stedet.');
      }
    });

    // Knap 2: Åbn i ny fane
    const openTab = document.createElement('button');
    openTab.type = 'button';
    openTab.innerHTML = '🖼️ Åbn billede (hold &amp; gem)';
    openTab.style.cssText = 'padding:14px;background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:opacity 0.2s;';
    
    openTab.addEventListener('touchstart', () => {
      openTab.style.opacity = '0.7';
    });
    
    openTab.addEventListener('touchend', () => {
      openTab.style.opacity = '1';
    });

    openTab.addEventListener('click', () => {
      openImageInNewTabFromCanvas(canvas);
      box.remove();
      resetDownloadButton(button);
    });

    // Luk knap
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'position:absolute;top:8px;right:8px;background:transparent;border:none;color:rgba(255,255,255,0.6);font-size:20px;cursor:pointer;padding:4px 8px;';
    
    closeBtn.addEventListener('click', () => {
      box.remove();
      resetDownloadButton(button);
    });

    btnContainer.appendChild(shareAgain);
    btnContainer.appendChild(openTab);
    
    box.appendChild(closeBtn);
    box.appendChild(title);
    box.appendChild(btnContainer);
    document.body.appendChild(box);

    // Auto-fjern efter 20 sekunder
    setTimeout(() => {
      if (box.parentNode) {
        box.remove();
        resetDownloadButton(button);
      }
    }, 20000);
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

  function waitForDocumentFonts(timeoutMs = 3000) {
    if (!document.fonts || !document.fonts.ready) return Promise.resolve();
    return Promise.race([
      document.fonts.ready.catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, timeoutMs))
    ]);
  }

  function waitForImages(root, timeoutMs = 5000) {
    const images = Array.from(root.querySelectorAll('img')).filter((img) => Boolean(img.src));
    if (images.length === 0) return Promise.resolve();

    return Promise.all(images.map((img) => new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve();
        return;
      }

      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        img.removeEventListener('load', done);
        img.removeEventListener('error', done);
        resolve();
      };

      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
      setTimeout(done, timeoutMs);
    })));
  }

  function renderCardCanvas(target, scale) {
    return html2canvas(target, {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      imageTimeout: 15000
    });
  }

  // FORBEDRET: iOS download med ALTID share først, derefter fallback
  function doDownload(btn) {
    if (!btn || !dom.scaleContainer) return;

    btn.textContent = '⏳ Genererer...';
    btn.classList.add('loading');

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

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

    (async () => {
      try {
        await fixPhotoInClone(clone);
        await waitForDocumentFonts();
        await waitForImages(clone);

        const target = clonedCardLive || clone;
        const preferredScale = Math.max(2, Math.round(window.devicePixelRatio || 2));
        let canvas;

        try {
          canvas = await renderCardCanvas(target, preferredScale);
        } catch (firstErr) {
          console.warn('Primary html2canvas render failed, retrying with lower scale.', firstErr);
          canvas = await renderCardCanvas(target, 1);
        }

        if (wrapper.parentNode) document.body.removeChild(wrapper);

        const rawName = dom.nameInput ? dom.nameInput.value.trim() : '';
        const safeName = rawName.replace(/\s+/g, '-') || 'attendee';
        const filename = `optimeet-card-${safeName}.png`;

        // IOS: ALTID forsøg share først
        if (isIOS) {
          canvas.toBlob(async (blob) => {
            if (!blob) {
              resetDownloadButton(btn);
              alert('Kunne ikke generere billede.');
              return;
            }

            const file = new File([blob], filename, { type: 'image/png' });
            
            // Forsøg share direkte - dette skulle virke første gang
            if (navigator.share) {
              try {
                await navigator.share({ 
                  files: [file],
                  title: 'Optimeet card'
                });
                resetDownloadButton(btn);
                return;
              } catch (err) {
                // Hvis bruger annullerede (AbortError), reset knap og stop
                if (err.name === 'AbortError') {
                  resetDownloadButton(btn);
                  return;
                }
                
                // Ved andre fejl, vis fallback-valgmuligheder
                console.warn('Share failed:', err);
                showIOSFallbackNotice(canvas, btn, file);
                return;
              }
            }
            
            // Hvis share slet ikke er tilgængelig, vis fallback direkte
            showIOSFallbackNotice(canvas, btn, file);
          }, 'image/png');
          return;
        }

        // DESKTOP/ANDROID: Brug normal download
        const outputMime = 'image/png';
        try {
          if (canvas.toBlob) {
            canvas.toBlob(async (blob) => {
              if (!blob) {
                console.error('toBlob returned null');
                resetDownloadButton(btn);
                alert('Download mislykkedes. Prøv igen.');
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
      } catch (err) {
        if (wrapper.parentNode) document.body.removeChild(wrapper);
        console.error('html2canvas error:', err);
        resetDownloadButton(btn);
        alert('Download mislykkedes. Prøv igen.');
      }
    })();
  }

  function init() {
    scaleCard();
    window.addEventListener('resize', () => {
      const currentWidth = window.innerWidth;
      if (Math.abs(currentWidth - lastViewportWidth) < 1) return;
      lastViewportWidth = currentWidth;
      scaleCard();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        lastViewportWidth = window.innerWidth;
        scaleCard();
      }, 120);
    });

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