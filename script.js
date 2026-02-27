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
    titleInput: byId('title-input'),
    subtitleInput: byId('subtitle-input'),
    nameInput: byId('name-input'),
    titleLive: byId('live-title'),
    subtitleLive: byId('live-subtitle'),
    liveName: byId('live-name'),
    logoUpload: byId('logo-upload'),
    liveLogo: byId('live-logo'),
    logoRemoveBtn: byId('logo-remove-btn'),
    logoHint: byId('logo-hint'),
    photoUpload: byId('photo-upload'),
    photoRemoveBtn: byId('photo-remove-btn'),
    livePhoto: byId('live-photo'),
    downloadBtn: byId('download-btn'),
    downloadBtnIOS: byId('download-btn-ios'),
    iosSaveModal: byId('ios-save-modal'),
    iosCloseBtn: byId('ios-close-btn'),
    iosOpenNewTabBtn: byId('ios-open-new-tab-btn'),
    iosShareBtn: byId('ios-share-btn'),
    iosDownloadBtn: byId('ios-download-btn'),
    downloadTip: byId('download-tip'),
    headerInput: byId('header-input'),
    liveHeader: byId('live-header'),
    headerColor: byId('header-color'),
    nameSize: byId('name-size'),
    headerSize: byId('header-size'),
    titleSize: byId('title-size'),
    subtitleSize: byId('subtitle-size'),
    headerWeight: byId('header-weight'),
    titleWeight: byId('title-weight'),
    subtitleWeight: byId('subtitle-weight'),
    nameWeight: byId('name-weight'),
    headerLetterSpacing: byId('header-letter-spacing'),
    titleLetterSpacing: byId('title-letter-spacing'),
    subtitleLetterSpacing: byId('subtitle-letter-spacing'),
    nameLetterSpacing: byId('name-letter-spacing'),
    headerLineHeight: byId('header-line-height'),
    titleLineHeight: byId('title-line-height'),
    subtitleLineHeight: byId('subtitle-line-height'),
    nameLineHeight: byId('name-line-height'),
    headerUppercase: byId('header-uppercase'),
    titleUppercase: byId('title-uppercase'),
    subtitleUppercase: byId('subtitle-uppercase'),
    nameUppercase: byId('name-uppercase'),
    headerAlign: byId('header-align'),
    titleAlign: byId('title-align'),
    subtitleAlign: byId('subtitle-align'),
    nameAlign: byId('name-align')
  };

  let uploadedLogoUrl = null;
  let uploadedPhotoUrl = null;
  let lastViewportWidth = window.innerWidth;

  const nextFrame = () =>
    new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function resetDownloadButton(btn) {
    if (!btn) return;
    btn.textContent = '⬇️ Download (PNG)';
    btn.classList.remove('loading');
  }

  function createDownloadFallback({ href, filename, cleanup, button }) {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);

    // Some browsers are stricter about dispatchEvent; keep link.click too:
    try {
      link.click();
    } catch (_) {
      try {
        link.dispatchEvent(
          new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          })
        );
      } catch (__) {}
    }

    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch (_) {}
      if (cleanup) cleanup();
    }, 1000);

    resetDownloadButton(button);
  }

  function openImageInNewTabFromCanvas(canvas, preOpenedTab = null) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        const blobUrl = URL.createObjectURL(blob);
        const w = preOpenedTab && !preOpenedTab.closed ? preOpenedTab : window.open('', '_blank');
        if (!w) {
          URL.revokeObjectURL(blobUrl);
          resolve(false);
          return;
        }

        w.document.open();
        w.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>image</title></head><body style="margin:0;background:#fff;"><img src="${blobUrl}" alt="" style="display:block;width:100%;height:auto;user-select:none;-webkit-user-select:none;"></body></html>`);
        w.document.close();
        setTimeout(() => {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (_) {
            // no-op
          }
        }, 60000);
        resolve(true);
      }, 'image/png');
    });
  }

  // Desktop-safe download: open a tab synchronously (user gesture), then populate it with
  // the generated image and a "Download" link the user can click.
  function openImageWithDownloadLinkFromCanvas(canvas, filename, preOpenedTab = null) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        const blobUrl = URL.createObjectURL(blob);
        const w = preOpenedTab && !preOpenedTab.closed ? preOpenedTab : window.open('', '_blank');
        if (!w) {
          URL.revokeObjectURL(blobUrl);
          resolve(false);
          return;
        }

        const safeTitle = (filename || 'image').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        w.document.open();
        w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${safeTitle}</title>
</head>
<body style="margin:0;font-family:system-ui;background:#0b0b0b;color:#fff;">
  <div style="position:sticky;top:0;padding:12px;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);display:flex;gap:12px;align-items:center;">
    <a id="dl" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#4f7aff;color:#fff;text-decoration:none;font-weight:700;">
      Download PNG
    </a>
    <span style="opacity:.8;font-size:13px;">
      If it doesn’t download, right-click the image and choose “Save image as…”
    </span>
  </div>
  <img src="${blobUrl}" alt="" style="display:block;width:100%;height:auto;user-select:none;-webkit-user-select:none;">
  <script>
    const a = document.getElementById('dl');
    a.href = "${blobUrl}";
    a.download = ${JSON.stringify(filename || 'image.png')};
  </script>
</body>
</html>`);
        w.document.close();

        // Cleanup later
        setTimeout(() => {
          try { URL.revokeObjectURL(blobUrl); } catch (_) {}
        }, 60000);

        resolve(true);
      }, 'image/png');
    });
  }

  function showIOSSaveOptions({ file, canvas, button }) {
    if (!dom.iosSaveModal) {
      resetDownloadButton(button);
      alert('iOS modal mangler i HTML.');
      return;
    }

    dom.iosSaveModal.classList.add('open');

    const close = () => {
      dom.iosSaveModal.classList.remove('open');
    };

    const cleanupListeners = () => {
      if (dom.iosCloseBtn) dom.iosCloseBtn.onclick = null;
      if (dom.iosOpenNewTabBtn) dom.iosOpenNewTabBtn.onclick = null;
      if (dom.iosShareBtn) dom.iosShareBtn.onclick = null;
      if (dom.iosDownloadBtn) dom.iosDownloadBtn.onclick = null;
    };

    const finish = () => {
      cleanupListeners();
      close();
      resetDownloadButton(button);
    };

    if (dom.iosCloseBtn) {
      dom.iosCloseBtn.onclick = () => finish();
    }

    if (dom.iosOpenNewTabBtn) {
      dom.iosOpenNewTabBtn.onclick = async () => {
        const ok = await openImageInNewTabFromCanvas(canvas);
        if (!ok) alert('Pop-up blev blokeret. Tillad pop-ups og prøv igen.');
        finish();
      };
    }

    if (dom.iosShareBtn) {
      dom.iosShareBtn.onclick = async () => {
        try {
          if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
            alert('Deling er ikke understøttet på denne enhed.');
            return;
          }
          await navigator.share({
            files: [file],
            title: file.name,
            text: 'Optimeet badge'
          });
          finish();
        } catch (err) {
          console.warn('Share canceled or failed', err);
          // Let user try other option without closing automatically
        }
      };
    }

    if (dom.iosDownloadBtn) {
      dom.iosDownloadBtn.onclick = async () => {
        try {
          const url = URL.createObjectURL(file);
          createDownloadFallback({
            href: url,
            filename: file.name,
            cleanup: () => URL.revokeObjectURL(url),
            button
          });
          finish();
        } catch (err) {
          console.error(err);
          alert('Kunne ikke starte download.');
        }
      };
    }
  }

  function switchTab(name) {
    if (!dom.editPane || !dom.previewPane) return;

    const showPreview = name === 'preview';

    dom.editPane.hidden = showPreview;
    dom.previewPane.hidden = !showPreview;

    if (dom.tabEditBtn) dom.tabEditBtn.classList.toggle('active', !showPreview);
    if (dom.tabPreviewBtn) dom.tabPreviewBtn.classList.toggle('active', showPreview);

    scaleCard();
  }

  function scaleCard() {
    if (!dom.scaleContainer) return;

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const padding = 28;
    const maxW = viewportW - padding * 2;
    const maxH = viewportH - 240;

    const scaleX = maxW / CARD_WIDTH;
    const scaleY = maxH / CARD_HEIGHT;
    const scale = Math.min(scaleX, scaleY, 1);

    dom.scaleContainer.style.transform = `scale(${scale})`;
    dom.scaleContainer.style.transformOrigin = 'top center';
  }

  function bindLiveText(input, output) {
    if (!input || !output) return;
    const sync = () => {
      output.textContent = input.value || '';
    };
    input.addEventListener('input', sync);
    sync();
  }

  function bindRange(input, outputEl, cssVar, suffix = '') {
    if (!input || !outputEl) return;
    const sync = () => {
      const value = input.value;
      outputEl.textContent = `${value}${suffix}`;
      document.documentElement.style.setProperty(cssVar, `${value}${suffix}`);
    };
    input.addEventListener('input', sync);
    sync();
  }

  function bindSelect(input, cssVar) {
    if (!input) return;
    const sync = () => {
      document.documentElement.style.setProperty(cssVar, input.value);
    };
    input.addEventListener('change', sync);
    sync();
  }

  function bindToggle(input, cssVar, onVal, offVal) {
    if (!input) return;
    const sync = () => {
      document.documentElement.style.setProperty(cssVar, input.checked ? onVal : offVal);
    };
    input.addEventListener('change', sync);
    sync();
  }

  function loadImageFromFile(file, maxW, maxH) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const scale = Math.min(1, maxW / w, maxH / h);
        const outW = Math.round(w * scale);
        const outH = Math.round(h * scale);

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, outW, outH);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error('Blob conversion failed'));
              return;
            }
            resolve({
              blob,
              url: URL.createObjectURL(blob)
            });
          },
          'image/png',
          0.95
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load failed'));
      };
      img.src = url;
    });
  }

  async function handleLogoUpload(file) {
    try {
      const result = await loadImageFromFile(file, MAX_LOGO_UPLOAD_WIDTH, MAX_LOGO_UPLOAD_HEIGHT);
      if (!result) return;

      if (uploadedLogoUrl) URL.revokeObjectURL(uploadedLogoUrl);
      uploadedLogoUrl = result.url;

      if (dom.liveLogo) {
        dom.liveLogo.src = uploadedLogoUrl;
        dom.liveLogo.classList.remove('hidden');
      }
      if (dom.logoRemoveBtn) dom.logoRemoveBtn.hidden = false;
      if (dom.logoHint) dom.logoHint.hidden = true;
    } catch (err) {
      console.error(err);
      alert('Kunne ikke indlæse logo.');
    }
  }

  function removeLogo() {
    if (uploadedLogoUrl) {
      URL.revokeObjectURL(uploadedLogoUrl);
      uploadedLogoUrl = null;
    }
    if (dom.liveLogo) {
      dom.liveLogo.src = '';
      dom.liveLogo.classList.add('hidden');
    }
    if (dom.logoRemoveBtn) dom.logoRemoveBtn.hidden = true;
    if (dom.logoHint) dom.logoHint.hidden = false;
    if (dom.logoUpload) dom.logoUpload.value = '';
  }

  async function handlePhotoUpload(file) {
    try {
      const result = await loadImageFromFile(file, 2000, 2000);
      if (!result) return;

      if (uploadedPhotoUrl) URL.revokeObjectURL(uploadedPhotoUrl);
      uploadedPhotoUrl = result.url;

      if (dom.livePhoto) {
        dom.livePhoto.style.backgroundImage = `url(${uploadedPhotoUrl})`;
        dom.livePhoto.classList.remove('empty');
      }
      if (dom.photoRemoveBtn) dom.photoRemoveBtn.hidden = false;
    } catch (err) {
      console.error(err);
      alert('Kunne ikke indlæse billede.');
    }
  }

  function removePhoto() {
    if (uploadedPhotoUrl) {
      URL.revokeObjectURL(uploadedPhotoUrl);
      uploadedPhotoUrl = null;
    }
    if (dom.livePhoto) {
      dom.livePhoto.style.backgroundImage = '';
      dom.livePhoto.classList.add('empty');
    }
    if (dom.photoRemoveBtn) dom.photoRemoveBtn.hidden = true;
    if (dom.photoUpload) dom.photoUpload.value = '';
  }

  function waitForDocumentFonts(timeoutMs = 6000) {
    if (!document.fonts || !document.fonts.ready) return Promise.resolve();
    let timer;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(resolve, timeoutMs);
    });
    return Promise.race([document.fonts.ready, timeout]).finally(() => clearTimeout(timer));
  }

  function waitForImages(root, timeoutMs = 8000) {
    const imgs = Array.from(root.querySelectorAll('img'));
    if (!imgs.length) return Promise.resolve();

    let timer;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(resolve, timeoutMs);
    });

    const all = Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );

    return Promise.race([all, timeout]).finally(() => clearTimeout(timer));
  }

  // Ensure background-image URLs are loaded in the clone before capture
  function waitForCssBackgroundImages(root, timeoutMs = 8000) {
    const nodes = Array.from(root.querySelectorAll('*'));
    const urls = [];

    for (const el of nodes) {
      const bg = getComputedStyle(el).backgroundImage;
      if (!bg || bg === 'none') continue;

      // Extract all url(...) occurrences
      const matches = bg.matchAll(/url\(["']?([^"')]+)["']?\)/g);
      for (const m of matches) {
        if (m[1]) urls.push(m[1]);
      }
    }

    if (!urls.length) return Promise.resolve();

    let timer;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(resolve, timeoutMs);
    });

    const loaders = Promise.all(
      urls.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        });
      })
    );

    return Promise.race([loaders, timeout]).finally(() => clearTimeout(timer));
  }

  // Fix photo background in cloned node by copying computed style precisely
  async function fixPhotoInClone(cloneRoot) {
    const originalPhoto = dom.livePhoto;
    const clonePhoto = cloneRoot.querySelector('#live-photo');

    if (!originalPhoto || !clonePhoto) return;

    const style = getComputedStyle(originalPhoto);
    clonePhoto.style.backgroundImage = style.backgroundImage;
    clonePhoto.style.backgroundSize = style.backgroundSize;
    clonePhoto.style.backgroundPosition = style.backgroundPosition;
    clonePhoto.style.backgroundRepeat = style.backgroundRepeat;
    clonePhoto.style.backgroundColor = style.backgroundColor;

    // Force load background-image if present
    const bg = style.backgroundImage;
    const m = bg && bg.match(/url\(["']?([^"')]+)["']?\)/);
    if (m && m[1]) {
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = m[1];
      });
    }
  }

  async function canvasToBlob(canvas, mime) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), mime);
    });
  }

  async function renderCardCanvas(target, scale) {
    // Ensure background is set (clone sometimes loses it)
    const computed = getComputedStyle(target);
    if (!computed.backgroundImage || computed.backgroundImage === 'none') {
      target.style.backgroundImage = `url(${BG_IMAGE_URL})`;
      target.style.backgroundSize = 'cover';
      target.style.backgroundPosition = 'center';
      target.style.backgroundRepeat = 'no-repeat';
    }

    await waitForCssBackgroundImages(target);

    return html2canvas(target, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
      imageTimeout: 15000
    });
  }

  function doDownload(btn) {
    if (!btn || !dom.scaleContainer) return;

    btn.textContent = '⏳ Genererer...';
    btn.classList.add('loading');

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    // IMPORTANT: On desktop browsers, downloads must be initiated from a user gesture.
    // Open a blank tab immediately (still inside the click) and populate it later.
    const preOpenedTab = !isIOS ? window.open('', '_blank') : null;

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
        await nextFrame();
        await fixPhotoInClone(clone);
        await nextFrame();
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

        const outputMime = 'image/png';
        const outputExt = 'png';
        const rawName = dom.nameInput ? dom.nameInput.value.trim() : '';
        const safeName = rawName.replace(/\s+/g, '-') || 'attendee';
        const filename = `optimeet-card-${safeName}.${outputExt}`;

        if (isIOS) {
          canvas.toBlob(async (blob) => {
            if (!blob) {
              resetDownloadButton(btn);
              alert('Kunne ikke generere billede.');
              return;
            }

            const iosRawName = dom.nameInput ? dom.nameInput.value.trim() : '';
            const iosSafeName = iosRawName.replace(/\s+/g, '-') || 'attendee';
            const iosFilename = `optimeet-card-${iosSafeName}.png`;
            const file = new File([blob], iosFilename, { type: 'image/png' });
            showIOSSaveOptions({ file, canvas, button: btn });
          }, 'image/png');
          return;
        }

        // ✅ Desktop reliable flow: populate the pre-opened tab with image + a download link.
        try {
          const ok = await openImageWithDownloadLinkFromCanvas(canvas, filename, preOpenedTab);
          resetDownloadButton(btn);

          if (!ok) {
            alert('Popup blokeret. Tillad popups for denne side og prøv igen.');
          }

          return;
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
      bindLiveText(dom.headerInput, dom.liveHeader);
    }
    bindLiveText(dom.titleInput, dom.titleLive);
    bindLiveText(dom.subtitleInput, dom.subtitleLive);

    if (dom.logoUpload) {
      dom.logoUpload.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) await handleLogoUpload(file);
      });
    }
    if (dom.logoRemoveBtn) dom.logoRemoveBtn.addEventListener('click', removeLogo);

    if (dom.photoUpload) {
      dom.photoUpload.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) await handlePhotoUpload(file);
      });
    }
    if (dom.photoRemoveBtn) dom.photoRemoveBtn.addEventListener('click', removePhoto);

    // Typography / styling controls
    bindRange(dom.nameSize, byId('name-size-value'), '--name-size', 'px');
    bindRange(dom.headerSize, byId('header-size-value'), '--header-size', 'px');
    bindRange(dom.titleSize, byId('title-size-value'), '--title-size', 'px');
    bindRange(dom.subtitleSize, byId('subtitle-size-value'), '--subtitle-size', 'px');

    bindSelect(dom.headerWeight, '--header-weight');
    bindSelect(dom.titleWeight, '--title-weight');
    bindSelect(dom.subtitleWeight, '--subtitle-weight');
    bindSelect(dom.nameWeight, '--name-weight');

    bindRange(dom.headerLetterSpacing, byId('header-letter-spacing-value'), '--header-letter-spacing', 'em');
    bindRange(dom.titleLetterSpacing, byId('title-letter-spacing-value'), '--title-letter-spacing', 'em');
    bindRange(dom.subtitleLetterSpacing, byId('subtitle-letter-spacing-value'), '--subtitle-letter-spacing', 'em');
    bindRange(dom.nameLetterSpacing, byId('name-letter-spacing-value'), '--name-letter-spacing', 'em');

    bindRange(dom.headerLineHeight, byId('header-line-height-value'), '--header-line-height', '');
    bindRange(dom.titleLineHeight, byId('title-line-height-value'), '--title-line-height', '');
    bindRange(dom.subtitleLineHeight, byId('subtitle-line-height-value'), '--subtitle-line-height', '');
    bindRange(dom.nameLineHeight, byId('name-line-height-value'), '--name-line-height', '');

    bindToggle(dom.headerUppercase, '--header-transform', 'uppercase', 'none');
    bindToggle(dom.titleUppercase, '--title-transform', 'uppercase', 'none');
    bindToggle(dom.subtitleUppercase, '--subtitle-transform', 'uppercase', 'none');
    bindToggle(dom.nameUppercase, '--name-transform', 'uppercase', 'none');

    bindSelect(dom.headerAlign, '--header-align');
    bindSelect(dom.titleAlign, '--title-align');
    bindSelect(dom.subtitleAlign, '--subtitle-align');
    bindSelect(dom.nameAlign, '--name-align');

    if (dom.headerColor) {
      dom.headerColor.addEventListener('input', () => {
        document.documentElement.style.setProperty('--header-color', dom.headerColor.value);
      });
      document.documentElement.style.setProperty('--header-color', dom.headerColor.value);
    }

    if (dom.downloadBtn) {
      dom.downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        doDownload(dom.downloadBtn);
      });
    }

    if (dom.downloadBtnIOS) {
      dom.downloadBtnIOS.addEventListener('click', (e) => {
        e.preventDefault();
        doDownload(dom.downloadBtnIOS);
      });
    }
  }

  window.switchTab = switchTab;
  init();
})();