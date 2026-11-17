/* Panel del sitio: edita los datos con formularios y publica datos.js directo en GitHub, que actualiza el sitio solo. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const copia = o => JSON.parse(JSON.stringify(o));
  const VACIO = { perfil: { nombre: 'Frix', avatar: '', desde: '', discord: '', lema: { es: '', en: '' }, presentacion: { es: '', en: '' }, gustos: [], frases: [], reglas: [] }, blog: [], diario: [], escritos: [], obras: [], galeria: [], musica: [], enlaces: [], cambios: [] };
  let datos = Object.assign(copia(VACIO), copia(window.DATOS || {}));
  let original = JSON.stringify(datos); // lo publicado: el datos.js de la carpeta o, si hay clave de GitHub, el del repositorio
  let pestana = 'blog', editando = null, borrarPendiente = null;

  // ---------- Borrador local ----------
  const CLAVE = 'panel-borrador';
  let falloBorrador = false;
  function guardarBorrador() {
    try { localStorage.setItem(CLAVE, JSON.stringify({ fecha: new Date().toISOString(), datos })); falloBorrador = false; } catch (e) { falloBorrador = true; }
    marcarEstado();
  }
  // Mensaje de estado arriba a la derecha. Si el borrador no se pudo guardar, ese aviso manda.
  function avisar(msg) { $('#estado').textContent = falloBorrador ? 'No se pudo guardar el borrador en este navegador (puede estar lleno). Ve a Publicar y descarga datos.js para no perder cambios.' : msg; }
  function marcarEstado() { avisar(JSON.stringify(datos) !== original ? 'Hay cambios sin publicar' : 'Sin cambios'); }
  function revisarBorrador() {
    const aviso = $('#borrador');
    let b = null; try { b = JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) {}
    if (!b || JSON.stringify(b.datos) === original || JSON.stringify(b.datos) === JSON.stringify(datos)) { aviso.hidden = true; return; }
    aviso.hidden = false;
    aviso.innerHTML = `Tienes un borrador sin publicar del ${esc(new Date(b.fecha).toLocaleString('es-PE'))}. <button class="btn" id="recuperar">Recuperar borrador</button> <button class="btn sec" id="descartar">Descartar</button>`;
    $('#recuperar').onclick = () => { datos = Object.assign(copia(VACIO), b.datos); aviso.hidden = true; guardarBorrador(); pintar(); };
    $('#descartar').onclick = () => { try { localStorage.removeItem(CLAVE); } catch (e) {} aviso.hidden = true; };
  }
  revisarBorrador();

  // ---------- Definicion de cada seccion ----------
  const hoy = () => new Date().toISOString().slice(0, 10);
  const ahora = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  const OPC_TIPO_OBRA = [['anime', 'Anime'], ['manga', 'Manga'], ['serie', 'Serie'], ['pelicula', 'Película'], ['libro', 'Libro'], ['comic', 'Cómic'], ['juego', 'Juego'], ['otro', 'Otro']];
  const OPC_ESTADO_OBRA = [['1', 'En curso'], ['2', 'Completado'], ['3', 'En pausa'], ['4', 'Abandonado'], ['5', 'Planeado']];
  const OPC_ESTADO_ESC = [['1', 'Escribiendo'], ['2', 'Terminado'], ['3', 'En pausa'], ['4', 'Abandonado'], ['5', 'Planeado']];
  const OPC_TIPO_ESC = [['novela', 'Novela'], ['relato', 'Relato'], ['mundo', 'Mundo'], ['poema', 'Poema'], ['otro', 'Otro']];
  const OPC_NOTA = [['0', 'Sin nota'], ...[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => [String(n), String(n)])];
  const AYUDA_TEXTO = 'Empieza una línea con > para que salga en verde. Deja una línea en blanco para empezar otro párrafo. Los enlaces (https://...) se vuelven clicables. Para dar color, selecciona el texto y pulsa Pintar, o escríbelo así: # aviso importante #FF0000';
  const AYUDA_EN = 'Se traduce solo al guardar: si lo dejas vacío, o si cambias el español sin tocar esto. Si lo corriges a mano, se respeta tu versión y ya no se reemplaza.';
  const OPC_IDIOMA = [['es', 'Español'], ['en', 'English (sale con la etiqueta #English)']];
  // Otras versiones posibles de un escrito: todos los demas escritos
  const opcVersiones = () => [['', 'Ninguna'], ...datos.escritos.filter((e, i) => i !== editando)
    .map(e => [String(e.id), esc((e.titulo && e.titulo.es) || '(sin título)') + (e.idioma === 'en' ? ' #English' : '')])];

  const SECCIONES = {
    blog: { nombre: 'Blog', lista: 'blog', conId: true, bilingue: ['titulo', 'texto'], nuevo: () => ({ fecha: ahora() }),
      campos: [['titulo.es', 'Título', 'text', 1], ['titulo.en', 'Título en inglés (se traduce solo)', 'text'], ['fecha', 'Fecha y hora', 'datetime-local', 1], ['imagen', 'Imagen (opcional): enlace directo o súbela desde tu PC', 'imagen'], ['texto.es', 'Texto', 'textarea', 1, AYUDA_TEXTO], ['texto.en', 'Texto en inglés (se traduce solo)', 'textarea', 0, AYUDA_EN]],
      resumen: i => [i.titulo && i.titulo.es, (i.fecha || '').replace('T', ' ')] },
    diario: { nombre: 'Diario', lista: 'diario', conId: true, bilingue: ['titulo', 'texto'], nuevo: () => ({ fecha: ahora() }),
      campos: [['titulo.es', 'Título', 'text', 1], ['titulo.en', 'Título en inglés (se traduce solo)', 'text'], ['fecha', 'Fecha y hora', 'datetime-local', 1], ['texto.es', 'Texto', 'textarea', 1, AYUDA_TEXTO], ['texto.en', 'Texto en inglés (se traduce solo)', 'textarea', 0, AYUDA_EN]],
      resumen: i => [i.titulo && i.titulo.es, (i.fecha || '').replace('T', ' ')] },
    // Los escritos no se traducen: la version en ingles es otro escrito con idioma English (#English)
    escritos: { nombre: 'Escritos', lista: 'escritos', conId: true, nuevo: () => ({ actualizado: hoy(), estado: 1, tipo: 'relato', idioma: 'es' }),
      campos: [['titulo.es', 'Título', 'text', 1],
        ['idioma', 'Idioma', OPC_IDIOMA, 0, 'Tus escritos no se traducen solos. Para subir la versión en inglés, crea otro escrito con idioma English.'],
        ['version', 'Otra versión de esta historia (opcional)', opcVersiones, 0, 'Si este escrito es la versión en inglés de otro (o al revés), elígelo aquí: en tu sitio cada uno tendrá un enlace al otro.'],
        ['tipo', 'Tipo', OPC_TIPO_ESC], ['estado', 'Estado', OPC_ESTADO_ESC], ['actualizado', 'Última actualización', 'date', 1], ['resumen.es', 'Resumen de una línea (opcional, sale en la lista)', 'text'],
        ['notas.es', 'Notas o descripción (sale debajo del título, encima de los capítulos)', 'textarea', 0, AYUDA_TEXTO],
        ['texto.es', 'Texto', 'textarea grande', 0, 'Si el escrito tiene capítulos, deja esto vacío y sube los capítulos más abajo. ' + AYUDA_TEXTO]],
      resumen: i => { const n = (i.capitulos || []).length; return [((i.titulo && i.titulo.es) || '') + (i.idioma === 'en' ? ' #English' : ''), (OPC_ESTADO_ESC.find(o => o[0] === String(i.estado)) || [, ''])[1] + (n ? ` · ${n} ${n === 1 ? 'capítulo' : 'capítulos'}` : '')]; } },
    obras: { nombre: 'Obras', lista: 'obras', conId: true, nuevo: () => ({ fecha: hoy(), estado: 2, nota: 0, tipo: 'anime' }),
      campos: [['titulo', 'Título', 'text', 1], ['tipo', 'Tipo', OPC_TIPO_OBRA], ['anio', 'Año', 'number'], ['portada', 'Portada (opcional): enlace directo o súbela desde tu PC', 'imagen'], ['estado', 'Estado', OPC_ESTADO_OBRA], ['nota', 'Nota', OPC_NOTA], ['fecha', 'Fecha en que lo registras', 'date', 1]],
      resumen: i => [i.titulo, `${(OPC_TIPO_OBRA.find(o => o[0] === i.tipo) || [, ''])[1]} · ${(OPC_ESTADO_OBRA.find(o => o[0] === String(i.estado)) || [, ''])[1]}${i.nota > 0 ? ' · ' + i.nota : ''}`], imagen: i => i.portada },
    galeria: { nombre: 'Galería', lista: 'galeria', bilingue: ['texto'], nuevo: () => ({}),
      campos: [['archivo', 'Imagen', 'imagen', 1, 'Pulsa «Subir desde tu PC», o pega un enlace directo a la imagen (el que termina en .png, .jpg o .gif, como los de imgur).'], ['texto.es', 'Descripción', 'text'], ['texto.en', 'Descripción en inglés (se traduce sola)', 'text']],
      resumen: i => [i.archivo, i.texto && i.texto.es], imagen: i => i.archivo },
    musica: { nombre: 'Música', lista: 'musica', nuevo: () => ({}),
      campos: [['titulo', 'Nombre de la canción', 'text', 1], ['url', 'Audio: enlace directo o súbelo desde tu PC', 'audio', 1, 'Acepta .mp3, .ogg o .m4a de hasta 25 MB.']],
      resumen: i => [i.titulo, i.url] },
    // Bitacora de la mesa: lo que cambia en el sitio (sale en el inicio)
    cambios: { nombre: 'Bitácora', lista: 'cambios', conId: true, bilingue: ['texto'], nuevo: () => ({ fecha: hoy() }),
      campos: [['fecha', 'Fecha', 'date', 1], ['texto.es', 'Qué cambió en el sitio', 'text', 1, 'Una línea. En el inicio salen las 6 más nuevas.'], ['texto.en', 'En inglés (se traduce solo)', 'text']],
      resumen: i => [i.texto && i.texto.es, i.fecha] },
    enlaces: { nombre: 'Enlaces', lista: 'enlaces', nuevo: () => ({}),
      campos: [['nombre', 'Nombre', 'text', 1], ['url', 'Enlace', 'url', 1], ['detalle', 'Detalle (opcional), por ejemplo tu usuario', 'text']],
      resumen: i => [i.nombre, i.url] }
  };
  const PESTANAS = [['perfil', 'Perfil'], ['blog', 'Blog'], ['diario', 'Diario'], ['escritos', 'Escritos'], ['obras', 'Obras'], ['galeria', 'Galería'], ['musica', 'Música'], ['enlaces', 'Enlaces'], ['cambios', 'Bitácora'], ['publicar', 'Publicar']];

  // ---------- Utilidades de formulario ----------
  const leerRuta = (o, ruta) => ruta.split('.').reduce((a, k) => a == null ? undefined : a[k], o);
  function ponerRuta(o, ruta, v) { const ks = ruta.split('.'); let a = o; ks.slice(0, -1).forEach(k => { if (typeof a[k] !== 'object' || a[k] === null) a[k] = {}; a = a[k]; }); a[ks[ks.length - 1]] = v; }
  function campoHTML([ruta, etiqueta, tipo, req, ayuda], valor) {
    if (typeof tipo === 'function') tipo = tipo();
    const id = 'f-' + ruta.replace('.', '-'), v = valor == null ? '' : valor;
    let control;
    if (Array.isArray(tipo)) control = `<select id="${id}" name="${ruta}">${tipo.map(([k, n]) => `<option value="${k}"${String(v) === k ? ' selected' : ''}>${n}</option>`).join('')}</select>`;
    else if (tipo.startsWith('textarea')) control = `<textarea id="${id}" name="${ruta}" class="${tipo.includes('grande') ? 'grande' : ''}"${req ? ' required' : ''}>${esc(v)}</textarea>`
      + (/\.(es|en)$/.test(ruta) ? `<div class="pintar"><input type="color" value="#ff0000" id="${id}-color" aria-label="Color"><button class="btn sec" type="button" data-pintar="${id}">Pintar lo seleccionado</button><span class="ayuda" id="${id}-pintar" role="status"></span></div>` : '');
    else if (tipo === 'imagen' || tipo === 'audio') control = `<div class="con-imagen"><input id="${id}" name="${ruta}" type="text" value="${esc(v)}"${req ? ' required' : ''} placeholder="${tipo === 'audio' ? 'https://… .mp3 o musica/cancion.mp3' : 'https://i.imgur.com/… o galeria/foto.png'}">
      <button class="btn sec" type="button" data-subir-img="${id}" data-tipo="${tipo}">Subir desde tu PC</button></div><p class="ayuda estado-img" id="${id}-estado" role="status"></p>`;
    else control = `<input id="${id}" name="${ruta}" type="${tipo}" value="${esc(v)}"${req ? ' required' : ''}${tipo === 'number' ? ' min="0" max="2100"' : ''}>`;
    return `<div class="campo"><label for="${id}">${etiqueta}</label>${control}${ayuda ? `<p class="ayuda">${ayuda}</p>` : ''}</div>`;
  }
  function leerFormulario(form, campos, base) {
    const item = copia(base);
    for (const [ruta, , tipo] of campos) {
      let v = form.elements[ruta].value;
      if (['estado', 'nota', 'anio', 'version'].includes(ruta)) v = v === '' ? '' : Number(v);
      if (typeof v === 'string') v = v.replace(/\r/g, '');
      ponerRuta(item, ruta, v);
    }
    delete item.ejemplo;
    return item;
  }

  // ---------- Pintar ----------
  function pintarPestanas() {
    $('#pestanas').innerHTML = PESTANAS.map(([k, n]) => `<button type="button" role="tab" data-p="${k}" aria-selected="${k === pestana}">${n}${k !== 'perfil' && k !== 'publicar' ? ` (${datos[k].length})` : ''}</button>`).join('');
  }
  function pintar() {
    pintarPestanas();
    const h = $('#hoja');
    if (pestana === 'perfil') return pintarPerfil(h);
    if (pestana === 'publicar') return pintarPublicar(h);
    const S = SECCIONES[pestana], lista = datos[S.lista];
    const item = editando == null ? S.nuevo() : lista[editando];
    const conCaps = pestana === 'escritos';
    previa = null; capVer = null; capBorrar = null;
    h.innerHTML = `${pestana === 'obras' ? buscadorHTML() : ''}
      <form class="formulario" id="form"><b>${editando == null ? (pestana === 'obras' ? 'Agregar a mano' : 'Agregar nuevo') : 'Editar'}</b>
        ${S.campos.filter(c => !(conCaps && c[0].startsWith('texto.'))).map(c => campoHTML(c, leerRuta(item, c[0]))).join('')}
        ${conCaps ? `<details class="extra"${(leerRuta(item, 'texto.es') || leerRuta(item, 'texto.en')) ? ' open' : ''}><summary>Texto completo sin capítulos (para escritos cortos, como un poema)</summary>
          ${S.campos.filter(c => c[0].startsWith('texto.')).map(c => campoHTML(c, leerRuta(item, c[0]))).join('')}</details>` : ''}
        ${conCaps && editando == null ? '<p class="ayuda">Cuando lo agregues, aquí abajo aparece la sección para subir sus capítulos.</p>' : ''}
        <div class="acciones"><button class="btn" type="submit">${editando == null ? 'Agregar' : 'Guardar cambios'}</button>${editando != null ? `<button class="btn sec" type="button" id="cancelar">${conCaps ? 'Cerrar' : 'Cancelar'}</button>` : ''}</div></form>
      ${conCaps && editando != null ? '<section class="caja" id="capitulos"></section>' : ''}
      <div id="lista-items">${listaHTML(S, lista)}</div>`;
    $('#form').addEventListener('submit', async e => {
      e.preventDefault();
      const posicion = editando, pest = pestana, boton = e.target.querySelector('[type="submit"]');
      const antes = posicion == null ? item : lista[posicion];
      const nuevo = leerFormulario(e.target, S.campos, antes);
      let msg = 'Guardado en el borrador. Publica cuando termines.';
      if (S.bilingue) {
        // Traducir al ingles lo que haga falta antes de guardar
        boton.disabled = true;
        const r = await completarIngles(nuevo, antes, S.bilingue, avisar);
        boton.disabled = false;
        if (r.fallo) msg = `Guardado, pero no se pudo traducir al inglés (${r.fallo.message}). Puedes intentarlo luego en Publicar.`;
        else if (r.hechos) msg = 'Guardado y traducido al inglés. Puedes revisar la traducción con Editar.';
      }
      if (posicion == null) {
        if (S.conId) nuevo.id = lista.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
        lista.push(nuevo);
      } else lista[posicion] = nuevo;
      guardarBorrador();
      if (pestana !== pest || editando !== posicion) return avisar(msg); // cambiaste de pestana mientras traducia: ya quedo guardado
      // Un escrito nuevo se queda abierto para poder subirle capitulos enseguida
      editando = posicion == null && conCaps ? lista.length - 1 : null;
      if (posicion == null && conCaps) msg = 'Escrito creado. Ahora puedes subir sus capítulos abajo.';
      borrarPendiente = null; pintar(); avisar(msg);
      if (conCaps && editando != null) $('#capitulos').scrollIntoView({ behavior: 'smooth' });
    });
    if (conCaps && editando != null) pintarCapitulos();
    const cancelar = $('#cancelar'); if (cancelar) cancelar.onclick = () => { editando = null; pintar(); };
    if (pestana === 'obras') activarBuscador();
  }
  function listaHTML(S, lista) {
    return `<b>Lo que ya tienes (${lista.length})</b>${lista.length ? `<ul class="items">${lista.map((it, n) => { const [a, b] = S.resumen(it); const img = S.imagen && S.imagen(it); return `<li${editando === n ? ' class="abierto"' : ''}>${img ? `<img src="${esc(img)}" alt="">` : ''}<div class="que">${esc(a || '(sin título)')}${it.ejemplo ? ' <span class="ejemplo">ejemplo</span>' : ''}<small>${esc(b || '')}</small></div><button class="btn sec" type="button" data-editar="${n}">${pestana === 'escritos' ? 'Editar y capítulos' : 'Editar'}</button><button class="btn ${borrarPendiente === n ? 'peligro' : 'sec'}" type="button" data-borrar="${n}">${borrarPendiente === n ? '¿Seguro? Borrar' : 'Borrar'}</button></li>`; }).join('')}</ul>` : '<p class="ayuda">Todavía no hay nada aquí.</p>'}`;
  }
  const refrescarLista = () => { const l = $('#lista-items'); if (l && SECCIONES[pestana]) l.innerHTML = listaHTML(SECCIONES[pestana], datos[SECCIONES[pestana].lista]); };

  // ---------- Capitulos de un escrito (se suben desde archivos de Tintero) ----------
  let previa = null, capVer = null, capBorrar = null;
  const limpiarHTML = h => String(h || '').replace(/<(\/?)([a-zA-Z0-9]+)[^>]*>/g, (m, c, tag) => /^(p|br|i|b|u|em|strong)$/i.test(tag) ? `<${c}${tag.toLowerCase()}>` : '');
  const palabras = h => window.Tintero ? Tintero.palabras(h) : 0;
  const nombreGenerico = s => !s || /^pesta(ñ|n)a\s*\d*$/i.test(s.trim());
  const primeraLinea = h => { const s = String(h || '').split(/<\/p>/)[0].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'); return s.length > 140 ? s.slice(0, 140) + '…' : s; };
  const escritoAbierto = () => pestana === 'escritos' && editando != null ? datos.escritos[editando] : null;

  function pintarCapitulos(msg, foco) {
    const caja = $('#capitulos'), e = escritoAbierto(); if (!caja || !e) return;
    const caps = e.capitulos || [];
    caja.innerHTML = `<h3>Capítulos de «${esc((e.titulo && e.titulo.es) || 'sin título')}» (${caps.length})</h3><div class="dentro capitulos">
      <div class="acciones"><button class="btn" type="button" data-cap="archivo">Subir capítulos desde Tintero</button>
        <input type="file" id="cap-archivo" accept=".tintero,.rtf,.txt" multiple hidden>
        <span class="ayuda">Elige uno o varios archivos .tintero (también sirven .rtf y .txt). Cada pestaña del archivo se vuelve un capítulo.</span></div>
      <p class="ayuda" id="cap-estado" role="status">${esc(msg || '')}</p>
      ${previa ? previaHTML(caps.length) : ''}
      ${caps.length ? `<ol class="items caps-lista">${caps.map((c, n) => `<li>
        <span class="num">${n + 1}</span>
        <input type="text" data-cap-titulo="${n}" value="${esc(c.titulo || '')}" placeholder="Capítulo ${n + 1} (sin título)" aria-label="Título del capítulo ${n + 1}">
        <input type="date" data-cap-fecha="${n}" value="${esc(c.fecha || '')}" aria-label="Fecha del capítulo ${n + 1}">
        <small>${palabras(c.html)} palabras</small>
        <span class="botones-cap">
          <button class="btn sec" type="button" data-cap="arriba" data-n="${n}"${n === 0 ? ' disabled' : ''} aria-label="Mover el capítulo ${n + 1} arriba">&uarr;</button>
          <button class="btn sec" type="button" data-cap="abajo" data-n="${n}"${n === caps.length - 1 ? ' disabled' : ''} aria-label="Mover el capítulo ${n + 1} abajo">&darr;</button>
          <button class="btn sec" type="button" data-cap="ver" data-n="${n}" aria-expanded="${capVer === n}">${capVer === n ? 'Ocultar' : 'Ver'}</button>
          <button class="btn sec" type="button" data-cap="reemplazar" data-n="${n}">Reemplazar texto</button>
          <button class="btn ${capBorrar === n ? 'peligro' : 'sec'}" type="button" data-cap="borrar" data-n="${n}">${capBorrar === n ? '¿Seguro? Borrar' : 'Borrar'}</button>
        </span>
        ${capVer === n ? `<div class="vista-cap">${limpiarHTML(c.html) || '<p class="ayuda">Vacío.</p>'}</div>` : ''}</li>`).join('')}</ol>`
        : (previa ? '' : '<p class="ayuda">Todavía no tiene capítulos. Súbelos con el botón de arriba; aparecen en tu sitio en el orden de esta lista.</p>')}</div>`;
    if (foco) { const f = caja.querySelector(foco); if (f) f.focus(); }
  }
  // Vista previa de lo que trae cada archivo, antes de agregarlo (o de reemplazar un capitulo)
  function previaHTML(base) {
    const agregar = previa.modo === 'agregar'; let k = base;
    const elegidos = previa.partes.filter(p => p.usar).length;
    return `<div class="previa"><b>${agregar ? 'Revisa los capítulos antes de agregarlos' : `Elige el texto nuevo para el capítulo ${previa.n + 1}`}</b>
      ${previa.errores.length ? `<p class="aviso error">${previa.errores.map(esc).join('<br>')}</p>` : ''}
      ${previa.partes.length ? `<ul class="items">${previa.partes.map((p, i) => { if (p.usar) k++; return `<li>
        <input type="${agregar ? 'checkbox' : 'radio'}" name="previa-usar" data-previa-usar="${i}"${p.usar ? ' checked' : ''}${p.html ? '' : ' disabled'} aria-label="Usar ${esc(p.archivo)}${p.nombre ? ', ' + esc(p.nombre) : ''}">
        <div class="que">${agregar ? `<input type="text" data-previa-titulo="${i}" value="${esc(p.titulo)}" placeholder="${p.usar ? `Capítulo ${k} (sin título)` : 'No se agregará'}" aria-label="Título del capítulo">` : ''}
          <small>${esc(p.archivo)}${p.nombre ? ` · pestaña «${esc(p.nombre)}»` : ''} · ${p.html ? palabras(p.html) + ' palabras' : 'sin texto'}</small>
          ${p.html ? `<small class="inicio">${esc(primeraLinea(p.html))}</small>` : ''}</div></li>`; }).join('')}</ul>` : ''}
      <div class="acciones">${previa.partes.length ? `<button class="btn" type="button" data-cap="confirmar"${elegidos ? '' : ' disabled'}>${agregar ? `Agregar ${elegidos} ${elegidos === 1 ? 'capítulo' : 'capítulos'}` : 'Reemplazar el texto'}</button>` : ''}<button class="btn sec" type="button" data-cap="cancelar">Cancelar</button></div></div>`;
  }
  async function leerArchivos(files) {
    const lista = [...files].sort((a, b) => a.name.localeCompare(b.name, 'es', { numeric: true }));
    const partes = [], errores = [];
    for (const f of lista) {
      try {
        Tintero.leer(new Uint8Array(await f.arrayBuffer()), f.name).forEach(p =>
          partes.push({ archivo: f.name, nombre: (p.nombre || '').trim(), html: p.html, usar: !!p.html, titulo: nombreGenerico(p.nombre) ? '' : p.nombre.trim() }));
      } catch (err) { errores.push(`${f.name}: ${err.message || 'no se pudo leer.'}`); }
    }
    return { partes, errores };
  }
  function tocarEscrito(e) { e.actualizado = hoy(); const fa = $('#f-actualizado'); if (fa) fa.value = e.actualizado; }

  $('#hoja').addEventListener('click', async ev => {
    const b = ev.target.closest('[data-cap]'); if (!b) return;
    const e = escritoAbierto(); if (!e) return;
    const caps = e.capitulos || [], n = +b.dataset.n, accion = b.dataset.cap;
    if (accion !== 'borrar') capBorrar = null;
    if (accion === 'archivo' || accion === 'reemplazar') {
      if (!window.Tintero) return pintarCapitulos('Falta el archivo tintero.js junto a panel.html: sin él no se pueden leer los capítulos.');
      const input = $('#cap-archivo'); input.multiple = accion === 'archivo'; input.dataset.modo = accion; input.dataset.n = isNaN(n) ? '' : n; input.value = ''; input.click(); return;
    }
    if (accion === 'cancelar') { previa = null; return pintarCapitulos('', '[data-cap="archivo"]'); }
    if (accion === 'confirmar' && previa) {
      const elegidos = previa.partes.filter(p => p.usar && p.html);
      if (previa.modo === 'agregar') {
        e.capitulos = caps; let id = caps.reduce((m, c) => Math.max(m, Number(c.id) || 0), 0) + 1;
        elegidos.forEach(p => caps.push({ id: id++, titulo: p.titulo.trim(), fecha: hoy(), html: p.html }));
        previa = null; tocarEscrito(e); guardarBorrador(); refrescarLista();
        return pintarCapitulos(`${elegidos.length === 1 ? 'Se agregó 1 capítulo' : `Se agregaron ${elegidos.length} capítulos`}. Publica cuando termines.`);
      }
      const c = caps[previa.n]; if (c && elegidos[0]) { c.html = elegidos[0].html; tocarEscrito(e); guardarBorrador(); }
      const num = previa.n + 1; previa = null;
      return pintarCapitulos(`Texto del capítulo ${num} reemplazado. Publica cuando termines.`);
    }
    if (accion === 'arriba' || accion === 'abajo') {
      const m = accion === 'arriba' ? n - 1 : n + 1; if (m < 0 || m >= caps.length) return;
      [caps[n], caps[m]] = [caps[m], caps[n]]; capVer = null; guardarBorrador();
      return pintarCapitulos(`Capítulo movido a la posición ${m + 1}.`, `[data-cap="${accion}"][data-n="${m}"]:not([disabled])`);
    }
    if (accion === 'ver') { capVer = capVer === n ? null : n; return pintarCapitulos('', `[data-cap="ver"][data-n="${n}"]`); }
    if (accion === 'borrar') {
      if (capBorrar !== n) { capBorrar = n; return pintarCapitulos('Pulsa otra vez para borrarlo.', `[data-cap="borrar"][data-n="${n}"]`); }
      caps.splice(n, 1); capBorrar = null; capVer = null; guardarBorrador(); refrescarLista();
      return pintarCapitulos(`Capítulo ${n + 1} borrado.`);
    }
  });
  $('#hoja').addEventListener('change', async ev => {
    const el = ev.target, e = escritoAbierto(); if (!e) return;
    if (el.id === 'cap-archivo' && el.files.length) {
      const { partes, errores } = await leerArchivos(el.files);
      const modo = el.dataset.modo === 'reemplazar' ? 'reemplazar' : 'agregar';
      if (modo === 'reemplazar') { let uno = false; partes.forEach(p => { p.usar = !!p.html && !uno; if (p.usar) uno = true; }); }
      previa = { modo, n: +el.dataset.n, partes, errores };
      return pintarCapitulos(partes.length ? '' : 'No encontré texto en ese archivo.', '[data-cap="confirmar"]:not([disabled]), [data-cap="cancelar"]');
    }
    if (el.dataset.previaUsar != null && previa) {
      const i = +el.dataset.previaUsar;
      if (previa.modo === 'reemplazar') previa.partes.forEach((p, j) => { p.usar = j === i; }); else previa.partes[i].usar = el.checked;
      return pintarCapitulos('', `[data-previa-usar="${i}"]`);
    }
    const caps = e.capitulos || [];
    if (el.dataset.capTitulo != null) { caps[+el.dataset.capTitulo].titulo = el.value.trim(); guardarBorrador(); }
    if (el.dataset.capFecha != null) { caps[+el.dataset.capFecha].fecha = el.value; guardarBorrador(); }
  });
  $('#hoja').addEventListener('input', ev => { const el = ev.target; if (el.dataset.previaTitulo != null && previa) previa.partes[+el.dataset.previaTitulo].titulo = el.value; });

  $('#pestanas').addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) { pestana = b.dataset.p; editando = null; borrarPendiente = null; pintar(); } });
  $('#hoja').addEventListener('click', e => {
    const ed = e.target.closest('[data-editar]'); if (ed) { editando = +ed.dataset.editar; borrarPendiente = null; pintar(); $('#form').scrollIntoView({ behavior: 'smooth' }); return; }
    const bo = e.target.closest('[data-borrar]');
    if (bo) { const n = +bo.dataset.borrar; if (borrarPendiente === n) { datos[SECCIONES[pestana].lista].splice(n, 1); borrarPendiente = null; editando = null; guardarBorrador(); } else borrarPendiente = n; pintar(); }
  });

  // ---------- Perfil ----------
  function pintarPerfil(h) {
    const p = datos.perfil;
    // Los gustos traducidos solos no muestran su ingles: solo los que pusiste a mano con la barra
    const aTexto = lista => (lista || []).map(g => g.en && g.en !== g.es && !g.auto ? `${g.es} | ${g.en}` : (g.es || '')).join('\n');
    const gustos = aTexto(p.gustos);
    h.innerHTML = `<form class="formulario" id="form-perfil"><b>Perfil</b>
      <div class="dos">${campoHTML(['nombre', 'Nombre', 'text', 1], p.nombre)}${campoHTML(['desde', 'Desde (mes en que abriste el sitio)', 'month'], p.desde)}</div>
      ${campoHTML(['avatar', 'Avatar: enlace directo o súbelo desde tu PC', 'imagen'], p.avatar)}
      <div class="dos">${campoHTML(['lema.es', 'Lema', 'text'], p.lema && p.lema.es)}${campoHTML(['lema.en', 'Lema en inglés (se traduce solo)', 'text'], p.lema && p.lema.en)}</div>
      ${campoHTML(['presentacion.es', 'Presentación', 'textarea', 0, AYUDA_TEXTO], p.presentacion && p.presentacion.es)}
      ${campoHTML(['presentacion.en', 'Presentación en inglés (se traduce sola)', 'textarea', 0, AYUDA_EN], p.presentacion && p.presentacion.en)}
      ${campoHTML(['gustos', 'Cosas que me gustan', 'textarea', 0, 'Una por línea. Se traducen solas al inglés; si quieres poner tu propia traducción, sepárala con una barra: Ajedrez | Chess'], gustos)}
      ${campoHTML(['frases', 'Frases del día', 'textarea', 0, 'Una por línea; el inicio muestra una distinta cada día. Se traducen solas, o pon la tuya con una barra: Frase | Quote'], aTexto(p.frases))}
      ${campoHTML(['reglas', 'Reglas de la mesa', 'textarea', 0, 'Una por línea, en orden; salen en la página Reglas. Se traducen solas, o pon la tuya con una barra: Regla | Rule'], aTexto(p.reglas))}
      ${campoHTML(['discord', 'ID de usuario de Discord (para mostrar lo que escuchas)', 'text', 0, 'Para que funcione tienes que estar en el servidor de Discord de Lanyard. Déjalo vacío para no mostrar nada.'], p.discord)}
      <div class="acciones"><button class="btn" type="submit">Guardar perfil</button></div></form>`;
    $('#form-perfil').addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target.elements, boton = e.target.querySelector('[type="submit"]');
      const antes = copia(datos.perfil);
      const nuevo = Object.assign(copia(datos.perfil), { nombre: f['nombre'].value.trim() || 'Frix', desde: f['desde'].value, avatar: f['avatar'].value.trim(), discord: f['discord'].value.replace(/\D/g, ''),
        lema: Object.assign({}, antes.lema, { es: f['lema.es'].value, en: f['lema.en'].value }),
        presentacion: Object.assign({}, antes.presentacion, { es: f['presentacion.es'].value.replace(/\r/g, ''), en: f['presentacion.en'].value.replace(/\r/g, '') }) });
      boton.disabled = true;
      const r = await completarIngles(nuevo, antes, ['lema', 'presentacion'], avisar);
      const g = await gustosDesde(f['gustos'].value, antes.gustos || [], avisar);
      const fr = await gustosDesde(f['frases'].value, antes.frases || [], avisar);
      const rg = await gustosDesde(f['reglas'].value, antes.reglas || [], avisar);
      boton.disabled = false;
      nuevo.gustos = g.gustos; nuevo.frases = fr.gustos; nuevo.reglas = rg.gustos; datos.perfil = nuevo;
      guardarBorrador();
      const fallo = r.fallo || g.fallo || fr.fallo || rg.fallo;
      avisar(fallo ? `Perfil guardado, pero no se pudo traducir al inglés (${fallo.message}). Puedes intentarlo luego en Publicar.` : (r.hechos + g.hechos + fr.hechos + rg.hechos ? 'Perfil guardado y traducido al inglés.' : 'Perfil guardado en el borrador.'));
      if (pestana === 'perfil') pintar();
    });
  }

  // ---------- Buscador de obras ----------
  function buscadorHTML() {
    return `<div class="caja"><h3>Buscar y agregar</h3><div class="dentro" style="display:grid;gap:8px">
      <form class="acciones" id="form-buscar">
        <select id="b-tipo" aria-label="Tipo">${[['anime', 'Anime (AniList)'], ['manga', 'Manga (AniList)'], ['serie', 'Serie (TVMaze)'], ['pelicula', 'Película (Wikidata)'], ['libro', 'Libro (Open Library)'], ['comic', 'Cómic (Open Library)'], ['juego', 'Juego (Wikidata)'], ['otro', 'Otro (Wikidata)']].map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select>
        <input id="b-texto" type="search" placeholder="Escribe un título" required style="flex:1;min-width:180px;font:13px var(--sistema);padding:5px 7px;border:1px solid var(--borde);background:var(--fondo);color:var(--texto)">
        <button class="btn" type="submit">Buscar</button></form>
      <div id="b-estado" class="ayuda">Elige el tipo, escribe el título y pulsa Buscar. Luego elige estado y nota antes de agregarlo.</div>
      <div class="resultados" id="b-resultados"></div></div></div>`;
  }
  const q = String.fromCharCode(63);
  const BUSCAR = {
    async anilist(texto, tipo) {
      const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: 'query($q:String,$t:MediaType){Page(perPage:10){media(search:$q,type:$t){title{romaji english} startDate{year} format coverImage{medium}}}}', variables: { q: texto, t: tipo.toUpperCase() } }) });
      const j = await r.json();
      return j.data.Page.media.map(m => ({ titulo: m.title.romaji || m.title.english, extra: [m.title.english, m.format].filter(Boolean).join(' · '), anio: m.startDate.year || '', portada: m.coverImage.medium || '' }));
    },
    async tvmaze(texto) {
      const j = await (await fetch('https://api.tvmaze.com/search/shows' + q + 'q=' + encodeURIComponent(texto))).json();
      return j.slice(0, 10).map(({ show: s }) => ({ titulo: s.name, extra: [s.network && s.network.name, s.language].filter(Boolean).join(' · '), anio: (s.premiered || '').slice(0, 4), portada: s.image ? s.image.medium.replace('http:', 'https:') : '' }));
    },
    async openlibrary(texto) {
      const j = await (await fetch('https://openlibrary.org/search.json' + q + 'limit=10&fields=title,author_name,first_publish_year,cover_i&q=' + encodeURIComponent(texto))).json();
      return j.docs.map(d => ({ titulo: d.title, extra: (d.author_name || []).slice(0, 2).join(', '), anio: d.first_publish_year || '', portada: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : '' }));
    },
    async wikidata(texto) {
      const j = await (await fetch('https://www.wikidata.org/w/api.php' + q + 'action=wbsearchentities&format=json&origin=*&limit=10&language=es&uselang=es&search=' + encodeURIComponent(texto))).json();
      return j.search.map(s => { const a = /\b(1[89]\d\d|20\d\d)\b/.exec(s.description || ''); return { titulo: s.label, extra: s.description || '', anio: a ? a[0] : '', portada: '' }; });
    }
  };
  const FUENTE = { anime: 'anilist', manga: 'anilist', serie: 'tvmaze', libro: 'openlibrary', comic: 'openlibrary', pelicula: 'wikidata', juego: 'wikidata', otro: 'wikidata' };
  function activarBuscador() {
    let resultados = [];
    $('#form-buscar').addEventListener('submit', async e => {
      e.preventDefault();
      const tipo = $('#b-tipo').value, texto = $('#b-texto').value.trim(); if (!texto) return;
      const est = $('#b-estado'); est.className = 'ayuda'; est.textContent = 'Buscando…'; $('#b-resultados').innerHTML = '';
      try {
        resultados = (await BUSCAR[FUENTE[tipo]](texto, tipo)).map(r => Object.assign(r, { tipo }));
        est.textContent = resultados.length ? `${resultados.length} resultados. Elige estado y nota, y pulsa Agregar.` : 'Sin resultados. Prueba con otro título o agrégalo a mano más abajo.';
        $('#b-resultados').innerHTML = resultados.map((r, n) => `<div class="resultado"><div class="tapa">${r.portada ? `<img src="${esc(r.portada)}" alt="">` : ''}</div>
          <div><b>${esc(r.titulo)}</b>${r.anio ? ` (${esc(r.anio)})` : ''}<small>${esc(r.extra)}</small></div>
          <div class="acciones"><select data-est="${n}" aria-label="Estado">${OPC_ESTADO_OBRA.map(([k, t]) => `<option value="${k}"${k === '2' ? ' selected' : ''}>${t}</option>`).join('')}</select>
          <select data-nota="${n}" aria-label="Nota">${OPC_NOTA.map(([k, t]) => `<option value="${k}">${t}</option>`).join('')}</select>
          <button class="btn" type="button" data-agregar="${n}">Agregar</button></div></div>`).join('');
      } catch (err) {
        est.className = 'aviso error';
        est.textContent = 'No se pudo buscar. Revisa tu conexión e inténtalo otra vez; si sigue fallando, agrégalo a mano.';
      }
    });
    $('#b-resultados').addEventListener('click', e => {
      const b = e.target.closest('[data-agregar]'); if (!b) return;
      const n = +b.dataset.agregar, r = resultados[n];
      const id = datos.obras.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
      datos.obras.push({ id, tipo: r.tipo, titulo: r.titulo, anio: r.anio ? Number(r.anio) : '', portada: r.portada, estado: Number($(`[data-est="${n}"]`).value), nota: Number($(`[data-nota="${n}"]`).value), fecha: hoy() });
      guardarBorrador(); b.textContent = 'Agregado'; b.disabled = true; pintarPestanas();
      $('#b-estado').textContent = `"${r.titulo}" agregado. Aparece en la lista de abajo cuando cambies de pestaña o agregues otro.`;
    });
  }

  // ---------- Traduccion automatica al ingles (todo menos Escritos) ----------
  // Usa el traductor integrado de Chrome si el navegador lo tiene (funciona sin internet);
  // si no, MyMemory (en linea y gratis: 5.000 letras al dia, o 50.000 con un correo).
  const CLAVE_CORREO = 'panel-correo-traductor';
  const correoTraductor = () => { try { return localStorage.getItem(CLAVE_CORREO) || ''; } catch (e) { return ''; } };
  let traductorChrome = null, chromeNoSirve = false;
  const conLimite = (promesa, ms) => Promise.race([promesa, new Promise((_, mal) => setTimeout(() => mal(new Error('sin respuesta')), ms))]);
  async function motorTraduccion(aviso) {
    if (traductorChrome) return traductorChrome;
    if (!chromeNoSirve && 'Translator' in self) {
      try {
        const disp = await conLimite(Translator.availability({ sourceLanguage: 'es', targetLanguage: 'en' }), 4000);
        if (disp !== 'unavailable') {
          // Si Chrome tiene que descargar su traductor, se espera mientras avance; si se queda quieto 20 s, se usa el de internet
          let ultimo = Date.now();
          const creando = Translator.create({ sourceLanguage: 'es', targetLanguage: 'en',
            monitor(m) { m.addEventListener('downloadprogress', ev => { ultimo = Date.now(); if (aviso) aviso(`Descargando el traductor de Chrome… ${Math.round(ev.loaded * 100)}%`); }); } });
          const tr = await new Promise((ok, mal) => {
            const reloj = setInterval(() => { if (Date.now() - ultimo > 20000) { clearInterval(reloj); mal(new Error('sin respuesta')); } }, 1000);
            creando.then(v => { clearInterval(reloj); ok(v); }, e => { clearInterval(reloj); mal(e); });
          });
          traductorChrome = async s => {
            try { return await conLimite(tr.translate(s), 30000); }
            catch (e) { traductorChrome = null; chromeNoSirve = true; return traducirEnLinea(s); }
          };
          return traductorChrome;
        }
      } catch (e) { /* sin permiso o sin modelo: se usa el traductor en linea */ }
      chromeNoSirve = true;
    }
    return traducirEnLinea;
  }
  const bytes = s => new TextEncoder().encode(s).length;
  // MyMemory acepta hasta 500 bytes por consulta: se corta por frases (y por palabras si una frase es enorme)
  function trocear(s, max = 450) {
    if (bytes(s) <= max) return [s];
    const out = []; let act = '';
    for (const f of s.match(/[^.!?…;:]+[.!?…;:]*\s*|[.!?…;:]+\s*/g) || [s]) {
      if (bytes(act + f) <= max) { act += f; continue; }
      if (act) out.push(act);
      act = '';
      if (bytes(f) <= max) { act = f; continue; }
      for (const w of f.split(/(?<=\s)/)) { if (act && bytes(act + w) > max) { out.push(act); act = ''; } act += w; }
    }
    if (act) out.push(act);
    return out;
  }
  const decodificar = s => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };
  async function traducirEnLinea(s) {
    let r = '';
    for (const trozo of trocear(s)) {
      const [, a, medio, b] = /^(\s*)([\s\S]*?)(\s*)$/.exec(trozo);
      if (!medio) { r += trozo; continue; }
      const correo = correoTraductor();
      const url = 'https://api.mymemory.translated.net/get' + q + 'langpair=es%7Cen&q=' + encodeURIComponent(medio) + (correo ? '&de=' + encodeURIComponent(correo) : '');
      let j;
      try { j = await (await fetch(url)).json(); } catch (e) { throw new Error('sin conexión con el traductor'); }
      const txt = (j && j.responseData && j.responseData.translatedText) || '';
      if (j.quotaFinished || /MYMEMORY WARNING/i.test(txt)) throw new Error('se acabó el límite gratis de hoy del traductor; mañana se renueva');
      if (+j.responseStatus !== 200 || !txt) throw new Error('el traductor no respondió bien');
      r += a + decodificar(txt) + b;
    }
    return r;
  }
  // Traduce linea por linea: respeta lineas vacias, el > de las lineas en verde y los enlaces
  async function traducirTexto(s, aviso) {
    const traducir = await motorTraduccion(aviso), out = [];
    for (const l of String(s).split('\n')) {
      if (!l.trim()) { out.push(l); continue; }
      const m = /^(\s*>+\s*)?([\s\S]*)$/.exec(l); let r = m[1] || '';
      // Las partes impares son enlaces o marcas de color (# ... #FF0000): se copian tal cual
      const partes = m[2].split(/(https?:\/\/\S+|(?:^|\s)#(?=\s)|#[0-9a-fA-F]{6}(?![0-9a-zA-Z])|#[0-9a-fA-F]{3}(?![0-9a-zA-Z]))/);
      for (let k = 0; k < partes.length; k++) {
        const p = partes[k];
        if (k % 2 || !p.trim()) { r += p; continue; }
        const [, a, medio, b] = /^(\s*)([\s\S]*?)(\s*)$/.exec(p);
        r += a + (await traducir(medio)).trim() + b;
      }
      out.push(r);
    }
    return out.join('\n');
  }
  // Completa el ingles de los campos {es, en}:
  // - ingles vacio, o espanol cambiado sin tocar el ingles: se traduce solo;
  // - ingles escrito o corregido a mano: se marca manual y ya no se reemplaza.
  async function completarIngles(item, antes, rutas, aviso) {
    let hechos = 0, fallo = null;
    for (const r of rutas) {
      const o = item[r]; if (!o || typeof o !== 'object') continue;
      const v = (antes && antes[r] && typeof antes[r] === 'object') ? antes[r] : {};
      delete o.auto;
      if (!(o.es || '').trim()) { if (o.en === v.en) o.en = ''; delete o.manual; continue; }
      const tocado = (o.en || '') !== (v.en || '');
      if (o.en && tocado) { o.manual = true; continue; }             // lo escribiste tu
      if (o.en && (o.es === v.es || o.manual)) continue;              // nada que traducir
      if (!fallo) {
        try { if (aviso) aviso('Traduciendo al inglés…'); o.en = await traducirTexto(o.es, aviso); delete o.manual; hechos++; continue; }
        catch (e) { fallo = e; }
      }
      if (o.en && o.es !== v.es) o.en = ''; // la traduccion vieja ya no corresponde al espanol nuevo
    }
    return { hechos, fallo };
  }
  async function gustosDesde(texto, previos, aviso) {
    const gustos = []; let hechos = 0, fallo = null;
    for (const l of texto.split('\n').map(x => x.trim()).filter(Boolean)) {
      const [es, en] = l.split('|').map(s => s.trim());
      if (en) { gustos.push({ es, en }); continue; }
      const viejo = previos.find(g => g.es === es && g.auto && g.en);
      if (viejo) { gustos.push({ es, en: viejo.en, auto: true }); continue; }
      if (fallo) { gustos.push({ es, en: '' }); continue; }
      try { aviso && aviso('Traduciendo al inglés…'); gustos.push({ es, en: await traducirTexto(es, aviso), auto: true }); hechos++; }
      catch (e) { fallo = e; gustos.push({ es, en: '' }); }
    }
    return { gustos, hechos, fallo };
  }
  // Textos en espanol que todavia no tienen ingles (los escritos no cuentan)
  function sinTraducir() {
    const lista = [];
    const mirar = o => { if (o && typeof o === 'object' && (o.es || '').trim() && !(o.en || '').trim()) lista.push([o, false]); };
    ['blog', 'diario', 'galeria', 'cambios'].forEach(k => (datos[k] || []).forEach(it => SECCIONES[k].bilingue.forEach(r => mirar(it[r]))));
    mirar(datos.perfil.lema); mirar(datos.perfil.presentacion);
    [...(datos.perfil.gustos || []), ...(datos.perfil.frases || []), ...(datos.perfil.reglas || [])].forEach(g => { if (g.es && (!g.en || (g.en === g.es && !g.auto))) lista.push([g, true]); });
    return lista;
  }

  // ---------- Publicar directo en el sitio (GitHub) ----------
  // datos.js vive en el repositorio. Al cambiarlo ahi, GitHub actualiza el sitio solo (GitHub Pages).
  const CLAVE_GH = 'panel-github', RUTA_DATOS = 'public/datos.js';
  const GH_DEF = { repo: 'AeshilFrix/sitio-frix', rama: 'main', token: '' };
  const configGH = () => { try { return Object.assign({}, GH_DEF, JSON.parse(localStorage.getItem(CLAVE_GH) || '{}')); } catch (e) { return Object.assign({}, GH_DEF); } };
  const guardarConfigGH = c => { try { localStorage.setItem(CLAVE_GH, JSON.stringify(c)); } catch (e) {} };
  const urlSitio = c => { const [d, r] = c.repo.split('/'); const u = (d || '').toLowerCase(); return r && r.toLowerCase() === u + '.github.io' ? `https://${u}.github.io/` : `https://${u}.github.io/${r}/`; };
  const URL_CLAVE = 'https://github.com/settings/personal-access-tokens/new' + String.fromCharCode(63) +
    'name=Panel+sitio-frix&description=Publica+datos.js+desde+el+panel+del+sitio&target_name=AeshilFrix&expires_in=366&contents=write';
  const cabecerasGH = (c, crudo) => ({ Authorization: 'Bearer ' + c.token, Accept: crudo ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' });
  const urlGH = c => `https://api.github.com/repos/${c.repo}/contents/${RUTA_DATOS}`;
  function errorGH(status, extra) {
    if (status === 401) return new Error('la clave de GitHub no es válida o ya venció');
    if (status === 403) return new Error('la clave no tiene permiso para escribir en el repositorio' + (extra ? ` (${extra})` : ''));
    if (status === 404) return new Error('no encuentro el repositorio, o la clave no tiene acceso a él');
    if (status === 409 || status === 422) return new Error('el archivo cambió en GitHub mientras publicabas; vuelve a intentarlo');
    return new Error('GitHub respondió ' + status + (extra ? ` (${extra})` : ''));
  }
  const aBase64 = s => { const b = new TextEncoder().encode(s); let t = ''; for (let i = 0; i < b.length; i += 0x8000) t += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(t); };
  const parsearDatos = txt => JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
  async function pedirGH(url, opciones) { try { return await fetch(url, Object.assign({ cache: 'no-store' }, opciones)); } catch (e) { throw new Error('sin conexión con GitHub'); } }
  async function leerDeGitHub(c) {
    const r = await pedirGH(urlGH(c) + q + 'ref=' + encodeURIComponent(c.rama), { headers: cabecerasGH(c, true) });
    if (!r.ok) throw errorGH(r.status);
    return parsearDatos(await r.text());
  }
  async function publicarEnGitHub(c, texto) {
    const h = cabecerasGH(c);
    let r = await pedirGH(urlGH(c) + q + 'ref=' + encodeURIComponent(c.rama), { headers: h }), sha;
    if (r.ok) sha = (await r.json()).sha; else if (r.status !== 404) throw errorGH(r.status);
    const cuerpo = { message: 'Panel: actualizar el contenido del sitio', content: aBase64(texto), branch: c.rama };
    if (sha) cuerpo.sha = sha;
    r = await pedirGH(urlGH(c), { method: 'PUT', headers: h, body: JSON.stringify(cuerpo) });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw errorGH(r.status, e.message); }
  }
  // ---------- Subir imagenes a public/galeria/ (van directo al sitio) ----------
  const SUBIDAS = {
    imagen: { carpeta: 'galeria', re: /\.(png|jpe?g|gif|webp)$/i, accept: 'image/png,image/jpeg,image/gif,image/webp', error: 'solo se pueden subir imágenes .png, .jpg, .gif o .webp', que: 'imagen' },
    audio: { carpeta: 'musica', re: /\.(mp3|ogg|m4a)$/i, accept: 'audio/mpeg,audio/ogg,audio/mp4,.mp3,.ogg,.m4a', error: 'solo se puede subir audio .mp3, .ogg o .m4a', que: 'canción' }
  };
  const MAX_SUBIDA = 25 * 1024 * 1024;
  const nombreLimpio = n => {
    const m = /^(.*?)(\.[a-z0-9]+)?$/i.exec(n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase());
    return ((m[1].replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'imagen').slice(0, 60)) + ((m[2] || '.png').replace('.jpeg', '.jpg'));
  };
  const bytesABase64 = buf => { const b = new Uint8Array(buf); let t = ''; for (let i = 0; i < b.length; i += 0x8000) t += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(t); };
  const urlCrudaGH = ruta => { const c = configGH(); return `https://raw.githubusercontent.com/${c.repo}/${c.rama}/public/${ruta}`; };
  async function subirArchivo(archivo, tipo, aviso) {
    const c = configGH(), S = SUBIDAS[tipo];
    if (!c.token) throw new Error('primero conecta el panel con GitHub en la pestaña Publicar');
    if (!S.re.test(archivo.name)) throw new Error(S.error);
    if (archivo.size > MAX_SUBIDA) throw new Error('el archivo pesa más de 25 MB');
    const h = cabecerasGH(c), base = nombreLimpio(archivo.name), punto = base.lastIndexOf('.');
    let nombre = base;
    // Si ya existe una imagen con ese nombre, se agrega -2, -3...
    for (let n = 2; ; n++) {
      const r = await pedirGH(`https://api.github.com/repos/${c.repo}/contents/public/${S.carpeta}/${nombre}` + q + 'ref=' + encodeURIComponent(c.rama), { headers: h });
      if (r.status === 404) break;
      if (!r.ok) throw errorGH(r.status);
      nombre = base.slice(0, punto) + '-' + n + base.slice(punto);
    }
    aviso(`Subiendo ${nombre}…`);
    const r = await pedirGH(`https://api.github.com/repos/${c.repo}/contents/public/${S.carpeta}/${nombre}`, { method: 'PUT', headers: h,
      body: JSON.stringify({ message: `Panel: subir ${S.que} ${nombre}`, content: bytesABase64(await archivo.arrayBuffer()), branch: c.rama }) });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw errorGH(r.status, e.message); }
    return S.carpeta + '/' + nombre;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-subir-img]'); if (!b) return;
    const campo = document.getElementById(b.dataset.subirImg), est = document.getElementById(b.dataset.subirImg + '-estado');
    const tipo = SUBIDAS[b.dataset.tipo] ? b.dataset.tipo : 'imagen';
    const input = document.createElement('input'); input.type = 'file'; input.accept = SUBIDAS[tipo].accept; input.hidden = true;
    document.body.appendChild(input);
    input.onchange = async () => {
      const f = input.files[0]; input.remove(); if (!f) return;
      b.disabled = true;
      try {
        const ruta = await subirArchivo(f, tipo, m => { est.textContent = m; });
        campo.value = ruta;
        est.innerHTML = `Subida: <b>${esc(ruta)}</b>. En tu sitio aparece en un minuto. Ahora pulsa ${campo.form && campo.form.id === 'form-perfil' ? 'Guardar perfil' : 'Agregar o Guardar'}.`;
      } catch (err) { est.textContent = 'No se pudo subir: ' + err.message + '.'; }
      b.disabled = false;
    };
    input.click();
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pintar]'); if (!b) return;
    const ta = document.getElementById(b.dataset.pintar), color = document.getElementById(b.dataset.pintar + '-color').value.toUpperCase();
    const est = document.getElementById(b.dataset.pintar + '-pintar');
    let i = ta.selectionStart, f = ta.selectionEnd, v = ta.value;
    while (i < f && /\s/.test(v[i])) i++;
    while (f > i && /\s/.test(v[f - 1])) f--;
    if (i === f) { est.textContent = 'Primero selecciona el texto que quieres pintar.'; ta.focus(); return; }
    if (v.slice(i, f).includes('\n')) { est.textContent = 'El color va dentro de una sola línea: selecciona menos texto.'; ta.focus(); return; }
    // Si lo seleccionado ya tiene color, solo se cambia el color (no se anida)
    const yaPintado = /^#\s+([\s\S]*?)\s*#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.exec(v.slice(i, f));
    const antes = i > 0 && !/\s/.test(v[i - 1]) ? ' ' : '', despues = f < v.length && /[0-9a-zA-Z]/.test(v[f]) ? ' ' : '';
    const nuevo = `${antes}# ${yaPintado ? yaPintado[1] : v.slice(i, f)} ${color}${despues}`;
    ta.value = v.slice(0, i) + nuevo + v.slice(f);
    ta.focus(); ta.setSelectionRange(i + nuevo.length, i + nuevo.length);
    est.innerHTML = `Listo: ese texto sale en <span style="color:${color}">este color</span> en tu sitio.`;
  });
  // En el panel, una imagen recien subida todavia no esta en tu carpeta: se muestra desde GitHub
  document.addEventListener('error', e => {
    const i = e.target;
    if (i.tagName !== 'IMG' || i.dataset.respaldo) return;
    const src = i.getAttribute('src') || '';
    if (/^galeria\//.test(src)) { i.dataset.respaldo = '1'; i.src = urlCrudaGH(src); }
  }, true);

  // Al abrir el panel, trae lo ultimo publicado (por si escribiste desde otra PC o el archivo local esta viejo)
  async function sincronizarGH() {
    const c = configGH(); if (!c.token) return;
    try {
      const remoto = JSON.stringify(Object.assign(copia(VACIO), await leerDeGitHub(c)));
      if (remoto === original) return;
      const sinTocar = JSON.stringify(datos) === original;
      original = remoto;
      if (sinTocar) { datos = JSON.parse(remoto); editando = null; }
      revisarBorrador(); pintar();
      avisar(sinTocar ? 'Cargué lo último que está publicado.' : 'Hay cambios sin publicar');
    } catch (e) { avisar('No pude leer lo publicado en GitHub: ' + e.message + '.'); }
  }
  async function traducirFaltantes(est) {
    const lista = sinTraducir(); let n = 0;
    for (const [o, esGusto] of lista) {
      est.textContent = `Traduciendo ${n + 1} de ${lista.length}…`;
      o.en = await traducirTexto(o.es, m => { est.textContent = m; }); if (esGusto) o.auto = true; n++;
      guardarBorrador();
    }
    return n;
  }

  // ---------- Pestana Publicar ----------
  function salida() { return '/* Datos del sitio. Este archivo lo genera el panel (panel.html): no hace falta editarlo a mano. */\nwindow.DATOS = ' + JSON.stringify(datos, null, 2) + ';\n'; }
  function pintarPublicar(h) {
    const ejemplos = ['blog', 'diario', 'escritos', 'obras', 'galeria'].reduce((s, k) => s + datos[k].filter(x => x.ejemplo).length, 0);
    const faltan = sinTraducir().length, c = configGH(), cambios = JSON.stringify(datos) !== original;
    h.innerHTML = `<section class="caja"><h3>Publicar en tu sitio</h3><div class="dentro pub">
      ${c.token ? `<p>${cambios ? 'Tienes cambios sin publicar.' : 'Todo está publicado.'} Al publicar, el contenido se guarda en GitHub (<a href="https://github.com/${esc(c.repo)}" target="_blank" rel="noopener">${esc(c.repo)}</a>) y <a href="${urlSitio(c)}" target="_blank" rel="noopener">tu sitio</a> se actualiza solo en un minuto.${faltan ? ` Antes se traducen al inglés los ${faltan} textos que faltan.` : ''}</p>
        <div class="acciones"><button class="btn" type="button" id="publicar-gh">Publicar ahora</button>
          ${ejemplos ? `<button class="btn ${borrarPendiente === 'ej' ? 'peligro' : 'sec'}" type="button" id="sin-ejemplos">${borrarPendiente === 'ej' ? '¿Seguro? Quitar ' + ejemplos + ' ejemplos' : 'Quitar los ' + ejemplos + ' ejemplos'}</button>` : ''}
          <button class="btn sec" type="button" id="gh-olvidar">${borrarPendiente === 'gh' ? '¿Seguro? Quitar la clave de esta PC' : 'Cambiar la clave'}</button></div>`
      : `<p>Conecta el panel con GitHub una sola vez y publicar será un clic: tu sitio se actualiza solo, sin subir archivos.</p>
        <ol class="pasos"><li><a href="${URL_CLAVE}" target="_blank" rel="noopener">Crea una clave de GitHub</a> (ya viene con el nombre y el permiso <b>Contents: Read and write</b>). En <b>Repository access</b> elige <b>Only select repositories</b> y marca <b>sitio-frix</b>. Pulsa <b>Generate token</b> y copia la clave.</li>
        <li>Pégala aquí abajo. Se guarda solo en el navegador de esta PC, nunca en tu sitio.</li></ol>
        <div class="dos"><div class="campo"><label for="gh-token">Clave de GitHub</label><input id="gh-token" type="password" autocomplete="off" placeholder="github_pat_…"></div>
          <div class="campo"><label for="gh-repo">Repositorio</label><input id="gh-repo" type="text" value="${esc(c.repo)}"></div></div>
        <div class="acciones"><button class="btn" type="button" id="gh-guardar">Conectar</button>
          ${ejemplos ? `<button class="btn ${borrarPendiente === 'ej' ? 'peligro' : 'sec'}" type="button" id="sin-ejemplos">${borrarPendiente === 'ej' ? '¿Seguro? Quitar ' + ejemplos + ' ejemplos' : 'Quitar los ' + ejemplos + ' ejemplos'}</button>` : ''}</div>`}
      <p class="ayuda" id="gh-estado" role="status"></p></div></section>
      <section class="caja"><h3>Traducción al inglés</h3><div class="dentro traduccion">
        <p class="ayuda">El blog, el diario, la galería y tu perfil se traducen solos al inglés cuando guardas. Tus escritos no: su versión en inglés se sube aparte, como otro escrito con idioma English (sale con la etiqueta #English).</p>
        <div class="acciones">${faltan ? `<button class="btn sec" type="button" id="traducir-faltan">Traducir lo que falta (${faltan} ${faltan === 1 ? 'texto' : 'textos'})</button>` : '<span class="ayuda">No falta nada por traducir.</span>'}</div>
        <p class="ayuda" id="trad-estado" role="status"></p>
        <p class="ayuda">Traductor: el que trae Chrome si tu navegador lo tiene (funciona en tu PC, sin límite). Si no, MyMemory: en línea y gratis, 5.000 letras al día, o 50.000 si escribes un correo aquí abajo.</p>
        <div class="campo"><label for="correo-trad">Correo para el traductor (opcional; solo se guarda en este navegador, no va a tu sitio)</label><input id="correo-trad" type="email" value="${esc(correoTraductor())}" placeholder="tu@correo.com"></div>
      </div></section>
      <details class="extra"><summary>Otras formas de publicar: descargar o copiar datos.js</summary>
        <div class="dentro-extra"><p class="ayuda">Sirve si no tienes la clave a mano: descarga datos.js y súbelo a la carpeta public/ del repositorio en GitHub (Add file → Upload files).</p>
        <div class="acciones"><button class="btn sec" type="button" id="descargar">Descargar datos.js</button><button class="btn sec" type="button" id="copiar">Copiar texto</button>
        <button class="btn sec" type="button" id="abrir">Abrir otro datos.js</button><input type="file" id="archivo" accept=".js,.json,text/javascript" hidden></div>
        <p class="ayuda" id="pub-estado">Tus cambios se guardan solos en este navegador hasta que publiques.</p>
        <textarea class="salida" id="salida" readonly aria-label="Contenido de datos.js">${esc(salida())}</textarea></div></details>`;
    const est = $('#gh-estado');
    const guardarGH = $('#gh-guardar');
    if (guardarGH) guardarGH.onclick = async () => {
      const token = $('#gh-token').value.trim(), repo = $('#gh-repo').value.trim().replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');
      if (!token) { est.textContent = 'Pega primero la clave.'; return $('#gh-token').focus(); }
      const nueva = Object.assign(configGH(), { token, repo });
      guardarGH.disabled = true; est.textContent = 'Probando la clave…';
      try { await leerDeGitHub(nueva); guardarConfigGH(nueva); pintar(); $('#gh-estado').textContent = 'Conectado. Ya puedes publicar con un clic.'; sincronizarGH(); }
      catch (e) { est.textContent = 'No funcionó: ' + e.message + '.'; guardarGH.disabled = false; }
    };
    const olvidar = $('#gh-olvidar');
    if (olvidar) olvidar.onclick = () => {
      if (borrarPendiente !== 'gh') { borrarPendiente = 'gh'; return pintar(); }
      borrarPendiente = null; guardarConfigGH(Object.assign(configGH(), { token: '' })); pintar();
    };
    const pub = $('#publicar-gh');
    if (pub) pub.onclick = async () => {
      if (JSON.stringify(datos) === original && !sinTraducir().length) { est.textContent = 'No hay nada nuevo que publicar: tu sitio ya tiene todo.'; return; }
      pub.disabled = true; borrarPendiente = null;
      let aviso = '';
      if (sinTraducir().length) {
        try { await traducirFaltantes(est); } catch (e) { aviso = ` Algunos textos quedaron sin traducir (${e.message}).`; }
      }
      est.textContent = 'Publicando…';
      try {
        try {
          // Lo que el sitio tiene y este panel nunca vio (por ejemplo, campos nuevos) se conserva
          const remoto = await leerDeGitHub(configGH()), antes = JSON.parse(original);
          const nada = v => v == null || v === '' || (Array.isArray(v) && !v.length);
          const adoptar = (local, previo, rem) => Object.keys(rem || {}).forEach(k => { if (nada(local[k]) && nada((previo || {})[k]) && !nada(rem[k])) local[k] = rem[k]; });
          adoptar(datos, antes, remoto);
          adoptar(datos.perfil, antes.perfil, remoto.perfil);
        } catch (e) { /* si no se puede leer, se publica igual */ }
        await publicarEnGitHub(configGH(), salida());
        original = JSON.stringify(datos);
        try { localStorage.removeItem(CLAVE); } catch (e) {}
        revisarBorrador(); pintar(); marcarEstado();
        $('#gh-estado').innerHTML = `Publicado. <a href="${urlSitio(configGH())}" target="_blank" rel="noopener">Tu sitio</a> se actualiza solo en un minuto.${esc(aviso)} <a href="https://github.com/${esc(configGH().repo)}/actions" target="_blank" rel="noopener">Ver el avance</a>`;
      } catch (e) { est.textContent = 'No se pudo publicar: ' + e.message + '.' + aviso; pub.disabled = false; }
    };
    const btnTrad = $('#traducir-faltan');
    if (btnTrad) btnTrad.onclick = async () => {
      const t = $('#trad-estado'); btnTrad.disabled = true; let n = 0;
      try { n = await traducirFaltantes(t); t.textContent = `Listo: ${n} ${n === 1 ? 'texto traducido' : 'textos traducidos'}.`; }
      catch (e) { t.textContent = `Se detuvo la traducción porque ${e.message}.`; }
      const msg = t.textContent; pintar(); $('#trad-estado').textContent = msg;
    };
    const correo = $('#correo-trad');
    if (correo) correo.onchange = () => { try { localStorage.setItem(CLAVE_CORREO, correo.value.trim()); } catch (e) {} };
    $('#descargar').onclick = () => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([salida()], { type: 'text/javascript' })); a.download = 'datos.js';
      document.body.appendChild(a); a.click(); a.remove(); $('#pub-estado').textContent = 'Descargado. Ahora súbelo a la carpeta public/ de tu repositorio.';
    };
    $('#copiar').onclick = () => {
      const ta = $('#salida');
      (navigator.clipboard ? navigator.clipboard.writeText(salida()) : Promise.reject()).then(() => { $('#pub-estado').textContent = 'Copiado.'; })
        .catch(() => { ta.focus(); ta.select(); $('#pub-estado').textContent = 'Texto seleccionado: cópialo con Ctrl+C.'; });
    };
    $('#abrir').onclick = () => $('#archivo').click();
    $('#archivo').onchange = async e => {
      const f = e.target.files[0]; if (!f) return; const txt = await f.text();
      try { datos = Object.assign(copia(VACIO), parsearDatos(txt)); guardarBorrador(); pintar(); avisar('Datos cargados desde ' + f.name + '.'); }
      catch (err) { $('#pub-estado').textContent = 'Ese archivo no parece un datos.js válido.'; }
    };
    const sin = $('#sin-ejemplos');
    if (sin) sin.onclick = () => {
      if (borrarPendiente !== 'ej') { borrarPendiente = 'ej'; return pintar(); }
      ['blog', 'diario', 'escritos', 'obras', 'galeria'].forEach(k => { datos[k] = datos[k].filter(x => !x.ejemplo); });
      borrarPendiente = null; guardarBorrador(); pintar();
    };
  }

  marcarEstado(); pintar(); sincronizarGH();
})();
