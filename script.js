// Evitar que el navegador restaure la posición de scroll al refrescar. Se recarga la página a la posición de inicio
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

//Variables globales
let currentMonth = null;
let currentIndex = 0;
let currentMediaList = [];

//Para renderizar según la selección del mes
function renderMonthFilter() {
  const months = Object.keys(mediaData) //mediaData viene de la información contenida en media.js
    .sort((a, b) => {
      const numA = parseInt(a.split(".")[0]);
      const numB = parseInt(b.split(".")[0]);
      return numA - numB;  // Orden numérico 1, 2, 3, ..., 30
    });
  const nav = document.getElementById('month-filter');
  nav.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.textContent = '0. Todas las imágenes-luz'; //Botón que muestra todas las imágenes-luz agrupadas de todos los meses
  allBtn.className = (!currentMonth) ? 'active' : '';
  allBtn.onclick = () => {
    currentMonth = null;
    renderGallery();
    renderMonthFilter();
  };
  nav.appendChild(allBtn);

  months.forEach(month => { //Botón por mes que actualiza la selección del mes escogido y el renderizado de la galería
    const btn = document.createElement('button');
    btn.textContent = month;
    btn.className = (month === currentMonth) ? 'active' : '';
    btn.onclick = () => {
      currentMonth = month;
      renderGallery();
      renderMonthFilter();
    };
    nav.appendChild(btn);
  });
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  let items = [];

  //Selecciona los archivos que muestra según la opción (mes) seleccionada
  if (currentMonth) {
    items = mediaData[currentMonth] || [];
  } else {
    items = Object.values(mediaData).flat();
  }

  currentMediaList = items;

  //Crea cada elemento de la galería
  items.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'media-item';
    div.onclick = () => openLightbox(idx); //Abre el lightbox (visor a pantalla completa)

    let mediaElement;

    if (item.type === 'image') { //Características de las imágenes
      mediaElement = document.createElement('img');
      mediaElement.src = item.file;
      mediaElement.alt = item.title || '';
      mediaElement.className = 'media-thumb';

    } else if (item.iframe) { //Características de los vídeos de YouTube (iframe)

      // Si hay miniatura, mostrar imagen
      if (item.thumbnail) {
        mediaElement = document.createElement('img');
        mediaElement.src = item.thumbnail;
        mediaElement.className = 'media-thumb';
        mediaElement.alt = "thumbnail";
      }

      // Si no hay miniatura, mostrar iframe
      else {
        mediaElement = document.createElement('iframe');
        mediaElement.src = item.src;
        mediaElement.className = 'media-thumb';
        mediaElement.width = "100%";
        mediaElement.height = "210";
        mediaElement.frameBorder = "0";
        mediaElement.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        mediaElement.allowFullscreen = true;
      }


    } else if (item.type === 'video') {
      mediaElement = document.createElement('video');
      mediaElement.src = item.file;
      mediaElement.className = 'media-thumb';
      mediaElement.muted = true;
      mediaElement.playsInline = true;
      mediaElement.controls = false;
      mediaElement.poster = item.poster || '';
    }

    div.appendChild(mediaElement);

    const description = document.createElement('div'); //Descripción debajo de cada miniatura
    description.className = 'media-description';
    description.textContent = item.description || '';
    div.appendChild(description);

    gallery.appendChild(div);
  });
}

function openLightbox(idx) { //Abrir el lightbox (visor a pantalla completa)
  currentIndex = idx;
  const lightbox = document.getElementById('lightbox');
  const content = document.getElementById('lightbox-content');
  content.innerHTML = '';
  const item = currentMediaList[idx];

  //Ocultar la hamburguesa cuando se abre el lightbox
  if (mobileMonthToggle) {
    mobileMonthToggle.style.display = 'none';
  }

  //Renderizado se´gun el tipo de elemento (imagen o vídeo)
  if (item.type === 'image') {
    const img = document.createElement('img');
    img.src = item.file;

    img.alt = item.title || '';
    content.appendChild(img);
  } else if (item.iframe) {
    const iframe = document.createElement('iframe');
    iframe.src = item.src;
    iframe.width = "90%";
    iframe.height = "80%";
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    content.appendChild(iframe);
  } else if (item.type === 'video') {
    const video = document.createElement('video');
    video.src = item.file;
    video.controls = true;
    video.autoplay = true;
    video.style.background = '#fff';
    content.appendChild(video);
  }


  //Descripción debajo de cada elemento dentro del lightbox (visor a pantalla completa)
  const desc = document.createElement('div');
  desc.className = 'media-description';
  desc.textContent = item.description || '';
  desc.style.marginTop = "1rem";
  desc.style.textAlign = "center";
  desc.style.fontSize = "0.9rem";

  desc.style.width = "100%";
  desc.style.maxWidth = "90%";


  content.appendChild(desc);


  lightbox.classList.remove('hidden');
}

function closeLightbox() { //Cerrar el lightbox (visor a pantalla completa)
  document.getElementById('lightbox').classList.add('hidden');
  document.getElementById('lightbox-content').innerHTML = '';

  //Volver a mostrar la hamburguesa al cerrar el lightbox
  if (mobileMonthToggle) {
    mobileMonthToggle.style.display = '';
  }
}


function showPrev() { //Para navegar entre elementos (anterior y posterior)
  if (currentIndex > 0) {
    openLightbox(currentIndex - 1);
  }
}

function showNext() {
  if (currentIndex < currentMediaList.length - 1) {
    openLightbox(currentIndex + 1);
  }
}

//Eventos de control
document.getElementById('close').onclick = closeLightbox;
document.getElementById('prev').onclick = showPrev;
document.getElementById('next').onclick = showNext;

//Controles visuales
document.addEventListener('keydown', function (e) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox.classList.contains('hidden')) {
    //Accesibilidad por teclado (esc para salir y flechas izquierda y derecha para moverse entre elementos)
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  }
});

//Inicializar
renderMonthFilter();


//Forzar selección "Todos" cada vez que se carga la web
currentMonth = null;
renderGallery();       //Mostrar todo

//Subir arriba al inicio una vez la página está completamente cargada
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

//Menú móvil (hamburguesa)
const mobileMonthToggle = document.getElementById('mobile-month-toggle');
const monthFilter = document.getElementById('month-filter');


function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

//Abrir y cerrar el menú hamburguesa
function openMobileMenu() {
  monthFilter.classList.add('open');
  mobileMonthToggle.classList.add('open-menu');
}

function closeMobileMenu() {
  monthFilter.classList.remove('open');
  mobileMonthToggle.classList.remove('open-menu');
}


if (mobileMonthToggle && monthFilter) {
  mobileMonthToggle.addEventListener('click', () => { //Click en la hamburguesa
    const isOpen = monthFilter.classList.contains('open');
    isOpen ? closeMobileMenu() : openMobileMenu();
  });
}

//Cerrar menú hamburguesa siempre que se pulse un mes
monthFilter.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    closeMobileMenu();
  }
});


//Mover la hamburguesa directamente al "body" para evitar desplazamientos
(function moveMobileToggleToBody() {
  const btn = document.getElementById('mobile-month-toggle');
  if (!btn) return;

  if (btn.parentElement !== document.body) {
    document.body.appendChild(btn);
  }
})();

const mobileToggle = document.getElementById('mobile-month-toggle');

//Visibilidad de la hamburguesa según scroll
function controlHamburgerVisibility() {
  if (window.scrollY === 0) {
    mobileToggle.classList.remove('hidden');
  } else {
    mobileToggle.classList.add('hidden');
  }
}

//Al cargar la página
controlHamburgerVisibility();

//Al hacer scroll
window.addEventListener('scroll', controlHamburgerVisibility);