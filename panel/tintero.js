/* Lee archivos .tintero (y .rtf / .txt) y los convierte en HTML simple: <p>, <br>, <i>, <b>, <u>.
   Formato .tintero: lineas de cabecera ("TINTERO 1", "id", "activa", "siguiente"), luego por cada pestana
   "pestana <n> <nombre>" y "rtf <bytes>" seguido de esos bytes de RTF; termina en "fin". */
(function (raiz) {
  'use strict';
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cp1252 = typeof TextDecoder !== 'undefined' ? new TextDecoder('windows-1252') : null;
  const SIMBOLOS = { emdash: '\u2014', endash: '\u2013', lquote: '\u2018', rquote: '\u2019', ldblquote: '\u201C', rdblquote: '\u201D', bullet: '\u2022', tab: ' ', emspace: ' ', enspace: ' ', qmspace: ' ' };
  const SALTAR = /^(fonttbl|colortbl|stylesheet|info|pict|object|header|footer|headerl|headerr|footerl|footerr|listtable|listoverridetable|themedata|colorschememapping|latentstyles|datastore|xmlnstbl|generator|rsidtbl|mmathPr|pgdsctbl)$/;

  function rtfAHtml(rtf) {
    // Pagina de codigos del RTF (en Windows en espanol es 1252)
    const pc = /\\ansicpg(\d+)/.exec(rtf.slice(0, 400));
    let decod = cp1252;
    if (pc && pc[1] !== '1252') { try { decod = new TextDecoder('windows-' + pc[1]); } catch (e) {} }
    const deByte = n => decod ? decod.decode(new Uint8Array([n])) : String.fromCharCode(n);
    const parrafos = []; let actual = [];
    let estado = { i: false, b: false, u: false, saltar: false, uc: 1 };
    const pila = []; let i = 0, saltarCars = 0;
    const texto = s => {
      if (estado.saltar || !s) return;
      if (saltarCars > 0) { const n = Math.min(saltarCars, s.length); saltarCars -= n; s = s.slice(n); if (!s) return; }
      actual.push({ t: s, i: estado.i, b: estado.b, u: estado.u });
    };
    const cerrar = () => { parrafos.push(actual); actual = []; };
    while (i < rtf.length) {
      const c = rtf[i];
      if (c === '{') { pila.push(Object.assign({}, estado)); i++; if (rtf.startsWith('\\*', i)) estado.saltar = true; continue; }
      if (c === '}') { estado = pila.pop() || estado; i++; continue; }
      if (c === '\r' || c === '\n' || c === '\0') { i++; continue; }
      if (c !== '\\') { let j = i; while (j < rtf.length && !'\\{}\r\n\0'.includes(rtf[j])) j++; texto(rtf.slice(i, j)); i = j; continue; }
      const sig = rtf[i + 1];
      if (sig === '\\' || sig === '{' || sig === '}') { texto(sig); i += 2; continue; }
      if (sig === "'") { texto(deByte(parseInt(rtf.substr(i + 2, 2), 16))); i += 4; continue; }
      if (sig === '~') { texto('\u00A0'); i += 2; continue; }
      if (sig === '_') { texto('-'); i += 2; continue; }
      if (sig === '-' || sig === '*') { i += 2; continue; }
      if (sig === '\r' || sig === '\n') { if (!estado.saltar) cerrar(); i += 2; continue; }
      const m = /^\\([a-zA-Z]+)(-?\d+)? ?/.exec(rtf.slice(i, i + 40));
      if (!m) { i++; continue; }
      i += m[0].length; const p = m[1], n = m[2] === undefined ? null : +m[2];
      if (SALTAR.test(p)) { estado.saltar = true; continue; }
      if (estado.saltar) continue;
      if (p === 'par' || p === 'sect' || p === 'page') cerrar();
      else if (p === 'line') actual.push({ br: true });
      else if (p === 'i') estado.i = n !== 0;
      else if (p === 'b') estado.b = n !== 0;
      else if (p === 'ul') estado.u = n !== 0;
      else if (p === 'ulnone') estado.u = false;
      else if (p === 'plain') { estado.i = estado.b = estado.u = false; }
      else if (p === 'uc') estado.uc = n == null ? 1 : n;
      else if (p === 'u' && n != null) { texto(String.fromCharCode(n < 0 ? n + 65536 : n)); saltarCars = estado.uc; }
      else if (SIMBOLOS[p]) texto(SIMBOLOS[p]);
    }
    if (actual.length) cerrar();
    // Cada parrafo a HTML, juntando trozos con el mismo formato
    const html = parrafos.map(trozos => {
      let out = '';
      for (const k of trozos) {
        if (k.br) { out += '<br>'; continue; }
        let s = esc(k.t);
        if (k.u) s = `<u>${s}</u>`; if (k.b) s = `<b>${s}</b>`; if (k.i) s = `<i>${s}</i>`;
        out += s;
      }
      return out.replace(/<\/i><i>/g, '').replace(/<\/b><b>/g, '').replace(/<\/u><u>/g, '').replace(/^(\s|<br>)+|(\s|<br>)+$/g, '');
    });
    // Quitar parrafos vacios al inicio y al final, y juntar varios vacios seguidos en uno
    while (html.length && !html[0]) html.shift();
    while (html.length && !html[html.length - 1]) html.pop();
    return html.filter((h, n) => h || html[n - 1]).map(h => h ? `<p>${h}</p>` : '<p><br></p>').join('');
  }

  function textoAHtml(txt) {
    return txt.replace(/\r/g, '').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean).map(b => '<p>' + esc(b).replace(/\n/g, '<br>') + '</p>').join('');
  }

  // bytes: Uint8Array. Devuelve [{ nombre, html }]
  function leer(bytes, nombreArchivo) {
    const utf8 = new TextDecoder('utf-8'), latin = new TextDecoder('latin1');
    const ext = (nombreArchivo || '').toLowerCase().split('.').pop();
    const inicio = latin.decode(bytes.slice(0, 12));
    if (inicio.startsWith('TINTERO')) {
      const pestanas = []; let pos = 0, nombre = '';
      const linea = () => { let j = pos; while (j < bytes.length && bytes[j] !== 10) j++; const l = utf8.decode(bytes.slice(pos, j)).replace(/\r$/, ''); pos = j + 1; return l; };
      while (pos < bytes.length) {
        const l = linea();
        if (l.startsWith('pestana ')) nombre = l.replace(/^pestana\s+\S+\s*/, '');
        else if (/^rtf \d+$/.test(l)) {
          const n = +l.slice(4); const rtf = latin.decode(bytes.slice(pos, pos + n)); pos += n;
          pestanas.push({ nombre, html: rtfAHtml(rtf) });
        } else if (l === 'fin') break;
      }
      if (pestanas.length) return pestanas;
      throw new Error('El archivo .tintero no tiene pestañas con texto.');
    }
    const todo = latin.decode(bytes);
    if (todo.trimStart().startsWith('{\\rtf') || ext === 'rtf') return [{ nombre: '', html: rtfAHtml(todo) }];
    return [{ nombre: '', html: textoAHtml(utf8.decode(bytes)) }];
  }

  const palabras = html => (String(html || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').match(/[^\s—–-]+/g) || []).length;
  const api = { leer, rtfAHtml, textoAHtml, palabras };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else raiz.Tintero = api;
})(typeof window !== 'undefined' ? window : globalThis);
