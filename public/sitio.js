/* Sitio de Frix: arma la cabecera, el menu, la musica y el contenido de cada pagina a partir de datos.js */
(function () {
  'use strict';
  const D = Object.assign({ perfil: {}, blog: [], diario: [], escritos: [], obras: [], galeria: [], musica: [], enlaces: [] }, window.DATOS || {});
  const P = Object.assign({ nombre: 'Frix', avatar: '', desde: '', lema: '', presentacion: '', gustos: [] }, D.perfil);
  const PAGINA = document.body.dataset.pagina || 'inicio';
  const $ = (s, r = document) => r.querySelector(s);

  // ---------- Utilidades ----------
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = (es, en) => es === en ? es : `<span lang="es">${es}</span><span lang="en">${en}</span>`;
  const par = o => (o && typeof o === 'object') ? [o.es || o.en || '', o.en || o.es || ''] : [String(o || ''), String(o || '')];
  const tx = o => { const [es, en] = par(o); return t(esc(es), esc(en)); };
  function textoHTML(s) {
    return esc(s).split(/\n\s*\n/).filter(b => b.trim()).map(b => '<p>' + b.split('\n').map(l =>
      (l.startsWith('&gt;') ? `<span class="verde">${l}</span>` : l).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    ).join('<br>') + '</p>').join('');
  }
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

  const PAGINAS = [
    ['index.html', 'inicio', '&#9818;', 'Inicio', 'Home', ''],
    ['blog.html', 'blog', '&#9829;', 'Blog', 'Blog', 'rojo'],
    ['diario.html', 'diario', '&#9824;', 'Diario', 'Journal', ''],
    ['escritos.html', 'escritos', '&#9830;', 'Escritos', 'Writing', 'rojo'],
    ['obras.html', 'obras', '&#9827;', 'Obras', 'Watched & read', ''],
    ['galeria.html', 'galeria', '&#9635;', 'Galería', 'Gallery', '']
  ];

  // ---------- Cabecera, menu del avatar y pie ----------
  const avatarHTML = P.avatar ? `<img src="${esc(P.avatar)}" alt="">` : esc((P.nombre || 'F')[0]);
  const cab = $('#cabecera');
  if (cab) cab.innerHTML = `
    <div class="mini"><div class="idioma" role="group" aria-label="Idioma / Language">[<button type="button" data-l="es" aria-pressed="true">Español</button>/<button type="button" data-l="en" aria-pressed="false">English</button>]</div></div>
    <header class="cabecera">
      <a class="logo" href="index.html">${esc(P.nombre)}</a>
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
      <nav class="menu-perfil" id="menu-perfil" hidden>
        <div class="quien">${esc(P.nombre)}</div>
        <ul>${PAGINAS.map(([href, id, palo, es, en, c]) => `<li><a href="${href}"${id === PAGINA ? ' aria-current="page"' : ''}><span class="palo ${c}">${palo}</span>${t(es, en)}</a></li>`).join('')}</ul>
      </nav>
    </header>`;
  const pie = $('#pie');
  if (pie) pie.innerHTML = `<footer class="pie">
      <div>[${PAGINAS.map(([href, , , es, en]) => `<a href="${href}">${t(es, en)}</a>`).join(' / ')}]</div>
      <div class="botones"><span class="b88 f">${esc((P.nombre || 'FRIX').toUpperCase())}</span><span class="b88 m">MyAnimeList</span><span class="b88 c"><b>&#9824;&#9829;&#9830;&#9827;</b></span></div>
      <div>${t('Hecho a mano en Neocities. Se ve bien en cualquier navegador.', 'Handmade on Neocities. Looks fine in any browser.')}</div>
    </footer>`;

  const menuBtn = $('#avatar-btn'), menu = $('#menu-perfil');
  if (menuBtn) {
    const abrir = v => { menu.hidden = !v; menuBtn.setAttribute('aria-expanded', String(v)); };
    menuBtn.addEventListener('click', e => { e.stopPropagation(); abrir(menu.hidden); });
    document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) abrir(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { abrir(false); menuBtn.focus(); } });
  }

  // ---------- Idioma (se recuerda en el navegador) ----------
  const leer = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  function idioma(l) {
    document.documentElement.dataset.lang = l; document.documentElement.lang = l;
    document.querySelectorAll('[data-l]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === l)));
    guardar('idioma', l);
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (b) idioma(b.dataset.l); });
  idioma(leer('idioma', 'es') === 'en' ? 'en' : 'es');

  // ---------- Musica aleatoria ----------
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
      audio.src = c.url; tit.textContent = '♪ ' + (c.titulo || ''); tit.title = c.titulo || '';
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
    const img = p.imagen ? `<div class="archivo">${t('Archivo:', 'File:')} ${esc(p.imagen.split('/').pop())}</div><a class="img" href="${esc(p.imagen)}"><img src="${esc(p.imagen)}" alt="" loading="lazy"></a>` : '';
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
      const novedades = [...D.blog.map(p => ['Blog', 'Blog', p, 'b-' + p.id]), ...D.diario.map(p => ['Diario', 'Journal', p, 'd-' + p.id]),
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
              <table class="datos"><tr><td>${t('Desde', 'Since')}</td><td>${mesAnio(P.desde)}</td></tr><tr><td>${t('Entradas', 'Posts')}</td><td>${D.blog.length + D.diario.length}</td></tr><tr><td>${t('Escritos', 'Writing')}</td><td>${D.escritos.length}</td></tr><tr><td>${t('Obras', 'Titles')}</td><td>${D.obras.length}</td></tr></table>`)}
            ${caja('Me gusta', 'I like', P.gustos.length ? `<ul class="gustos">${P.gustos.map(g => `<li>${tx(g)}</li>`).join('')}</ul>` : vacio('Agrega tus gustos en el panel.', 'Add what you like in the panel.'))}
            ${caja('Estadísticas', 'Stats', estadisticas(), `<a href="obras.html">${t('Ver todo', 'View all')}</a>`)}
            ${caja('Galería', 'Gallery', galeria.length ? `<div class="mini-galeria">${galeria.map(([g, n]) => `<a href="galeria.html#g-${n}" title="${esc(par(g.texto)[0])}"><img src="${esc(g.archivo)}" alt="${esc(par(g.texto)[0])}" loading="lazy"></a>`).join('')}</div>` : vacio('Sube imágenes y agrégalas en el panel.', 'Upload images and add them in the panel.'), `<a href="galeria.html">${t('Ver todo', 'View all')}</a>`)}
            ${caja('Enlaces', 'Links', D.enlaces.length ? `<ul class="enlaces-lista">${D.enlaces.map(l => `<li><a href="${esc(l.url)}">${esc(l.nombre)}</a><span>${esc(l.detalle || '')}</span></li>`).join('')}</ul>` : vacio('Sin enlaces.', 'No links.'))}
          </aside>
          <main class="principal">
            <section class="seccion"><h2><span class="rojo" aria-hidden="true">&#9829;</span>Blog<a href="blog.html">${t('Ver todo', 'View all')}</a></h2>
              ${[...D.blog].sort(porFecha).slice(0, 5).map(p => postHTML(p, 'b', true)).join('') || vacio('Todavía no hay entradas.', 'No posts yet.')}</section>
          </main>
        </div>`;
      activarBanner();
    },
    blog() {
      C.innerHTML = tituloTablon('fx', 'Blog', 'Blog') + `<section class="seccion"><p class="nota">${t('Cosas sobre mí: lo que veo, leo y juego.', 'Things about me: what I watch, read and play.')}</p>
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
        <div class="leyenda">${[1, 2, 3, 4, 5].map(k => `<span><i class="s-${k}"></i>${nombreDe(ESTADO_ESCRITO, k)}</span>`).join('')}</div>` : vacio('Todavía no hay escritos.', 'No writing yet.')}</section>`;
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
        <aside class="lado">${caja('Estadísticas', 'Stats', estadisticas())}</aside>
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
      C.innerHTML = tituloTablon('gal', 'Galería', 'Gallery') + `<section class="seccion"><p class="nota">${t('Fotos y GIF. Haz clic en una para verla en grande.', 'Photos and GIFs. Click one to see it full size.')}</p>
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
    leer() {
      const progreso = id => leer('leido-e' + id, 0);
      let navegar = null; // anterior/siguiente con las flechas del teclado en un capitulo
      const pintar = () => {
        navegar = null;
        const m = /^#([bde])-(\d+)(?:-c(\d+))?$/.exec(location.hash);
        const fuente = m && { b: ['blog', 'Blog', 'Blog', 'blog.html'], d: ['diario', 'Diario', 'Journal', 'diario.html'], e: ['escritos', 'Escritos', 'Writing', 'escritos.html'] }[m[1]];
        const item = fuente && D[fuente[0]].find(x => String(x.id) === m[2]);
        const caps = m && m[1] === 'e' ? capsDe(item) : [];
        const nCap = m && m[3] ? +m[3] : 0;
        if (!item || (nCap && !caps[nCap - 1])) { C.innerHTML = `<div class="lector">${vacio('No encontré esa entrada.', 'That entry was not found.')}<p><a href="index.html">&laquo; ${t('Volver al inicio', 'Back to home')}</a></p></div>`; return; }
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
      addEventListener('hashchange', () => { pintar(); scrollTo(0, 0); }); pintar();
    }
  };
  if (C && R[PAGINA]) R[PAGINA]();
})();
