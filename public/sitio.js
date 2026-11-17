/* Sitio de Frix: arma la cabecera, el menu, la musica y el contenido de cada pagina a partir de datos.js */
(function () {
  'use strict';
  // Puerta: quien no entro por la pantalla de acceso (index.html) vuelve a ella, recordando a donde iba.
  // Es para que nadie llegue por casualidad: no es una contrasena de verdad.
  try {
    if (!sessionStorage.getItem('puerta')) {
      sessionStorage.setItem('destino', (location.pathname.split('/').pop() || 'inicio.html') + location.search + location.hash);
      location.replace(location.protocol === 'file:' ? 'index.html' : './' + String.fromCharCode(63) + Date.now()); // sin cache: evita una portada vieja guardada
      return;
    }
  } catch (e) { /* si el navegador no deja guardar nada, se deja pasar */ }
  const D = Object.assign({ perfil: {}, blog: [], diario: [], escritos: [], obras: [], galeria: [], musica: [], enlaces: [], cambios: [] }, window.DATOS || {});
  const P = Object.assign({ nombre: 'Frix', avatar: '', desde: '', lema: '', presentacion: '', gustos: [] }, D.perfil);
  const PAGINA = document.body.dataset.pagina || 'inicio';
  // Diario escondido: no sale en el menu ni en el inicio. Se abre con 5 clics seguidos al cubo
  // (dura hasta cerrar el navegador) y entonces aparece su boton en la Galeria.
  const diarioAbierto = () => { try { return sessionStorage.getItem('diario') === '1'; } catch (e) { return false; } };
  if (PAGINA === 'diario' && !diarioAbierto()) { location.replace('inicio.html'); return; }
  const $ = (s, r = document) => r.querySelector(s);

  // ---------- Utilidades ----------
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = (es, en) => es === en ? es : `<span lang="es">${es}</span><span lang="en">${en}</span>`;
  const par = o => (o && typeof o === 'object') ? [o.es || o.en || '', o.en || o.es || ''] : [String(o || ''), String(o || '')];
  const tx = o => { const [es, en] = par(o); return t(esc(es), esc(en)); };
  // Color: "# texto #FF0000" pinta ese texto (cualquier color en hexadecimal, dentro de una linea)
  const COLOR = /(^|\s)#\s+(.+?)\s*#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z])/g;
  function textoHTML(s) {
    return esc(s).split(/\n\s*\n/).filter(b => b.trim()).map(b => '<p>' + b.split('\n').map(l =>
      (l.startsWith('&gt;') ? `<span class="verde">${l}</span>` : l)
        .replace(COLOR, (m, a, txt, hex) => `${a}<span class="color" style="color:#${hex}">${txt}</span>`)
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    ).join('<br>') + '</p>').join('');
  }
  // Nombre corto para "Archivo:" (los enlaces de Google y similares no tienen un nombre legible)
  const nombreArchivo = u => {
    let ult = String(u).split(/[?#]/)[0].split('/').pop() || '';
    try { ult = decodeURIComponent(ult); } catch (e) {}
    const n = /\.[a-z0-9]{2,5}$/i.test(ult) ? ult : ((/^https?:\/\/([^/]+)/i.exec(u) || [])[1] || ult || 'imagen');
    return n.length > 40 ? n.slice(0, 37) + '…' : n;
  };
  const textoBi = o => { const [es, en] = par(o); return es === en ? textoHTML(es) : `<div lang="es">${textoHTML(es)}</div><div lang="en">${textoHTML(en)}</div>`; };
  const DIAS = { es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
  const dos = n => String(n).padStart(2, '0');
  function fechaTablon(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso || ''); if (!m) return '';
    const [, a, mes, d, h = '00', mi = '00'] = m; const dia = new Date(+a, +mes - 1, +d).getDay(); const yy = a.slice(2);
    return t(`${d}/${mes}/${yy}(${DIAS.es[dia]})${h}:${mi}`, `${mes}/${d}/${yy}(${DIAS.en[dia]})${h}:${mi}`);
  }
  function fechaCorta(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); if (!m) return '-';
    return t(`${m[3]}/${m[2]}/${m[1].slice(2)}`, `${m[2]}/${m[3]}/${m[1].slice(2)}`);
  }
  const MESES = { es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
  const mesAnio = iso => { const m = /^(\d{4})-(\d{2})/.exec(iso || ''); return m ? t(`${MESES.es[+m[2] - 1]} ${m[1]}`, `${MESES.en[+m[2] - 1]} ${m[1]}`) : '-'; };
  const porFecha = (a, b) => String(b.fecha || b.actualizado || '').localeCompare(String(a.fecha || a.actualizado || ''));
  const porFechaId = (a, b) => porFecha(a, b) || (Number(b.id) || 0) - (Number(a.id) || 0); // mismo dia: lo ultimo anotado primero
  const ejemplo = o => o && o.ejemplo ? `<span class="ejemplo">${t('ejemplo', 'example')}</span>` : '';
  const azar = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  // Capitulos: el HTML viene del panel (convertido desde .tintero). Solo se dejan etiquetas de formato simples.
  const limpiarHTML = h => String(h || '').replace(/<(\/?)([a-zA-Z0-9]+)[^>]*>/g, (m, c, tag) => /^(p|br|i|b|u|em|strong)$/i.test(tag) ? `<${c}${tag.toLowerCase()}>` : '');
  const capsDe = e => Array.isArray(e && e.capitulos) ? e.capitulos : [];
  const palabras = html => (String(html || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').match(/[^\s—–-]+/g) || []).length;
  const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  // Escritos: cada uno esta en un solo idioma (la version en ingles es otro escrito con #English)
  const sol = o => esc(par(o)[0]);
  const etiquetaEn = e => e && e.idioma === 'en' ? '<span class="etiqueta">#English</span>' : '';
  const versiones = e => D.escritos.filter(x => x !== e && x.id != null && (String(x.id) === String(e.version) || String(x.version) === String(e.id)));
  const tituloCap = (c, n) => c.titulo ? tx(c.titulo) : t(`Capítulo ${n}`, `Chapter ${n}`);

  const TIPOS = {
    anime: ['Anime', 'Anime', '#2e51a2'], manga: ['Manga', 'Manga', '#3f8a4a'], serie: ['Serie', 'TV series', '#b5651d'],
    pelicula: ['Película', 'Movie', '#8a2f6b'], libro: ['Libro', 'Book', '#5a6c7d'], comic: ['Cómic', 'Comic', '#b8862b'],
    juego: ['Juego', 'Game', '#2b7a78'], otro: ['Otro', 'Other', '#888888']
  };
  const ESTADO_OBRA = { 1: ['En curso', 'In progress'], 2: ['Completado', 'Completed'], 3: ['En pausa', 'On hold'], 4: ['Abandonado', 'Dropped'], 5: ['Planeado', 'Planned'] };
  const ESTADO_ESCRITO = { 1: ['Escribiendo', 'Writing'], 2: ['Terminado', 'Finished'], 3: ['En pausa', 'On hold'], 4: ['Abandonado', 'Dropped'], 5: ['Planeado', 'Planned'] };
  const TIPO_ESCRITO = { novela: ['Novela', 'Novel'], relato: ['Relato', 'Short story'], mundo: ['Mundo', 'World'], poema: ['Poema', 'Poem'], otro: ['Otro', 'Other'] };
  const nombreDe = (tabla, k) => { const v = tabla[k] || tabla.otro || ['-', '-']; return t(v[0], v[1]); };

  // Orden de las paginas: el pie y las flechas del teclado (que giran la mesa de una a otra)
  const PAGINAS = [
    ['inicio.html', 'inicio', 'Inicio', 'Home'], ['blog.html', 'blog', 'Blog', 'Blog'], ['escritos.html', 'escritos', 'Escritos', 'Writing'],
    ['obras.html', 'obras', 'Obras', 'Watched & read'], ['galeria.html', 'galeria', 'Galería', 'Gallery'], ['reglas.html', 'reglas', 'Reglas', 'Rules']
  ];
  // El menu son cuatro cartas, una por cada carta de la mesa de Usogui: Tiempo, Hombres, Lugar y Reglas.
  // Cada una tiene su punto cardinal y su guardian (el Cerco de los Cuatro Dioses), que usa la brujula.
  const GRUPOS = [
    { palo: '&#9824;', rojo: false, es: 'Tiempo', en: 'Time', pos: 'n', punto: ['Norte', 'North'], dios: ['Tortuga negra', 'Black Tortoise'],
      paginas: [['blog.html', 'blog', 'Blog', 'Blog'], ['reglas.html#bitacora', '', 'Bitácora', 'Log']] },
    { palo: '&#9829;', rojo: true, es: 'Hombres', en: 'People', pos: 's', punto: ['Sur', 'South'], dios: ['Ave bermellón', 'Vermilion Bird'],
      paginas: [['inicio.html', 'inicio', 'Inicio', 'Home'], ['escritos.html', 'escritos', 'Escritos', 'Writing']] },
    { palo: '&#9830;', rojo: true, es: 'Lugar', en: 'Place', pos: 'e', punto: ['Este', 'East'], dios: ['Dragón azul', 'Azure Dragon'],
      paginas: [['galeria.html', 'galeria', 'Galería', 'Gallery'], ['obras.html', 'obras', 'Obras', 'Watched & read']] },
    { palo: '&#9827;', rojo: false, es: 'Reglas', en: 'Rules', pos: 'o', punto: ['Oeste', 'West'], dios: ['Tigre blanco', 'White Tiger'],
      paginas: [['reglas.html', 'reglas', 'Reglas de la mesa', 'House rules'], ['reglas.html#enlazame', '', 'Enlázame', 'Link to me']] }
  ];
  const GRUPO = GRUPOS.find(g => g.paginas.some(p => p[1] && p[1] === PAGINA))
    || (PAGINA === 'leer' ? GRUPOS[/^#b-/.test(location.hash) ? 0 : 1] : null);

  // ---------- Cabecera, menu de cartas y pie ----------
  const avatarHTML = P.avatar ? `<img src="${esc(P.avatar)}" alt="">` : esc((P.nombre || 'F')[0]);
  const cab = $('#cabecera');
  if (cab) cab.innerHTML = `
    <div class="mini"><button type="button" class="tema-mesa" id="tema-mesa" aria-pressed="false" hidden>[${t('Mesa de juego', 'Card table')}]</button><div class="idioma" role="group" aria-label="Idioma / Language">[<button type="button" data-l="es" aria-pressed="true">Español</button>/<button type="button" data-l="en" aria-pressed="false">English</button>]</div></div>
    <header class="cabecera">
      <a class="logo" href="inicio.html">${esc(P.nombre)}</a>
      <span class="lema">${tx(P.lema)}</span>
      <div class="derecha">
        <div class="musica" id="musica">
          <button type="button" data-m="ant" aria-label="Canción anterior">&laquo;</button>
          <button type="button" data-m="play" aria-label="Reproducir">&#9658;</button>
          <button type="button" data-m="sig" aria-label="Canción siguiente">&raquo;</button>
          <button type="button" data-m="mute" aria-pressed="false" aria-label="Silenciar">&#9834;</button>
          <span class="titulo" id="musica-titulo"></span>
        </div>
        <button type="button" class="avatar-btn" id="avatar-btn" aria-expanded="false" aria-controls="menu-perfil" aria-label="Menú">${avatarHTML}</button>
      </div>
      <nav class="menu-perfil" id="menu-perfil" hidden aria-label="${esc(P.nombre)}">
        <div class="quien">${esc(P.nombre)}<span>${t('Elige una carta', 'Pick a card')}</span></div>
        <ul class="cartas">${GRUPOS.map((g, i) => `<li class="carta${g.rojo ? ' roja' : ''}${g === GRUPO ? ' actual' : ''}" style="--i:${i}">
          <div class="cara"><span class="indice" aria-hidden="true">${g.palo}</span><b>${t(g.es, g.en)}</b>
            <ul>${g.paginas.map(([href, id, es, en]) => `<li><a href="${href}"${id && id === PAGINA ? ' aria-current="page"' : ''}>${t(es, en)}</a></li>`).join('')}</ul>
            <span class="indice abajo" aria-hidden="true">${g.palo}</span></div>
          <div class="dorso" aria-hidden="true"></div></li>`).join('')}</ul>
      </nav>
    </header>`;
  const pie = $('#pie');
  if (pie) pie.innerHTML = `<footer class="pie">
      <div>[${PAGINAS.map(([href, , es, en]) => `<a href="${href}">${t(es, en)}</a>`).join(' / ')}]</div>
      <div class="botones"><a href="reglas.html#enlazame" title="${esc(P.nombre)}"><img src="boton-frix.png" width="88" height="31" alt="${esc(P.nombre)}"></a><span class="b88 m">MyAnimeList</span><span class="b88 c"><b>&#9824;&#9829;&#9830;&#9827;</b></span></div>
      <div class="cuenta-panuelos" id="cuenta-panuelos" hidden></div>
      <div>${t('Hecho a mano. Se ve bien en cualquier navegador.', 'Handmade. Looks fine in any browser.')}</div>
    </footer>`;

  const menuBtn = $('#avatar-btn'), menu = $('#menu-perfil');
  if (menuBtn) {
    const abrir = (v, foco) => {
      menu.hidden = !v; menuBtn.setAttribute('aria-expanded', String(v));
      if (v && foco) { const a = menu.querySelector('.actual a') || menu.querySelector('a'); if (a) a.focus(); }
    };
    // Con teclado (Enter o espacio) el foco pasa a la carta de la pagina actual
    menuBtn.addEventListener('click', e => { e.stopPropagation(); abrir(menu.hidden, e.detail === 0); });
    document.addEventListener('click', e => { if (!menu.hidden && (!menu.contains(e.target) || e.target.closest('a'))) abrir(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { abrir(false); menuBtn.focus(); } });
  }

  // ---------- Brujula: los cuatro puntos llevan a la primera pagina de cada carta ----------
  // Las flechas izquierda y derecha giran la mesa a la pagina anterior o siguiente.
  const brujula = document.createElement('nav');
  brujula.className = 'brujula'; brujula.setAttribute('aria-label', 'Brújula / Compass');
  brujula.innerHTML = `<p class="rotulo" aria-hidden="true"><span class="pista">${t('&larr; &rarr; gira la mesa', '&larr; &rarr; turns the table')}</span>
      ${GRUPOS.map(g => `<span class="r-${g.pos}">${t(`${g.punto[0]}: ${g.es}<br>${g.dios[0]}`, `${g.punto[1]}: ${g.en}<br>${g.dios[1]}`)}</span>`).join('')}</p>
    <div class="rosa">${GRUPOS.map(g => `<a class="dir d-${g.pos}${g.rojo ? ' roja' : ''}${g === GRUPO ? ' actual' : ''}" href="${g.paginas[0][0]}" data-pos="${g.pos}" aria-label="${g.punto[0]}: ${g.es} / ${g.punto[1]}: ${g.en}">${g.palo}</a>`).join('')}
      <span class="centro${GRUPO && GRUPO.rojo ? ' roja' : ''}" aria-hidden="true">${GRUPO ? GRUPO.palo : '&middot;'}</span></div>`;
  document.body.appendChild(brujula);
  const verRotulo = e => { const d = e.target.closest && e.target.closest('[data-pos]'); brujula.dataset.ver = d ? d.dataset.pos : ''; };
  brujula.addEventListener('mouseover', verRotulo); brujula.addEventListener('focusin', verRotulo);
  brujula.addEventListener('mouseleave', () => { brujula.dataset.ver = ''; }); brujula.addEventListener('focusout', () => { brujula.dataset.ver = ''; });
  const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented || PAGINA === 'leer') return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (document.querySelector('.visor:not([hidden])') || !menu.hidden) return;
    const i = PAGINAS.findIndex(p => p[1] === PAGINA); if (i < 0) return;
    const der = e.key === 'ArrowRight', destino = PAGINAS[(i + (der ? 1 : -1) + PAGINAS.length) % PAGINAS.length][0];
    if (menosMovimiento) { location.href = destino; return; }
    $('.rosa', brujula).classList.add(der ? 'gira-der' : 'gira-izq');
    setTimeout(() => { location.href = destino; }, 200);
  });
  addEventListener('pageshow', e => { if (e.persisted) $('.rosa', brujula).classList.remove('gira-der', 'gira-izq'); });

  // ---------- Idioma (se recuerda en el navegador) ----------
  const leer = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  function idioma(l) {
    document.documentElement.dataset.lang = l; document.documentElement.lang = l;
    document.querySelectorAll('[data-l]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === l)));
    guardar('idioma', l);
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (b) idioma(b.dataset.l); });
  // 5 clics seguidos al cubo (menos de 1,5 s entre uno y otro) abren el diario
  let clicsCubo = 0, ultimoClic = 0;
  document.addEventListener('click', e => {
    const cubo = e.target.closest('#cubo'); if (!cubo) return;
    const ahora = Date.now(); clicsCubo = ahora - ultimoClic < 1500 ? clicsCubo + 1 : 1; ultimoClic = ahora;
    if (clicsCubo < 5 || diarioAbierto()) return;
    clicsCubo = 0;
    try { sessionStorage.setItem('diario', '1'); } catch (err) { return; }
    cubo.classList.remove('abierto'); void cubo.offsetWidth; cubo.classList.add('abierto');
    const extra = document.querySelector('.extra-diario'); if (extra) extra.hidden = false;
  });
  // Imagenes de las entradas: un clic las agranda ahi mismo (como en 4chan) y otro las achica.
  // Con Ctrl o clic del medio se sigue abriendo en otra pestana.
  document.addEventListener('click', e => {
    const a = e.target.closest('a.img'); if (!a || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const grande = a.classList.toggle('grande');
    a.setAttribute('aria-expanded', grande);
    if (!grande && a.getBoundingClientRect().top < 0) a.scrollIntoView({ block: 'nearest' });
  });
  idioma(leer('idioma', 'es') === 'en' ? 'en' : 'es');

  // ---------- Panuelos: siete escondidos, uno por pagina. Juntarlos todos abre la Mesa de juego ----------
  const PANUELOS = ['inicio', 'blog', 'escritos', 'obras', 'galeria', 'leer', 'reglas'];
  const SVG_PANUELO = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M2.5 3.5 12 2l1.6 9.6L4 13.8Z" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-linejoin="round"/><path d="M4.5 5.3l6.1-1 1 6-6.1 1.4Z" fill="none" stroke="currentColor" stroke-width=".8" stroke-dasharray="1.2 1.1"/><path d="M12 2l-.5 2.5 2.1-.3" fill="none" stroke="currentColor" stroke-width=".9" stroke-linejoin="round"/></svg>';
  const hallados = () => { const h = leer('panuelos', []); return PANUELOS.filter(p => Array.isArray(h) && h.includes(p)); };
  const panuelo = id => hallados().includes(id) ? '' : `<button type="button" class="panuelo" data-panuelo="${id}" aria-label="Pañuelo / Handkerchief">${SVG_PANUELO}</button>`;
  const mesaAbierta = () => hallados().length === PANUELOS.length;
  const progresoPanuelos = () => {
    const h = hallados();
    return `<div class="panuelos-mesa">${PANUELOS.map(p => `<span class="hueco${h.includes(p) ? ' lleno' : ''}">${SVG_PANUELO}</span>`).join('')}</div>
      <p>${h.length === PANUELOS.length ? t('Los encontraste todos. La Mesa de juego se prende y se apaga arriba, junto al idioma.', 'You found them all. Turn the card table on or off at the top, next to the language.')
        : t(`Encontraste ${h.length} de ${PANUELOS.length}. Hay uno escondido en cada página. Si juntas los siete, la mesa cambia.`, `You found ${h.length} of ${PANUELOS.length}. One is hidden on each page. Collect all seven and the table changes.`)}</p>`;
  };
  function aviso(html) {
    let a = $('#aviso');
    if (!a) { a = document.createElement('div'); a.id = 'aviso'; a.className = 'aviso'; a.setAttribute('role', 'status'); document.body.appendChild(a); }
    a.innerHTML = html; a.classList.add('sale');
    clearTimeout(aviso.reloj); aviso.reloj = setTimeout(() => a.classList.remove('sale'), 4500);
  }
  function tema(mesa) {
    if (mesa) document.documentElement.dataset.tema = 'mesa'; else delete document.documentElement.dataset.tema;
    guardar('tema', mesa ? 'mesa' : '');
    document.dispatchEvent(new Event('tema'));
    pintarPanuelos();
  }
  function pintarPanuelos() {
    const n = hallados().length, c = $('#cuenta-panuelos'), b = $('#tema-mesa'), r = $('#progreso-panuelos');
    if (c && n) { c.hidden = false; c.innerHTML = `${SVG_PANUELO}<span>${t('Pañuelos', 'Handkerchiefs')}: ${n}/${PANUELOS.length}</span>`; }
    if (b) { b.hidden = !mesaAbierta(); b.setAttribute('aria-pressed', String(document.documentElement.dataset.tema === 'mesa')); }
    if (r) r.innerHTML = progresoPanuelos();
  }
  document.addEventListener('click', e => {
    if (e.target.closest('#tema-mesa')) { tema(document.documentElement.dataset.tema !== 'mesa'); return; }
    const p = e.target.closest('[data-panuelo]'); if (!p) return;
    const lista = hallados(); if (lista.includes(p.dataset.panuelo)) return;
    lista.push(p.dataset.panuelo); guardar('panuelos', lista);
    p.disabled = true; p.classList.add('vuela'); setTimeout(() => p.remove(), 600);
    if (lista.length === PANUELOS.length) {
      tema(true);
      aviso(t('Encontraste los siete pañuelos. La mesa cambió: puedes volver a la de siempre arriba, en [Mesa de juego].', 'You found all seven handkerchiefs. The table changed: switch back at the top, in [Card table].'));
    } else {
      aviso(SVG_PANUELO + ' ' + t(`Encontraste un pañuelo. Llevas ${lista.length} de ${PANUELOS.length}.`, `You found a handkerchief. ${lista.length} of ${PANUELOS.length} so far.`));
      pintarPanuelos();
    }
  });
  pintarPanuelos();

  // ---------- Lluvia de palos y fichas en los costados vacios de la pantalla ----------
  // Solo cae fuera de la columna del sitio (nunca detras del texto), se para con la pestana oculta
  // y no aparece si el sistema pide menos movimiento.
  (function lluvia() {
    if (menosMovimiento) return;
    const cv = document.createElement('canvas'); cv.className = 'lluvia'; cv.setAttribute('aria-hidden', 'true');
    const ctx = cv.getContext('2d'); if (!ctx) return;
    document.body.prepend(cv);
    const ANCHO = 980, PALOS = ['♠', '♥', '♦', '♣'], FICHAS = ['#af0a0f', '#1d3f8f', '#1b1b1b', '#1e7a3b'];
    let w = 0, h = 0, g = 0, cosas = [], col = {}, corriendo = false, antes = 0;
    const nueva = arriba => {
      const izq = Math.random() < 0.5, x = 14 + Math.random() * (g - 28);
      return { x: izq ? x : w - x, y: arriba ? -30 - Math.random() * 80 : Math.random() * h, v: 12 + Math.random() * 20, r: Math.random() * 6.3,
        vr: (Math.random() - 0.5) * 0.7, f: Math.random() * 6.3, s: 14 + Math.random() * 14, k: Math.floor(Math.random() * 6), c: FICHAS[Math.floor(Math.random() * 4)] };
    };
    function colores() { const cs = getComputedStyle(document.documentElement); col = { negro: cs.getPropertyValue('--texto').trim() || '#000', rojo: cs.getPropertyValue('--rojo').trim() || '#a00' }; }
    function medir() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight; g = (w - ANCHO) / 2 - 8;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cosas = g < 70 ? [] : Array.from({ length: Math.round(Math.min(16, g / 15)) }, () => nueva(false));
      ctx.clearRect(0, 0, w, h);
    }
    function paso(ahora) {
      if (!corriendo) return;
      const dt = Math.min(0.05, (ahora - antes) / 1000); antes = ahora;
      ctx.clearRect(0, 0, w, h);
      for (const c of cosas) {
        c.y += c.v * dt; c.r += c.vr * dt; c.f += dt * 0.8;
        if (c.y > h + 30) Object.assign(c, nueva(true));
        ctx.save(); ctx.translate(c.x + Math.sin(c.f) * 8, c.y); ctx.rotate(c.r);
        if (c.k < 4) {
          ctx.globalAlpha = c.k % 3 === 0 ? 0.1 : 0.13; ctx.fillStyle = c.k % 3 === 0 ? col.negro : col.rojo;
          ctx.font = `${c.s}px Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(PALOS[c.k], 0, 0);
        } else {
          const r = c.s * 0.45;
          ctx.globalAlpha = 0.16; ctx.fillStyle = c.c; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.3); ctx.fill();
          ctx.globalAlpha = 0.3; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.setLineDash([2.4, 2.4]); ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, 6.3); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.restore();
      }
      requestAnimationFrame(paso);
    }
    const arrancar = () => { if (corriendo || !cosas.length || document.hidden) return; corriendo = true; antes = performance.now(); requestAnimationFrame(paso); };
    const parar = () => { corriendo = false; };
    document.addEventListener('visibilitychange', () => { if (document.hidden) parar(); else arrancar(); });
    let espera; addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(() => { parar(); medir(); arrancar(); }, 150); });
    document.addEventListener('tema', colores);
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', colores);
    colores(); medir(); arrancar();
  })();

  // ---------- Musica aleatoria ----------
  // Neocities gratis no acepta mp3: las canciones subidas a musica/ se toman de la copia del sitio en GitHub Pages
  const ESPEJO = 'https://aeshilfrix.github.io/sitio-frix/';
  const urlAudio = u => /^musica\//.test(u) && /neocities\.org$/.test(location.hostname) ? ESPEJO + u : u;
  (function musica() {
    const caja = $('#musica'); if (!caja) return;
    const lista = (D.musica || []).filter(c => c && c.url);
    const tit = $('#musica-titulo'), bPlay = caja.querySelector('[data-m="play"]'), bMute = caja.querySelector('[data-m="mute"]');
    if (!lista.length) {
      caja.querySelectorAll('button').forEach(b => { b.disabled = true; });
      caja.title = 'Sin canciones todavía: agrégalas en el panel / No songs yet';
      tit.textContent = '♪ —'; return;
    }
    const e = leer('musica', {});
    let orden = Array.isArray(e.orden) && e.orden.length === lista.length ? e.orden : azar(lista.map((_, i) => i));
    let i = Number.isInteger(e.i) && e.i < orden.length ? e.i : 0;
    let quiere = e.quiere !== false, fallos = 0;
    const audio = new Audio(); audio.preload = 'metadata'; audio.muted = !!e.mute; audio.volume = 0.6;
    function cargar(n, desde) {
      i = (n + orden.length) % orden.length; const c = lista[orden[i]];
      audio.src = urlAudio(c.url); tit.textContent = '♪ ' + (c.titulo || ''); tit.title = c.titulo || '';
      if (desde) audio.addEventListener('loadedmetadata', () => { try { audio.currentTime = desde; } catch (err) {} }, { once: true });
    }
    function ui() {
      const sonando = !audio.paused;
      bPlay.innerHTML = sonando ? '&#10074;&#10074;' : '&#9658;'; bPlay.setAttribute('aria-label', sonando ? 'Pausar' : 'Reproducir');
      bMute.setAttribute('aria-pressed', String(audio.muted)); bMute.style.textDecoration = audio.muted ? 'line-through' : 'none';
    }
    function tocar() { audio.play().then(() => { fallos = 0; ui(); }).catch(() => { ui(); esperar(); }); }
    function esperar() {
      const arrancar = ev => { if (ev.target.closest && ev.target.closest('#musica')) return; document.removeEventListener('pointerdown', arrancar, true); document.removeEventListener('keydown', arrancar, true); if (quiere && audio.paused) tocar(); };
      document.addEventListener('pointerdown', arrancar, true); document.addEventListener('keydown', arrancar, true);
    }
    audio.addEventListener('ended', () => { cargar(i + 1); tocar(); });
    audio.addEventListener('error', () => { if (++fallos < lista.length) { cargar(i + 1); if (quiere) tocar(); } else { tit.textContent = '♪ ' + 'no se pudo cargar'; } });
    audio.addEventListener('play', ui); audio.addEventListener('pause', ui);
    caja.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      const m = b.dataset.m;
      if (m === 'play') { if (audio.paused) { quiere = true; tocar(); } else { quiere = false; audio.pause(); } }
      if (m === 'sig') { cargar(i + 1); quiere = true; tocar(); }
      if (m === 'ant') { cargar(i - 1); quiere = true; tocar(); }
      if (m === 'mute') { audio.muted = !audio.muted; ui(); }
    });
    addEventListener('pagehide', () => guardar('musica', { orden, i, t: audio.currentTime || 0, quiere, mute: audio.muted }));
    cargar(i, e.t || 0); ui(); if (quiere) tocar();
  })();

  // ---------- Bloques reutilizables ----------
  function postHTML(p, tablero, op) {
    const img = p.imagen ? `<div class="archivo">${t('Archivo:', 'File:')} <a href="${esc(p.imagen)}" target="_blank" rel="noopener">${esc(nombreArchivo(p.imagen))}</a></div><a class="img" href="${esc(p.imagen)}" aria-expanded="false" title="Clic para agrandar / Click to expand"><img src="${esc(p.imagen)}" alt="" loading="lazy"></a>` : '';
    return `<article class="post${op ? ' op' : ''}" id="${tablero}-${p.id}">${img}
      <div class="cab"><span class="asunto">${tx(p.titulo)}</span><span class="autor">${esc(P.nombre)}</span><span>${fechaTablon(p.fecha)}</span><span>No.${String(p.id).padStart(6, '0')}</span><a href="leer.html#${tablero}-${p.id}">[${t('Leer', 'Read')}]</a>${ejemplo(p)}</div>
      <div class="texto">${textoBi(p.texto)}</div></article>`;
  }
  function tituloTablon(codigo, es, en) {
    return `<div class="tablon">${codigo === 'fx' ? `<button type="button" class="banner" id="banner" aria-label="Cambiar banner / Change banner"></button>` : ''}
      <h1>/${codigo}/ - ${t(es, en)}</h1></div><hr>`;
  }
  function activarBanner() {
    const banner = $('#banner'); if (!banner) return;
    const bs = [`<span class="b1">${esc((P.nombre || 'FRIX').toUpperCase())}</span>`, '<span class="b2">&#9829; &#9824; &#9830; &#9827;</span>', '<span class="b3"><i>/fx/</i></span>'];
    let n = Math.floor(Math.random() * bs.length);
    const poner = () => { banner.innerHTML = bs[n]; }; poner();
    banner.addEventListener('click', () => { n = (n + 1) % bs.length; poner(); });
  }
  const vacio = (es, en) => `<p class="vacio">${t(es, en)}</p>`;
  // ---------- Paneles vivos del inicio ----------
  const hoyISO = () => new Date().toISOString().slice(0, 10);
  // Frase del dia: la misma todo el dia, cambia al siguiente
  function fraseDelDia() {
    const f = (P.frases || []).filter(x => par(x)[0]); if (!f.length) return '';
    const d = new Date(), dia = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    return f[(dia + d.getFullYear()) % f.length];
  }
  // Ultima actualizacion: lo mas nuevo que se ve en el sitio (el diario no cuenta: es secreto)
  function ultimaActualizacion() {
    const fechas = [...D.blog.map(p => p.fecha), ...D.obras.map(o => o.fecha), ...(D.cambios || []).map(c => c.fecha),
      ...D.escritos.flatMap(e => [e.actualizado, ...capsDe(e).map(c => c.fecha)])].filter(Boolean).map(f => String(f).slice(0, 10)).sort();
    return fechas[fechas.length - 1] || '';
  }
  function ultimoCapitulo() {
    let mejor = null;
    D.escritos.forEach(e => capsDe(e).forEach((c, n) => { if (!mejor || String(c.fecha || '') > String(mejor.c.fecha || '')) mejor = { e, c, n: n + 1 }; }));
    return mejor;
  }
  function ahoraMismoHTML() {
    const viendo = D.obras.filter(o => String(o.estado) === '1').sort(porFecha).slice(0, 4);
    const cap = ultimoCapitulo();
    const tarjetas = [];
    if (P.discord) tarjetas.push(`<div class="tarjeta" id="ahora-discord" hidden><h3>${t('Escuchando', 'Listening')}</h3><div class="disco" id="discord-cuerpo"></div></div>`);
    if (viendo.length) tarjetas.push(`<div class="tarjeta"><h3>${t('Viendo y leyendo', 'Watching & reading')}</h3><ul class="viendo">${viendo.map(o => `<li><a href="obras.html" title="${esc(o.titulo)}">${o.portada ? `<img src="${esc(o.portada)}" alt="" loading="lazy">` : `<span class="sin-portada" aria-hidden="true">${esc((o.titulo || '?')[0])}</span>`}<span>${esc(o.titulo)}</span></a></li>`).join('')}</ul></div>`);
    if (cap) tarjetas.push(`<div class="tarjeta"><h3>${t('Último capítulo', 'Latest chapter')}</h3><p class="ultimo-cap"><a href="leer.html#e-${cap.e.id}-c${cap.n}">${tituloCap(cap.c, cap.n)}</a><span>${sol(cap.e.titulo)}${etiquetaEn(cap.e)}</span><span class="tenue">${fechaCorta(cap.c.fecha)}</span></p></div>`);
    if (!tarjetas.length) return '';
    return `<section class="seccion ahora-mismo"><h2><span aria-hidden="true">&#9827;</span>${t('Ahora mismo', 'Right now')}</h2><div class="ahora">${tarjetas.join('')}</div></section>`;
  }
  // Discord (Lanyard): lo que suena en Liner u otra actividad, y el estado
  const ESTADO_DISCORD = { online: ['En línea', 'Online', '#3ba55d'], idle: ['Ausente', 'Away', '#faa81a'], dnd: ['No molestar', 'Do not disturb', '#ed4245'], offline: ['Desconectado', 'Offline', '#80848e'] };
  function imagenActividad(a) {
    const li = a.assets && a.assets.large_image; if (!li) return '';
    if (li.startsWith('mp:')) return 'https://media.discordapp.net/' + li.slice(3);
    if (li.startsWith('spotify:')) return 'https://i.scdn.co/image/' + li.slice(8);
    return a.application_id ? `https://cdn.discordapp.com/app-assets/${a.application_id}/${li}.png` : '';
  }
  let relojCancion = null;
  async function pintarDiscord() {
    const caja = $('#ahora-discord'), cuerpo = $('#discord-cuerpo'); if (!caja || !P.discord) return;
    let d;
    try {
      const j = await (await fetch('https://api.lanyard.rest/v1/users/' + encodeURIComponent(P.discord), { cache: 'no-store' })).json();
      if (!j.success) { caja.hidden = true; return; }
      d = j.data;
    } catch (e) { caja.hidden = true; return; }
    const acts = d.activities || [];
    const musica = acts.find(a => /liner/i.test(a.name || '')) || acts.find(a => a.type === 2);
    const otra = acts.find(a => a !== musica && (a.type === 0 || a.type === 3));
    const propio = acts.find(a => a.type === 4 && a.state);
    const [es, en, color] = ESTADO_DISCORD[d.discord_status] || ESTADO_DISCORD.offline;
    const estado = `<span class="punto-estado" style="background:${color}" aria-hidden="true"></span>${t(es, en)}`;
    clearInterval(relojCancion);
    let html;
    if (musica) {
      const img = musica === acts.find(a => a.id === 'spotify:1') && d.spotify ? d.spotify.album_art_url : imagenActividad(musica);
      const titulo = musica.details || (d.spotify && d.spotify.song) || musica.name;
      const artista = musica.state || (d.spotify && d.spotify.artist) || '';
      const ts = musica.timestamps || {};
      html = `${img ? `<img src="${esc(img)}" alt="" referrerpolicy="no-referrer">` : '<span class="sin-portada" aria-hidden="true">&#9835;</span>'}
        <div class="disco-texto"><b>${esc(titulo)}</b>${artista ? `<span>${esc(artista)}</span>` : ''}<span class="tenue">${t('en', 'on')} ${esc(musica.name || 'Liner')} · ${estado}</span>
        ${ts.start && ts.end ? '<div class="barra-cancion"><i id="barra-cancion"></i></div>' : ''}</div>`;
      $('#ahora-discord h3').innerHTML = t('Escuchando', 'Listening');
      if (ts.start && ts.end) {
        const mover = () => { const b = $('#barra-cancion'); if (!b) return; b.style.width = Math.max(0, Math.min(100, (Date.now() - ts.start) / (ts.end - ts.start) * 100)) + '%'; };
        setTimeout(mover); relojCancion = setInterval(mover, 1000);
      }
    } else {
      $('#ahora-discord h3').innerHTML = t('En Discord', 'On Discord');
      html = `<div class="disco-texto">${otra ? `<b>${t(otra.type === 3 ? 'Viendo' : 'Jugando', otra.type === 3 ? 'Watching' : 'Playing')} ${esc(otra.name)}</b>${otra.details ? `<span>${esc(otra.details)}</span>` : ''}` : ''}
        ${propio ? `<span>${esc(propio.state)}</span>` : ''}<span class="tenue">${estado}</span></div>`;
    }
    cuerpo.innerHTML = html; caja.hidden = false;
  }
  // Fichas: contador de visitas (una por visita, no por pagina) con Abacus.
  // Ese servicio a veces tarda: se muestra al instante el ultimo numero conocido y se actualiza al llegar.
  async function pintarFichas() {
    const caja = $('#fichas'); if (!caja) return;
    const mostrar = v => {
      caja.innerHTML = String(v).padStart(4, '0').split('').map((c, i) => `<span class="ficha f${i % 4}">${c}</span>`).join('');
      caja.setAttribute('aria-label', `${v} visitas / visits`);
    };
    const guardado = leer('fichas-ultimo', null);
    if (typeof guardado === 'number') mostrar(guardado); else caja.innerHTML = '<span class="ficha f0">·</span><span class="ficha f1">·</span><span class="ficha f2">·</span><span class="ficha f3">·</span>';
    let nueva = false; try { nueva = !sessionStorage.getItem('visita'); sessionStorage.setItem('visita', '1'); } catch (e) {}
    try {
      const r = await fetch(`https://abacus.jasoncameron.dev/${nueva ? 'hit' : 'get'}/aeshilfrix-sitio/visitas`, { cache: 'no-store' });
      const v = (await r.json()).value;
      if (typeof v !== 'number') throw new Error();
      mostrar(v); guardar('fichas-ultimo', v);
    } catch (e) { if (typeof guardado !== 'number') caja.closest('.caja').hidden = true; }
  }
  const caja = (tituloEs, tituloEn, cuerpo, enlace) => `<section class="caja"><h3>${t(tituloEs, tituloEn)}${enlace || ''}</h3><div class="dentro">${cuerpo}</div></section>`;

  function estadisticas() {
    const ob = D.obras || [], total = ob.length;
    if (!total) return vacio('Todavía no hay obras registradas.', 'No titles logged yet.');
    const cuenta = {}; ob.forEach(o => { cuenta[o.tipo] = (cuenta[o.tipo] || 0) + 1; });
    const tipos = Object.keys(TIPOS).filter(k => cuenta[k]);
    const notas = ob.filter(o => o.nota > 0), media = notas.length ? (notas.reduce((s, o) => s + Number(o.nota), 0) / notas.length).toFixed(2) : '-';
    return `<div class="barra-tipos" role="img" aria-label="${tipos.map(k => TIPOS[k][0] + ': ' + cuenta[k]).join(', ')}">${tipos.map(k => `<i style="width:${cuenta[k] / total * 100}%;background:${TIPOS[k][2]}"></i>`).join('')}</div>
      <table class="datos">${tipos.map(k => `<tr><td><i class="punto" style="background:${TIPOS[k][2]}"></i>${t(TIPOS[k][0], TIPOS[k][1])}</td><td>${cuenta[k]}</td></tr>`).join('')}
      <tr><td>${t('Completadas', 'Completed')}</td><td>${ob.filter(o => +o.estado === 2).length}</td></tr>
      <tr><td>${t('En curso', 'In progress')}</td><td>${ob.filter(o => +o.estado === 1).length}</td></tr>
      <tr><td>${t('Nota media', 'Mean score')}</td><td>${media}</td></tr></table>`;
  }

  // ---------- Paginas ----------
  const C = $('#contenido');
  const R = {
    inicio() {
      const novedades = [...D.blog.map(p => ['Blog', 'Blog', p, 'b-' + p.id]),
        ...D.escritos.flatMap(e => {
          const caps = capsDe(e);
          const es = par(e.titulo)[0] + (e.idioma === 'en' ? ' #English' : '');
          if (!caps.length) return [['Escrito', 'Writing', { fecha: e.actualizado, titulo: es }, 'e-' + e.id]];
          // Solo los 2 ultimos capitulos de cada escrito, el mas nuevo primero
          return caps.map((c, n) => ['Capítulo', 'Chapter', { fecha: c.fecha || e.actualizado, titulo: { es: `${es}, cap. ${n + 1}`, en: `${es}, ch. ${n + 1}` } }, `e-${e.id}-c${n + 1}`]).slice(-2).reverse();
        })]
        .sort((a, b) => porFecha(a[2], b[2])).slice(0, 5);
      const galeria = azar(D.galeria.map((g, n) => [g, n])).slice(0, 4);
      C.innerHTML = tituloTablon('fx', esc(P.nombre), esc(P.nombre)) + `
        <div class="novedades"><b>${t('Novedades:', 'News:')}</b><div class="cinta"><p>${novedades.length ? novedades.map(([es, en, p, h]) => `${fechaCorta(p.fecha)} - ${t(es, en)}: <a href="leer.html#${h}">${tx(p.titulo)}</a>`).join(' &nbsp; &#9670; &nbsp; ') : t('Sin novedades todavía.', 'Nothing new yet.')}</p></div></div>
        <div class="cuerpo">
          <aside class="lado">
            ${caja('Sobre mí', 'About me', `<div class="avatar-grande">${avatarHTML}</div>${textoBi(P.presentacion) || vacio('Escribe tu presentación en el panel.', 'Write your introduction in the panel.')}
              <table class="datos"><tr><td>${t('Desde', 'Since')}</td><td>${mesAnio(P.desde)}</td></tr><tr><td>${t('Entradas', 'Posts')}</td><td>${D.blog.length}</td></tr><tr><td>${t('Escritos', 'Writing')}</td><td>${D.escritos.length}</td></tr><tr><td>${t('Obras', 'Titles')}</td><td>${D.obras.length}</td></tr></table>`)}
            ${fraseDelDia() ? caja('Frase del día', 'Quote of the day', `<blockquote class="frase">${tx(fraseDelDia())}</blockquote>`) : ''}
            ${caja('Me gusta', 'I like', P.gustos.length ? `<ul class="gustos">${P.gustos.map(g => `<li>${tx(g)}</li>`).join('')}</ul>` : vacio('Agrega tus gustos en el panel.', 'Add what you like in the panel.'))}
            ${caja('Estadísticas', 'Stats', estadisticas(), `<a href="obras.html">${t('Ver todo', 'View all')}</a>`)}
            ${caja('Galería', 'Gallery', galeria.length ? `<div class="mini-galeria">${galeria.map(([g, n]) => `<a href="galeria.html#g-${n}" title="${esc(par(g.texto)[0])}"><img src="${esc(g.archivo)}" alt="${esc(par(g.texto)[0])}" loading="lazy"></a>`).join('')}</div>` : vacio('Sube imágenes y agrégalas en el panel.', 'Upload images and add them in the panel.'), `<a href="galeria.html">${t('Ver todo', 'View all')}</a>`)}
            ${(D.cambios || []).length ? caja('Bitácora de la mesa', 'Table log', `<ul class="bitacora">${[...D.cambios].sort(porFechaId).slice(0, 6).map(c => `<li><span class="tenue">${fechaCorta(c.fecha)}</span> ${tx(c.texto)}</li>`).join('')}</ul>`) : ''}
            ${caja('Fichas', 'Chips', `<div class="fichas" id="fichas" role="img" aria-label="…"></div><table class="datos"><tr><td>${t('Abierto', 'Opened')}</td><td>${mesAnio(P.desde)}</td></tr><tr><td>${t('Actualizado', 'Updated')}</td><td>${fechaCorta(ultimaActualizacion())}</td></tr></table>`, panuelo('inicio'))}
            ${caja('Enlaces', 'Links', D.enlaces.length ? `<ul class="enlaces-lista">${D.enlaces.map(l => `<li><a href="${esc(l.url)}">${esc(l.nombre)}</a><span>${esc(l.detalle || '')}</span></li>`).join('')}</ul>` : vacio('Sin enlaces.', 'No links.'))}
          </aside>
          <main class="principal">
            ${ahoraMismoHTML()}
            <section class="seccion"><h2><span class="rojo" aria-hidden="true">&#9829;</span>Blog<a href="blog.html">${t('Ver todo', 'View all')}</a></h2>
              ${[...D.blog].sort(porFecha).slice(0, 5).map(p => postHTML(p, 'b', true)).join('') || vacio('Todavía no hay entradas.', 'No posts yet.')}
              ${D.blog.length > 5 ? `<p class="mas"><a href="blog.html">${t(`Ver las ${D.blog.length - 5} entradas anteriores en el Blog`, `See the ${D.blog.length - 5} older posts in the Blog`)} &raquo;</a></p>` : ''}</section>
          </main>
        </div>`;
      activarBanner();
      pintarFichas();
      pintarDiscord();
      setInterval(() => { if (!document.hidden) pintarDiscord(); }, 30000);
    },
    blog() {
      C.innerHTML = tituloTablon('fx', 'Blog', 'Blog') + `<section class="seccion"><p class="nota">${t('Cosas sobre mí: lo que veo, leo y juego.', 'Things about me: what I watch, read and play.')}${panuelo('blog')}</p>
        ${[...D.blog].sort(porFecha).map(p => postHTML(p, 'b', true)).join('') || vacio('Todavía no hay entradas.', 'No posts yet.')}</section>`;
    },
    diario() {
      C.innerHTML = tituloTablon('dia', 'Diario', 'Journal') + `<section class="seccion"><p class="nota">${t('Entradas cortas sobre mis días.', 'Short entries about my days.')}</p>
        ${[...D.diario].sort(porFecha).map(p => postHTML(p, 'd', false)).join('') || vacio('Todavía no hay entradas.', 'No entries yet.')}</section>`;
    },
    escritos() {
      const filas = [...D.escritos].sort(porFecha).map((e, n) => `<tr><td class="st s-${e.estado}"></td><td class="n">${n + 1}</td>
        <td><a href="leer.html#e-${e.id}">${sol(e.titulo)}</a>${etiquetaEn(e)}${ejemplo(e)}${par(e.resumen)[0] ? `<div class="archivo">${sol(e.resumen)}</div>` : ''}</td>
        <td>${nombreDe(TIPO_ESCRITO, e.tipo)}</td><td class="n">${capsDe(e).length || '-'}</td><td>${nombreDe(ESTADO_ESCRITO, e.estado)}</td><td>${fechaCorta(e.actualizado)}</td></tr>`).join('');
      C.innerHTML = tituloTablon('esc', 'Escritos', 'Writing') + `<section class="seccion"><p class="nota">${t('Todo lo que escribo, ordenado como una lista.', 'Everything I write, sorted like a list.')}</p>
        ${filas ? `<div class="tabla-wrap"><table class="lista"><thead><tr><th></th><th>#</th><th>${t('Título', 'Title')}</th><th>${t('Tipo', 'Type')}</th><th>${t('Caps.', 'Ch.')}</th><th>${t('Estado', 'Status')}</th><th>${t('Actualizado', 'Updated')}</th></tr></thead><tbody>${filas}</tbody></table></div>
        <div class="leyenda">${[1, 2, 3, 4, 5].map(k => `<span><i class="s-${k}"></i>${nombreDe(ESTADO_ESCRITO, k)}</span>`).join('')}${panuelo('escritos')}</div>` : vacio('Todavía no hay escritos.', 'No writing yet.')}</section>`;
    },
    obras() {
      let fTipo = 'todo', fEstado = 'todo';
      const pintar = () => {
        const lista = [...D.obras].filter(o => (fTipo === 'todo' || o.tipo === fTipo) && (fEstado === 'todo' || String(o.estado) === fEstado)).sort(porFecha);
        $('#obras-filas').innerHTML = lista.map((o, n) => `<tr><td class="st s-${o.estado}"></td><td class="n">${n + 1}</td>
          <td class="portada"><div>${o.portada ? `<img src="${esc(o.portada)}" alt="" loading="lazy">` : ''}</div></td>
          <td>${esc(o.titulo)}${ejemplo(o)}</td><td>${nombreDe(TIPOS, o.tipo)}</td><td>${esc(o.anio || '-')}</td><td>${nombreDe(ESTADO_OBRA, o.estado)}</td><td class="nota">${o.nota > 0 ? esc(o.nota) : '-'}</td><td>${fechaCorta(o.fecha)}</td></tr>`).join('')
          || `<tr><td colspan="9" class="vacio">${t('Nada con estos filtros.', 'Nothing matches these filters.')}</td></tr>`;
        document.querySelectorAll('[data-ft]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ft === fTipo)));
        document.querySelectorAll('[data-fe]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fe === fEstado)));
      };
      const tipos = Object.keys(TIPOS).filter(k => D.obras.some(o => o.tipo === k));
      C.innerHTML = tituloTablon('obr', 'Obras', 'Watched & read') + `<div class="cuerpo">
        <aside class="lado">${caja('Estadísticas', 'Stats', estadisticas(), panuelo('obras'))}</aside>
        <main class="principal"><section class="seccion"><p class="nota">${t('Todo lo que veo, leo y juego: anime, manga, series, películas, libros, cómics y más.', 'Everything I watch, read and play: anime, manga, series, movies, books, comics and more.')}</p>
          <div class="filtros"><b>${t('Tipo:', 'Type:')}</b><button type="button" data-ft="todo">${t('Todo', 'All')}</button>${tipos.map(k => `<button type="button" data-ft="${k}">${nombreDe(TIPOS, k)}</button>`).join('')}</div>
          <div class="filtros"><b>${t('Estado:', 'Status:')}</b><button type="button" data-fe="todo">${t('Todo', 'All')}</button>${[1, 2, 3, 4, 5].map(k => `<button type="button" data-fe="${k}">${nombreDe(ESTADO_OBRA, k)}</button>`).join('')}</div>
          <div class="tabla-wrap"><table class="lista"><thead><tr><th></th><th>#</th><th></th><th>${t('Título', 'Title')}</th><th>${t('Tipo', 'Type')}</th><th>${t('Año', 'Year')}</th><th>${t('Estado', 'Status')}</th><th>${t('Nota', 'Score')}</th><th>${t('Fecha', 'Date')}</th></tr></thead><tbody id="obras-filas"></tbody></table></div>
          <div class="leyenda">${[1, 2, 3, 4, 5].map(k => `<span><i class="s-${k}"></i>${nombreDe(ESTADO_OBRA, k)}</span>`).join('')}</div></section></main></div>`;
      C.addEventListener('click', e => { const b = e.target.closest('[data-ft],[data-fe]'); if (!b) return; if (b.dataset.ft) fTipo = b.dataset.ft; if (b.dataset.fe) fEstado = b.dataset.fe; pintar(); });
      pintar();
    },
    galeria() {
      const G = D.galeria;
      C.innerHTML = tituloTablon('gal', 'Galería', 'Gallery') + `<section class="seccion"><p class="nota">${t('Fotos y GIF. Haz clic en una para verla en grande.', 'Photos and GIFs. Click one to see it full size.')}${panuelo('galeria')}</p>
        <p class="extra-diario"${diarioAbierto() ? '' : ' hidden'}><a class="boton-leer" href="diario.html"><span aria-hidden="true">&#9824;</span> ${t('Diario', 'Journal')}</a></p>
        ${G.length ? `<div class="galeria">${G.map((g, n) => `<button type="button" data-g="${n}"><img src="${esc(g.archivo)}" alt="${esc(par(g.texto)[0])}" loading="lazy"><span>${tx(g.texto)}</span></button>`).join('')}</div>` : vacio('Todavía no hay imágenes.', 'No images yet.')}</section>
        <div class="visor" id="visor" hidden role="dialog" aria-modal="true" aria-label="Imagen">
          <div class="arriba"><button type="button" data-v="cerrar">${t('Cerrar', 'Close')} (Esc)</button></div>
          <figure><img id="visor-img" alt=""><figcaption id="visor-txt"></figcaption></figure>
          <div class="abajo"><button type="button" data-v="ant">&laquo; ${t('Anterior', 'Previous')}</button><button type="button" data-v="sig">${t('Siguiente', 'Next')} &raquo;</button></div></div>`;
      const visor = $('#visor'); let actual = 0;
      const abrir = n => { if (!G.length) return; actual = (n + G.length) % G.length; $('#visor-img').src = G[actual].archivo; $('#visor-img').alt = par(G[actual].texto)[0]; $('#visor-txt').innerHTML = tx(G[actual].texto); visor.hidden = false; visor.querySelector('[data-v="cerrar"]').focus(); };
      const cerrar = () => { visor.hidden = true; history.replaceState(null, '', location.pathname); };
      C.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) abrir(+b.dataset.g); const v = e.target.closest('[data-v]'); if (v) { if (v.dataset.v === 'cerrar') cerrar(); if (v.dataset.v === 'ant') abrir(actual - 1); if (v.dataset.v === 'sig') abrir(actual + 1); } });
      document.addEventListener('keydown', e => { if (visor.hidden) return; if (e.key === 'Escape') cerrar(); if (e.key === 'ArrowLeft') abrir(actual - 1); if (e.key === 'ArrowRight') abrir(actual + 1); });
      const m = /^#g-(\d+)$/.exec(location.hash); if (m) abrir(+m[1]);
    },
    reglas() {
      const reglas = (P.reglas || []).filter(r => par(r)[0]);
      const sitio = 'https://aeshilfrix.neocities.org/';
      const codigo = `<a href="${sitio}"><img src="${sitio}boton-frix.png" alt="${esc(P.nombre || 'Frix')}" width="88" height="31"></a>`;
      const creditos = [
        ['Cubo 3D', '3D cube', 'three.js', 'https://threejs.org/'],
        ['Contador de visitas', 'Visit counter', 'Abacus', 'https://abacus.jasoncameron.dev/'],
        ['Traducción automática', 'Automatic translation', 'MyMemory', 'https://mymemory.translated.net/'],
        ...(P.discord ? [['Lo que escucho', 'What I listen to', 'Lanyard', 'https://github.com/Phineas/lanyard']] : []),
        ['Alojado en', 'Hosted on', 'Neocities', 'https://neocities.org/']
      ];
      C.innerHTML = tituloTablon('mesa', 'Reglas de la mesa', 'House rules') + `<div class="cuerpo">
        <aside class="lado">
          ${caja('Pañuelos', 'Handkerchiefs', `<div id="progreso-panuelos">${progresoPanuelos()}</div>`)}
          ${caja('Créditos', 'Credits', `<ul class="enlaces-lista">${creditos.map(([es, en, n, u]) => `<li><span>${t(es, en)}</span><a href="${u}" target="_blank" rel="noopener">${n}</a></li>`).join('')}</ul>${panuelo('reglas')}`)}
        </aside>
        <main class="principal">
          <section class="seccion" id="reglas"><h2><span aria-hidden="true">&#9827;</span>${t('Reglas', 'Rules')}</h2>
            ${reglas.length ? `<ol class="reglas">${reglas.map(r => `<li>${tx(r)}</li>`).join('')}</ol>` : vacio('Escribe las reglas de tu mesa en el panel (Perfil).', 'Write your house rules in the panel (Profile).')}</section>
          <section class="seccion" id="bitacora"><h2><span aria-hidden="true">&#9824;</span>${t('Bitácora de la mesa', 'Table log')}</h2>
            ${(D.cambios || []).length ? `<ul class="bitacora larga">${[...D.cambios].sort(porFechaId).map(c => `<li><span class="tenue">${fechaCorta(c.fecha)}</span> ${tx(c.texto)}</li>`).join('')}</ul>` : vacio('Todavía no hay nada anotado.', 'Nothing logged yet.')}</section>
          <section class="seccion" id="enlazame"><h2><span class="rojo" aria-hidden="true">&#9830;</span>${t('Enlázame', 'Link to me')}</h2>
            <div class="enlazame"><img src="boton-frix.png" width="88" height="31" alt="${esc(P.nombre)}">
              <div><p class="nota">${t('Si quieres poner mi botón en tu sitio, copia este código:', 'To put my button on your site, copy this code:')}</p>
                <textarea id="codigo-boton" rows="3" readonly spellcheck="false" aria-label="Código del botón / Button code">${esc(codigo)}</textarea>
                <p><button type="button" class="boton-leer" id="copiar-boton">${t('Copiar código', 'Copy code')}</button> <span class="tenue" id="copiado" role="status"></span></p></div></div></section>
        </main></div>`;
      $('#copiar-boton').addEventListener('click', async () => {
        const area = $('#codigo-boton'); let ok = false;
        try { await navigator.clipboard.writeText(area.value); ok = true; } catch (e) { area.select(); try { ok = document.execCommand('copy'); } catch (err) {} }
        $('#copiado').innerHTML = ok ? t('Copiado.', 'Copied.') : t('Selecciónalo y cópialo a mano.', 'Select it and copy it by hand.');
      });
      // Si se llega con #bitacora o #enlazame, ir a esa parte (el contenido se arma despues de cargar)
      if (location.hash) { const s = document.getElementById(location.hash.slice(1)); if (s) s.scrollIntoView(); }
      addEventListener('hashchange', () => { const s = document.getElementById(location.hash.slice(1)); if (s) s.scrollIntoView(); });
    },
    leer() {
      const progreso = id => leer('leido-e' + id, 0);
      let navegar = null; // anterior/siguiente con las flechas del teclado en un capitulo
      const pintar = () => {
        navegar = null;
        const m = /^#([bde])-(\d+)(?:-c(\d+))?$/.exec(location.hash);
        const fuente = m && { b: ['blog', 'Blog', 'Blog', 'blog.html'], d: ['diario', 'Diario', 'Journal', 'diario.html'], e: ['escritos', 'Escritos', 'Writing', 'escritos.html'] }[m[1]];
        const item = fuente && !(m[1] === 'd' && !diarioAbierto()) && D[fuente[0]].find(x => String(x.id) === m[2]);
        const caps = m && m[1] === 'e' ? capsDe(item) : [];
        const nCap = m && m[3] ? +m[3] : 0;
        if (!item || (nCap && !caps[nCap - 1])) { C.innerHTML = `<div class="lector">${vacio('No encontré esa entrada.', 'That entry was not found.')}<p><a href="inicio.html">&laquo; ${t('Volver al inicio', 'Back to home')}</a></p></div>`; return; }
        if (nCap) return pintarCapitulo(item, caps, nCap);
        if (m[1] === 'e') return pintarEscrito(item, caps);
        C.innerHTML = `<p><a href="${fuente[3]}">&laquo; ${t(fuente[1], fuente[2])}</a></p><article class="lector"><h1>${tx(item.titulo)}${ejemplo(item)}</h1><div class="meta">${esc(P.nombre)} · ${fechaTablon(item.fecha)} · No.${String(item.id).padStart(6, '0')}</div>
          ${item.imagen ? `<p><img src="${esc(item.imagen)}" alt=""></p>` : ''}<div class="texto">${textoBi(item.texto) || vacio('Sin texto todavía.', 'No text yet.')}</div></article>`;
        document.title = par(item.titulo)[0] + ' - ' + P.nombre;
      };
      // Ficha del escrito: titulo, notas debajo y lista de capitulos (o el texto si no tiene capitulos)
      function pintarEscrito(e, caps) {
        const visto = progreso(e.id), hay = caps.length;
        const total = caps.reduce((s, c) => s + palabras(c.html), 0);
        const meta = [nombreDe(TIPO_ESCRITO, e.tipo), nombreDe(ESTADO_ESCRITO, e.estado), `${t('Actualizado', 'Updated')} ${fechaCorta(e.actualizado)}`];
        if (hay) meta.push(t(`${hay} ${hay === 1 ? 'capítulo' : 'capítulos'}`, `${hay} ${hay === 1 ? 'chapter' : 'chapters'}`), t(`${miles(total)} palabras`, `${miles(total)} words`));
        C.innerHTML = `<p><a href="escritos.html">&laquo; ${t('Escritos', 'Writing')}</a></p><article class="lector ficha"><h1>${sol(e.titulo)}${etiquetaEn(e)}${ejemplo(e)}</h1><div class="meta">${meta.join(' · ')}</div>
          ${versiones(e).map(x => `<p class="version">${x.idioma === 'en' ? t('También en inglés:', 'Also in English:') : t('Versión en español:', 'Spanish version:')} <a href="#e-${x.id}">${sol(x.titulo)}</a>${etiquetaEn(x)}</p>`).join('')}
          ${par(e.notas)[0] ? `<div class="notas">${textoHTML(par(e.notas)[0])}</div>` : ''}
          ${hay ? `<div class="empezar"><a class="boton-leer" href="#e-${e.id}-c1">${t('Empezar a leer', 'Start reading')}</a>${visto > 1 && caps[visto - 1] ? `<a class="boton-leer sec" href="#e-${e.id}-c${visto}">${t('Seguir leyendo: capítulo', 'Continue: chapter')} ${visto}</a>` : ''}</div>
            <h2>${t('Capítulos', 'Chapters')}</h2>
            <div class="tabla-wrap"><table class="lista caps"><thead><tr><th>#</th><th>${t('Título', 'Title')}</th><th>${t('Palabras', 'Words')}</th><th>${t('Fecha', 'Date')}</th></tr></thead><tbody>
            ${caps.map((c, n) => `<tr${visto === n + 1 ? ' class="visto"' : ''}><td class="n">${n + 1}</td><td><a href="#e-${e.id}-c${n + 1}">${tituloCap(c, n + 1)}</a></td><td class="n">${miles(palabras(c.html))}</td><td>${fechaCorta(c.fecha)}</td></tr>`).join('')}
            </tbody></table></div>`
          : `<div class="texto">${textoHTML(par(e.texto)[0]) || vacio('Todavía no hay capítulos.', 'No chapters yet.')}</div>`}</article>`;
        document.title = par(e.titulo)[0] + ' - ' + P.nombre;
      }
      // Un capitulo, con anterior / indice / siguiente arriba y abajo
      function pintarCapitulo(e, caps, n) {
        const c = caps[n - 1], base = `#e-${e.id}-c`;
        const nav = `<nav class="navcap" aria-label="Capítulos / Chapters">
          ${n > 1 ? `<a href="${base}${n - 1}" rel="prev">&laquo; ${t('Anterior', 'Previous')}</a>` : `<span class="off">&laquo; ${t('Anterior', 'Previous')}</span>`}
          <a href="#e-${e.id}">${t('Índice', 'Contents')}</a>
          ${n < caps.length ? `<a href="${base}${n + 1}" rel="next">${t('Siguiente', 'Next')} &raquo;</a>` : `<span class="off">${t('Siguiente', 'Next')} &raquo;</span>`}</nav>`;
        const otra = versiones(e).filter(x => capsDe(x)[n - 1])[0];
        C.innerHTML = `<p><a href="#e-${e.id}">&laquo; ${sol(e.titulo)}</a></p><article class="lector capitulo">
          <header class="encabezado"><a class="historia" href="#e-${e.id}">${sol(e.titulo)}</a>${etiquetaEn(e)}<h1>${c.titulo ? `<span class="numero">${t('Capítulo', 'Chapter')} ${n}</span>${tx(c.titulo)}` : t(`Capítulo ${n}`, `Chapter ${n}`)}</h1>
          <div class="meta">${fechaCorta(c.fecha)} · ${t(`${miles(palabras(c.html))} palabras`, `${miles(palabras(c.html))} words`)}</div>
          ${otra ? `<p class="version"><a href="#e-${otra.id}-c${n}">${otra.idioma === 'en' ? t('Leer este capítulo en inglés', 'Read this chapter in English') : t('Leer este capítulo en español', 'Read this chapter in Spanish')}</a>${etiquetaEn(otra)}</p>` : ''}</header>
          ${nav}<div class="texto">${limpiarHTML(c.html) || vacio('Capítulo vacío.', 'Empty chapter.')}</div>${nav}</article>`;
        document.title = `${par(e.titulo)[0]}, ${par(c.titulo)[0] || 'cap. ' + n} - ${P.nombre}`;
        guardar('leido-e' + e.id, n);
        navegar = { ant: n > 1 ? base + (n - 1) : null, sig: n < caps.length ? base + (n + 1) : null };
      }
      document.addEventListener('keydown', ev => {
        if (!navegar || ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey || /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
        const destino = ev.key === 'ArrowLeft' ? navegar.ant : ev.key === 'ArrowRight' ? navegar.sig : null;
        if (destino) location.hash = destino;
      });
      const mostrar = () => { pintar(); const m = $('.lector .meta'); if (m) m.insertAdjacentHTML('beforeend', panuelo('leer')); };
      addEventListener('hashchange', () => { mostrar(); scrollTo(0, 0); }); mostrar();
    }
  };
  if (C && R[PAGINA]) R[PAGINA]();
})();
