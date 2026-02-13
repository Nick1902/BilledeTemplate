/* BG_SRC: relativ set fra HTML-filen `html/p.html` */
const BG_SRC = '../img/baggrund.jpg';

const OUT_W = 960;
const OUT_H = 1200;

const state = {
  bgEl:    null,
  portEl:  null,
  portSrc: null,
  imgX: 0, imgY: 0,
  zoom: 1,
  natW: 0, natH: 0,
};

function loadBgImage() {
  const img = new Image();

  img.onload = () => {
    const tmp = document.createElement('canvas');
    tmp.width = img.naturalWidth; tmp.height = img.naturalHeight;
    tmp.getContext('2d').drawImage(img, 0, 0);
    const dataUrl = tmp.toDataURL('image/jpeg', 0.92);

    const safe = new Image();
    safe.onload = () => {
      state.bgEl = safe;
      document.getElementById('card-bg').style.backgroundImage = `url('${dataUrl}')`;
    };
    safe.src = dataUrl;
  };

  img.onerror = () => {
    console.warn('Baggrundsbillede ikke fundet:', BG_SRC);
  };

  // Use relative path; do not set crossOrigin to avoid CORS issues when hosting same-origin
  img.src = BG_SRC;
}
loadBgImage();

const portUpload  = document.getElementById('portrait-upload');
const portInput   = document.getElementById('portrait-file-input');
const photoBox    = document.getElementById('photo-box');
const zoomSection = document.getElementById('zoom-section');
const zoomSlider  = document.getElementById('zoom-slider');
const zoomSliderMobile = document.getElementById('zoom-slider-mobile');
const zoomVal     = document.getElementById('zoom-val');
const zoomValMobile = document.getElementById('zoom-val-mobile');
const inpName     = document.getElementById('inp-name');
const inpRole     = document.getElementById('inp-role');
const inpIntro    = document.getElementById('inp-intro');
const wordCount   = document.getElementById('word-count');
const liveName    = document.getElementById('live-name');
const liveRole    = document.getElementById('live-role');
const liveDivider = document.getElementById('live-divider');
const liveIntro   = document.getElementById('live-intro');
const btnDownload = document.getElementById('btn-download');

inpName.addEventListener('input',  () => { liveName.textContent = inpName.value;  refreshDivider(); checkReady(); });
inpRole.addEventListener('input',  () => { liveRole.textContent = inpRole.value;  refreshDivider(); checkReady(); });
inpIntro.addEventListener('input', () => {
  const n = inpIntro.value.trim().split(/\s+/).filter(Boolean).length;
  wordCount.textContent = `${n} ord`;
  wordCount.classList.toggle('over', n > 40);
  liveIntro.textContent = inpIntro.value;
  refreshDivider(); checkReady();
});

function refreshDivider() {
  liveDivider.style.display = ((inpName.value || inpRole.value) && inpIntro.value) ? 'block' : 'none';
}
function checkReady() {
  btnDownload.disabled = !(state.portSrc && inpName.value.trim() && inpRole.value.trim() && inpIntro.value.trim());
}

portUpload.addEventListener('click',    () => portInput.click());
portUpload.addEventListener('dragover',  e => { e.preventDefault(); portUpload.classList.add('drag-over'); });
portUpload.addEventListener('dragleave', () => portUpload.classList.remove('drag-over'));
portUpload.addEventListener('drop', e => {
  e.preventDefault(); portUpload.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) loadPortrait(f);
});
portInput.addEventListener('change', () => { if (portInput.files[0]) loadPortrait(portInput.files[0]); });

function loadPortrait(file) {
  const reader = new FileReader();
  reader.onload = e => {
    state.portSrc = e.target.result;
    const img = new Image();
    img.onload = () => {
      state.portEl = img;
      state.natW = img.naturalWidth; state.natH = img.naturalHeight;
      state.zoom = 1; state.imgX = 0; state.imgY = 0;
      zoomSlider.value = 100; zoomVal.textContent = '100%';
      if (zoomSliderMobile) { zoomSliderMobile.value = 100; zoomValMobile.textContent = '100%'; }
      renderPortrait();
      zoomSection.style.display = 'block';
      photoBox.classList.add('has-image');
      portUpload.classList.add('has-file');
      portUpload.querySelector('p').innerHTML = '<strong>✓ Portræt uploadet</strong><br/>Klik for at skifte';
      checkReady();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

let _rafId = null;
function _applyImgTransform(imgEl) {
  imgEl.style.transform = `translate3d(${state.imgX}px, ${state.imgY}px, 0)`;
}

function renderPortrait() {
  const old = photoBox.querySelector('img');
  if (old) old.remove();
  if (!state.portSrc) return;
  const img = document.createElement('img');
  img.src = state.portSrc;
  img.draggable = false;
  img.style.position = 'absolute';
  img.style.willChange = 'transform,width,height';

  const bw = photoBox.offsetWidth  || 260;
  const bh = photoBox.offsetHeight || 300;
  const scale = Math.max(bw / state.natW, bh / state.natH) * state.zoom;
  const dw = state.natW * scale, dh = state.natH * scale;
  if (state.imgX === 0 && state.imgY === 0) { state.imgX = (bw-dw)/2; state.imgY = (bh-dh)/2; }

  img.style.width = `${dw}px`;
  img.style.height = `${dh}px`;
  // position using transform for smoother rendering
  _applyImgTransform(img);
  photoBox.appendChild(img);

  if (zoomSliderMobile) { zoomSliderMobile.value = Math.round(state.zoom*100); }
  if (zoomValMobile) { zoomValMobile.textContent = `${Math.round(state.zoom*100)}%`; }
}

zoomSlider.addEventListener('input', () => {
  const v = parseInt(zoomSlider.value, 10);
  state.zoom = v / 100;
  zoomVal.textContent = `${v}%`;
  if (zoomSliderMobile) { zoomSliderMobile.value = v; zoomValMobile.textContent = `${v}%`; }
  const img = photoBox.querySelector('img');
  if (!img) return;
  const bw = photoBox.offsetWidth||260, bh = photoBox.offsetHeight||300;
  const scale = Math.max(bw/state.natW, bh/state.natH) * state.zoom;
  const dw = state.natW*scale, dh = state.natH*scale;
  const prevW = parseFloat(img.style.width) || dw, prevH = parseFloat(img.style.height) || dh;
  state.imgX += (prevW-dw)/2; state.imgY += (prevH-dh)/2;
  img.style.width = `${dw}px`; img.style.height = `${dh}px`;
  // update position via RAF
  if (_rafId) cancelAnimationFrame(_rafId);
  _rafId = requestAnimationFrame(() => { _applyImgTransform(img); _rafId = null; });
});

if (zoomSliderMobile) {
  zoomSliderMobile.addEventListener('input', () => {
    const v = parseInt(zoomSliderMobile.value, 10);
    zoomValMobile.textContent = `${v}%`;
    zoomSlider.value = v;
    state.zoom = v / 100;
    zoomVal.textContent = `${v}%`;
    const img = photoBox.querySelector('img');
    if (!img) return;
    const bw = photoBox.offsetWidth||260, bh = photoBox.offsetHeight||300;
    const scale = Math.max(bw/state.natW, bh/state.natH) * state.zoom;
    const dw = state.natW*scale, dh = state.natH*scale;
    const prevW = parseFloat(img.style.width) || dw, prevH = parseFloat(img.style.height) || dh;
    state.imgX += (prevW-dw)/2; state.imgY += (prevH-dh)/2;
    img.style.width = `${dw}px`; img.style.height = `${dh}px`;
    if (_rafId) cancelAnimationFrame(_rafId);
    _rafId = requestAnimationFrame(() => { _applyImgTransform(img); _rafId = null; });
  });
}

let dragging=false, dsx=0, dsy=0, dix=0, diy=0;
function _startDrag(x,y){ if (!photoBox.classList.contains('has-image')) return; dragging=true; dsx=x; dsy=y; dix=state.imgX; diy=state.imgY; photoBox.style.cursor='grabbing'; }
function _updateDrag(x,y){ if (!dragging) return; state.imgX = dix + x - dsx; state.imgY = diy + y - dsy; const img = photoBox.querySelector('img'); if (!img) return; if (_rafId) cancelAnimationFrame(_rafId); _rafId = requestAnimationFrame(()=>{ _applyImgTransform(img); _rafId = null; }); }
function _endDrag(){ dragging=false; photoBox.style.cursor='grab'; }
photoBox.addEventListener('mousedown', e => _startDrag(e.clientX, e.clientY));
window.addEventListener('mousemove', e => _updateDrag(e.clientX, e.clientY));
window.addEventListener('mouseup', _endDrag);
photoBox.addEventListener('touchstart', e => {
  if (!photoBox.classList.contains('has-image')) return; e.preventDefault(); _startDrag(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
window.addEventListener('touchmove', e => { if (!dragging) return; _updateDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
window.addEventListener('touchend', _endDrag);

function wrapText(ctx, text, maxW) {
  const words = text.split(' '), lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line+' '+w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line=w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

btnDownload.addEventListener('click', async () => {
  btnDownload.disabled = true;
  btnDownload.innerHTML = '⏳ &nbsp;Genererer…';

  try {
    const canvas = document.createElement('canvas');
    canvas.width=OUT_W; canvas.height=OUT_H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, OUT_W, OUT_H);

    if (state.bgEl) {
      const iAR = state.bgEl.naturalWidth / state.bgEl.naturalHeight;
      const cAR = OUT_W / OUT_H;
      let sw, sh, sx, sy;
      if (iAR > cAR) {
        sh=state.bgEl.naturalHeight; sw=sh*cAR; sx=(state.bgEl.naturalWidth-sw)/2; sy=0;
      } else {
        sw=state.bgEl.naturalWidth; sh=sw/cAR; sx=0; sy=(state.bgEl.naturalHeight-sh)/2;
      }
      ctx.drawImage(state.bgEl, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H);
    }

    const ov1 = ctx.createRadialGradient(OUT_W/2, OUT_H*0.15, 0, OUT_W/2, OUT_H*0.15, OUT_W*0.7);
    ov1.addColorStop(0,'rgba(20,45,100,0.65)'); ov1.addColorStop(1,'rgba(20,45,100,0)');
    ctx.fillStyle=ov1; ctx.fillRect(0,0,OUT_W,OUT_H);

    const ov2 = ctx.createRadialGradient(OUT_W/2, OUT_H, 0, OUT_W/2, OUT_H, OUT_W*0.9);
    ov2.addColorStop(0,'rgba(5,10,30,0.85)'); ov2.addColorStop(1,'rgba(5,10,30,0)');
    ctx.fillStyle=ov2; ctx.fillRect(0,0,OUT_W,OUT_H);

    ctx.textAlign='center';
    ctx.shadowColor='rgba(0,0,0,0.55)'; ctx.shadowBlur=18;
    ctx.fillStyle='#fff';
    ctx.font='bold 66px "DM Sans", sans-serif';
    ctx.letterSpacing='10px';
    ctx.fillText('OPTIMEET', OUT_W/2, 96);
    ctx.font='300 44px "DM Sans", sans-serif';
    ctx.fillStyle='rgba(255,255,255,0.85)';
    ctx.fillText('MESSEN', OUT_W/2, 148);
    ctx.letterSpacing='0px'; ctx.shadowBlur=0;

    const wrapperRect = photoBox.closest('.card-wrapper').getBoundingClientRect();
    const boxRect     = photoBox.getBoundingClientRect();
    const fL=(boxRect.left-wrapperRect.left)/wrapperRect.width;
    const fT=(boxRect.top -wrapperRect.top) /wrapperRect.height;
    const fW=boxRect.width /wrapperRect.width;
    const fH=boxRect.height/wrapperRect.height;
    const bx=fL*OUT_W, by=fT*OUT_H, bw=fW*OUT_W, bh=fH*OUT_H;
    const cx=bx+bw/2, cy=by+bh/2, rx=bw/2, ry=bh/2;

    if (state.portEl) {
      const scX=OUT_W/wrapperRect.width, scY=OUT_H/wrapperRect.height;
      const liveImg=photoBox.querySelector('img');
      const liW=parseFloat(liveImg.style.width), liH=parseFloat(liveImg.style.height);
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
      ctx.clip();
      ctx.drawImage(state.portEl, bx+state.imgX*scX, by+state.imgY*scY, liW*scX, liH*scY);
      const rim = ctx.createRadialGradient(cx,cy,Math.min(rx,ry)*0.75, cx,cy,Math.max(rx,ry));
      rim.addColorStop(0,'rgba(0,0,0,0)'); rim.addColorStop(1,'rgba(0,0,0,0.28)');
      ctx.fillStyle=rim; ctx.fill();
      ctx.restore();
    }

    const infoH=OUT_H*0.40, infoY=OUT_H-infoH;
    const ig=ctx.createLinearGradient(0,infoY,0,OUT_H);
    ig.addColorStop(0,'rgba(4,12,40,0)');
    ig.addColorStop(0.28,'rgba(4,12,40,0.82)');
    ig.addColorStop(1,'rgba(4,12,40,0.97)');
    ctx.fillStyle=ig; ctx.fillRect(0,infoY,OUT_W,infoH);

    const pad=80, textW=OUT_W-pad*2;
    let ty=OUT_H-infoH+90;

    ctx.textAlign='center'; ctx.fillStyle='#fff';
    ctx.font='bold 70px "Playfair Display", serif';
    ctx.shadowColor='rgba(0,0,0,0.45)'; ctx.shadowBlur=14;
    wrapText(ctx, inpName.value, textW).forEach(l => { ctx.fillText(l,OUT_W/2,ty); ty+=82; });
    ctx.shadowBlur=0; ty+=4;

    ctx.fillStyle='rgba(255,255,255,0.68)';
    ctx.font='italic 300 36px "DM Sans", sans-serif';
    wrapText(ctx, inpRole.value, textW).forEach(l => { ctx.fillText(l,OUT_W/2,ty); ty+=46; });

    ty+=18;
    const dg=ctx.createLinearGradient(OUT_W/2-40,0,OUT_W/2+40,0);
    dg.addColorStop(0,'#5b8cff'); dg.addColorStop(1,'#ff6b9d');
    ctx.fillStyle=dg; ctx.fillRect(OUT_W/2-40,ty,80,4); ty+=36;

    ctx.fillStyle='rgba(255,255,255,0.72)';
    ctx.font='300 33px "DM Sans", sans-serif';
    wrapText(ctx, inpIntro.value, textW).forEach(l => { ctx.fillText(l,OUT_W/2,ty); ty+=44; });

    const a = document.createElement('a');
    a.download=`optimeet-kort-${(inpName.value.trim()||'deltager').replace(/\s+/g,'_')}.png`;
    a.href=canvas.toDataURL('image/png');
    a.click();

  } catch(err) {
    console.error(err);
    alert('Download fejlede: '+err.message);
  }

  btnDownload.disabled=false;
  btnDownload.innerHTML='⬇ &nbsp;Download kort';
});

window.addEventListener('load',   () => setTimeout(renderPortrait, 100));
// debounce resize to avoid expensive reflow during window resizing
let _resizeTimer = null;
window.addEventListener('resize', () => {
  if (_resizeTimer) clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(()=>{ if (state.portSrc) renderPortrait(); _resizeTimer=null; }, 120);
});
