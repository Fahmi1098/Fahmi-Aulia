// ==================== GLOBAL VARIABLES ====================
let isMusicPlaying = false;
let audio = document.getElementById("bgMusic");
let currentSlide = 0;
const totalSlides = 10;
const menuItems = document.querySelectorAll('.satumomen_menu_item');
const menuNav = document.getElementById('menuNav');
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzIPgQSHFBUou6y-jy0FuMg7nJDsUauXPZ7dMG96PIBdTFDW1QaYlsJqBzY2WtvpDM/exec";

// Kumpulan Efek Slide Dinamis
const dynamicAnimations = [
    'anim-fade-up', 
    'anim-zoom-in', 
    'anim-slide-right', 
    'anim-blur-reveal', 
    'anim-fade-down', 
    'anim-slide-left'
];

// ==================== AUTOPLAY SLIDE VARIABLES ====================
let autoSlideTimer = null;
let isAutoPlay = true; 
const slideDuration = 8000;

// ==================== NAMA TAMU ====================
const urlParams = new URLSearchParams(window.location.search);
let nama = urlParams.get('to');
if (nama) {
    nama = nama.replace(/_|\+/g, ' ');
    nama = nama.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    const namaTamuElems = document.querySelectorAll('.namaTamu');
    namaTamuElems.forEach(el => { el.innerText = nama; });
}

// ==================== EFEK KUNANG-KUNANG ====================
function createFireflies() {
    const container = document.getElementById('fireflyContainer');
    if (!container) return;
    const count = 15; 
    for (let i = 0; i < count; i++) {
        const fly = document.createElement('div');
        fly.className = 'firefly';
        fly.style.left = Math.random() * 100 + '%';
        fly.style.top = Math.random() * 100 + '%';
        fly.style.animationDuration = (Math.random() * 6 + 4) + 's';
        fly.style.animationDelay = (Math.random() * 5) + 's';
        container.appendChild(fly);
    }
}

// ==================== EFEK MAWAR ====================
function createRoseSvg() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 64 64");
    svg.setAttribute("width", "64");
    svg.setAttribute("height", "64");
    svg.setAttribute("aria-hidden", "true");
    const rose = document.createElementNS("http://www.w3.org/2000/svg", "path");
    rose.setAttribute("d", "M32 6c6 0 10 4 10 9 0 3-2 6-5 8 4 1 7 5 7 9 0 6-5 10-12 10-3 0-6-1-8-2-2 1-5 2-8 2-7 0-12-4-12-10 0-4 3-8 7-9-3-2-5-5-5-8 0-5 4-9 10-9 4 0 7 2 8 4 1-2 4-4 8-4z");
    rose.setAttribute("fill", "#F4C2C2"); 
    const stem = document.createElementNS("http://www.w3.org/2000/svg", "path");
    stem.setAttribute("d", "M30 40c0 10-1 14-6 18h4c4-3 6-7 6-18z");
    stem.setAttribute("fill", "#6B3535"); 
    svg.appendChild(rose);
    svg.appendChild(stem);
    return svg;
}

function terbangkanMawar() {
    const containerId = "roseLayer";
    const existing = document.getElementById(containerId);
    if (existing) existing.remove();
    const layer = document.createElement("div");
    layer.className = "rose-layer";
    layer.id = containerId;
    document.getElementById("satuMomen").appendChild(layer);
    const count = 5;
    let maxDuration = 0;
    for (let i = 0; i < count; i++) {
        const rose = document.createElement("div");
        rose.className = "rose-float";
        const size = 20 + Math.random() * 24;
        const duration = 5 + Math.random() * 4;
        const delay = Math.random() * 1.5;
        const startX = Math.random() * 100;
        const endX = Math.random() * 100;
        rose.style.width = `${size}px`;
        rose.style.height = `${size}px`;
        rose.style.left = `${startX}%`;
        rose.style.animationDuration = `${duration}s`;
        rose.style.animationDelay = `${delay}s`;
        rose.style.setProperty("--rose-x", `${endX - startX}vw`);
        rose.style.setProperty("--rose-scale", (size / 40).toFixed(2));
        rose.appendChild(createRoseSvg());
        layer.appendChild(rose);
        maxDuration = Math.max(maxDuration, duration + delay);
    }
    setTimeout(() => { if (layer.parentNode) layer.remove(); }, (maxDuration + 1) * 1000);
}

// ==================== BUKA UNDANGAN ====================
function openInvitation() {
    const satuMomen = document.getElementById('satuMomen');
    satuMomen.classList.add('is-open');
    document.getElementById('actionBtnContainer').style.display = 'flex';
    audio.play().catch(() => {});
    isMusicPlaying = true;
    terbangkanMawar();
    
    setTimeout(() => {
        goToSlide(1);
        startAutoSlide();
    }, 300);

    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
    }
}

// ==================== TOGGLE MENU ====================
function toggleMenu() {
    const menu = document.getElementById('smMenu');
    const icon = document.getElementById('menuToggleIcon');
    
    menu.classList.toggle('show');
    
    if (menu.classList.contains('show')) {
        icon.classList.remove('ph-list');
        icon.classList.add('ph-caret-down');
    } else {
        icon.classList.remove('ph-caret-down');
        icon.classList.add('ph-list');
    }
}

// ==================== MUSIK ====================
function toggleMusic() {
    const icon = document.getElementById('musicIcon');
    if (isMusicPlaying) {
        audio.pause();
        icon.classList.remove('spin-anim');
    } else {
        audio.play();
        icon.classList.add('spin-anim');
    }
    isMusicPlaying = !isMusicPlaying;
}

// ==================== AUTOPLAY SLIDE LOGIC ====================
function startAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => {
        if (isAutoPlay && currentSlide > 0 && currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        } else if (currentSlide === totalSlides - 1) {
            stopAutoSlide();
        }
    }, slideDuration);
}

function stopAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = null;
    isAutoPlay = false;
    updateAutoPlayIcon();
}

function toggleAutoPlay() {
    isAutoPlay = !isAutoPlay;
    if (isAutoPlay) {
        startAutoSlide();
    } else {
        stopAutoSlide();
    }
    updateAutoPlayIcon();
}

function updateAutoPlayIcon() {
    const icon = document.getElementById('autoPlayIcon');
    if (icon) {
        if (isAutoPlay) {
            icon.classList.remove('ph-play');
            icon.classList.add('ph-pause');
        } else {
            icon.classList.remove('ph-pause');
            icon.classList.add('ph-play');
        }
    }
}

// ==================== SLIDER DINAMIS, MENU & ANIMASI ====================
function goToSlide(index) {
    currentSlide = index;
    
    const slides = document.querySelectorAll('.satumomen_slide');
    
    slides.forEach((slide, i) => {
        slide.classList.remove('active', ...dynamicAnimations);
        if (i === index) {
            slide.classList.add('active');
            slide.classList.add(dynamicAnimations[i % dynamicAnimations.length]);
        }
    });

    menuItems.forEach(el => el.classList.remove('active'));
    if(menuItems[index]) {
        menuItems[index].classList.add('active');
        const activeItem = menuItems[index];
        const scrollLeftPos = activeItem.offsetLeft - (menuNav.offsetWidth / 2) + (activeItem.offsetWidth / 2);
        menuNav.scrollTo({ left: scrollLeftPos, behavior: 'smooth' });
    }
    triggerAnimation(index);
}

function triggerAnimation(index) {
    const slides = document.querySelectorAll('.satumomen_slide');
    
    if(slides[index]) {
        const cWrapper = slides[index].querySelector('.c-wrapper');
        if (cWrapper) {
            const elements = cWrapper.querySelectorAll('.animate__animated');
            elements.forEach(el => {
                const currentAnim = el.style.animationName;
                el.style.animationName = 'none';
                requestAnimationFrame(() => { 
                    setTimeout(() => { el.style.animationName = ''; }, 0); 
                });
            });
        }
    }
}

// ==================== SWIPE ====================
const swipeTrack = document.getElementById('swipeTrack');
let startX = 0, startY = 0;

swipeTrack.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].screenX;
    startY = e.changedTouches[0].screenY;
}, { passive: true });

swipeTrack.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].screenX;
    const endY = e.changedTouches[0].screenY;
    const deltaX = startX - endX;
    const deltaY = Math.abs(startY - endY);
    
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > deltaY) {
        stopAutoSlide(); 
        if (deltaX > 0 && currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
        else if (deltaX < 0 && currentSlide > 0) goToSlide(currentSlide - 1);
    }
}, { passive: true });

// ==================== COUNTDOWN TIMER ====================
const countDownDate = new Date("Jun 03, 2026 09:00:00").getTime();
const timer = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;
    if (distance > 0) {
        document.getElementById("hari").innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
        document.getElementById("jam").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        document.getElementById("menit").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        document.getElementById("detik").innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
        document.getElementById("countdownStatus").innerText = "Menanti Hari Bahagia";
    } else {
        document.getElementById("hari").innerText = "00";
        document.getElementById("jam").innerText = "00";
        document.getElementById("menit").innerText = "00";
        document.getElementById("detik").innerText = "00";
        document.getElementById("countdownStatus").innerText = "Momen Bahagia Telah Tiba";
        clearInterval(timer);
    }
}, 1000);

// ==================== LIGHTBOX GALERI ====================
const lightboxWrapper = document.getElementById('lightboxWrapper');
const zoomImg = document.getElementById('zoomImg');
const kumpulanFoto = document.querySelectorAll('.gallery-trigger');

kumpulanFoto.forEach(foto => {
    foto.addEventListener('click', function(e) {
        bukaLightbox(parseInt(this.getAttribute('data-index')));
    });
});

function bukaLightbox(index) {
    const imgTarget = document.querySelector(`.gallery-trigger[data-index="${index}"]`);
    if (imgTarget) {
        zoomImg.src = imgTarget.src;
        let maxIndex = kumpulanFoto.length - 1;
        document.getElementById('lightboxPrevBtn').setAttribute('data-index', index - 1 < 0 ? maxIndex : index - 1);
        document.getElementById('lightboxNextBtn').setAttribute('data-index', index + 1 > maxIndex ? 0 : index + 1);
        lightboxWrapper.style.display = 'block';
    }
}

document.getElementById('lightboxCloseBtn').onclick = (e) => { e.preventDefault(); lightboxWrapper.style.display = 'none'; };
document.getElementById('lightboxPrevBtn').onclick = function(e) { e.preventDefault(); bukaLightbox(parseInt(this.getAttribute('data-index'))); };
document.getElementById('lightboxNextBtn').onclick = function(e) { e.preventDefault(); bukaLightbox(parseInt(this.getAttribute('data-index'))); };
lightboxWrapper.onclick = (e) => { if(e.target.id === 'lightboxWrapper') lightboxWrapper.style.display = 'none'; };

// ==================== GUESTBOOK ====================
function loadGuestbook() {
    const guestbookList = document.querySelector('.guestbook-list');
    if (!guestbookList) return;
    guestbookList.innerHTML = '<div class="text-center p-3" style="font-size:12px; color: var(--inv-base);">Memuat untaian doa...</div>';
    fetch(GOOGLE_SHEETS_URL)
        .then(response => response.json())
        .then(data => {
            guestbookList.innerHTML = '';
            if (!data || data.length === 0) {
                guestbookList.innerHTML = '<div class="text-center p-3" style="font-size:12px; color: var(--inv-base);">Belum ada doa dan harapan. Jadilah yang pertama!</div>';
                return;
            }
            data.forEach(item => {
                const itemHtml = `<div class="guestbook-item animate__animated animate__fadeIn"><div class="guestbook-name" style="font-weight:bold;">${escapeHtml(item.nama || 'Tamu')} <span style="font-size:10px; opacity:0.8;">- ${escapeHtml(item.kehadiran || '')}</span></div><div class="guestbook-message mt-1">${escapeHtml(item.ucapan || '')}</div></div>`;
                guestbookList.insertAdjacentHTML('beforeend', itemHtml);
            });
        })
        .catch(error => {
            guestbookList.innerHTML = '<div class="text-center p-3" style="font-size:12px; color: var(--inv-base);">Belum bisa memuat buku tamu.</div>';
        });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== SUBMIT RSVP ====================
function submitRSVP(event) {
    event.preventDefault();
    const btnSubmit = event.target.querySelector('button[type="submit"]');
    const nameInput = document.getElementById('rsvpNameInline');
    const attendanceInput = document.getElementById('rsvpAttendanceInline');
    const messageInput = document.getElementById('rsvpMessageInline');
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = "<i class='ph-fill ph-spinner-gap spin-anim mr-1'></i> Mengirim...";
    btnSubmit.disabled = true;
    
    const formData = new URLSearchParams();
    formData.append('nama', nameInput.value.trim());
    formData.append('kehadiran', attendanceInput.value);
    formData.append('ucapan', messageInput.value.trim());
    
    fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        nameInput.value = "";
        attendanceInput.value = "Berkenan Hadir";
        messageInput.value = "";
        loadGuestbook();
    })
    .catch(error => {
        nameInput.value = "";
        messageInput.value = "";
        loadGuestbook();
    })
    .finally(() => {
        btnSubmit.innerHTML = originalBtnText;
        btnSubmit.disabled = false;
    });
}

// ==================== COPY REKENING ====================
function copyText(targetId) {
    const text = document.getElementById(targetId).textContent.trim();
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
    } else {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.focus();
    temp.select();
    temp.setSelectionRange(0, temp.value.length);
    document.execCommand('copy');
    document.body.removeChild(temp);
}

// ==================== PENCEGAHAN ZOOM ====================
function preventZoom(event) {
    if (event.ctrlKey || event.metaKey) {
        const blockedKeys = ['=', '+', '-', '_', '0'];
        if (event.type === 'keydown' && blockedKeys.includes(event.key)) {
            event.preventDefault();
            return;
        }
    }
}

window.addEventListener('wheel', (event) => {
    if (event.ctrlKey) {
        event.preventDefault();
    }
}, { passive: false });

window.addEventListener('gesturestart', (event) => {
    event.preventDefault();
});

document.addEventListener('keydown', preventZoom, { passive: false });
document.addEventListener('keyup', preventZoom, { passive: false });

// ==================== EVENT LISTENER UNTUK TOMBOL & FORM ====================
document.addEventListener('DOMContentLoaded', () => {
    // Tombol Buka Undangan
    document.getElementById('openInvitationBtn').addEventListener('click', openInvitation);
    
    // Menu navigasi
    document.querySelectorAll('.satumomen_menu_item[data-slide]').forEach(item => {
        item.addEventListener('click', (e) => {
            const slide = parseInt(item.getAttribute('data-slide'));
            if (!isNaN(slide)) goToSlide(slide);
        });
    });
    
    // Floating buttons
    document.getElementById('toggleMenuBtn').addEventListener('click', toggleMenu);
    document.getElementById('toggleAutoPlayBtn').addEventListener('click', toggleAutoPlay);
    document.getElementById('toggleMusicBtn').addEventListener('click', toggleMusic);
    
    // Tombol copy rekening
    document.querySelectorAll('.copy-rek').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            if (targetId) copyText(targetId);
        });
    });
    
    // Form RSVP
    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) rsvpForm.addEventListener('submit', submitRSVP);
    
    // Load data awal
    loadGuestbook();
    createFireflies();
    goToSlide(0);
});