/* Cubo Rubik 3D (Three.js r128). Crea el cubo flotante de la esquina y deja window.Cubo.crear(elemento, opciones)
   para reutilizarlo en grande mas adelante (por ejemplo como interfaz). Cada clic gira una capa al azar. */
(function () {
  'use strict';
  if (!window.THREE) return;
  const COLORES_BASE = { R: 0xb71234, L: 0xff5800, U: 0xffffff, D: 0xffd500, F: 0x009b48, B: 0x0046ad };

  function pegatinaGeo(lado, radio) {
    const s = new THREE.Shape(), h = lado / 2;
    s.moveTo(-h + radio, -h); s.lineTo(h - radio, -h); s.quadraticCurveTo(h, -h, h, -h + radio);
    s.lineTo(h, h - radio); s.quadraticCurveTo(h, h, h - radio, h); s.lineTo(-h + radio, h);
    s.quadraticCurveTo(-h, h, -h, h - radio); s.lineTo(-h, -h + radio); s.quadraticCurveTo(-h, -h, -h + radio, -h);
    return new THREE.ShapeGeometry(s, 6);
  }

  function crear(contenedor, opciones) {
    const o = Object.assign({ duracion: 800, pausa: 200, colores: COLORES_BASE, flotar: true }, opciones || {});
    const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    contenedor.appendChild(renderer.domElement);
    const escena = new THREE.Scene();
    const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 50); camara.position.set(0, 0, 10.5);
    escena.add(new THREE.AmbientLight(0xffffff, 0.55));
    const luz = new THREE.DirectionalLight(0xffffff, 0.85); luz.position.set(4, 6, 8); escena.add(luz);
    const luz2 = new THREE.DirectionalLight(0x9cc9c1, 0.4); luz2.position.set(-6, -3, 2); escena.add(luz2);

    const geoCuerpo = new THREE.BoxGeometry(0.97, 0.97, 0.97);
    const matCuerpo = new THREE.MeshStandardMaterial({ color: 0x111014, roughness: 0.55 });
    const geoPeg = pegatinaGeo(0.82, 0.12);
    const mats = {}; for (const k in o.colores) mats[k] = new THREE.MeshStandardMaterial({ color: o.colores[k], roughness: 0.32 });
    const caras = [['x', 1, [0, Math.PI / 2, 0], 'R'], ['x', -1, [0, -Math.PI / 2, 0], 'L'], ['y', 1, [-Math.PI / 2, 0, 0], 'U'],
      ['y', -1, [Math.PI / 2, 0, 0], 'D'], ['z', 1, [0, 0, 0], 'F'], ['z', -1, [0, Math.PI, 0], 'B']];
    const cubo = new THREE.Group(); escena.add(cubo);
    const piezas = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const pieza = new THREE.Group(); pieza.position.set(x, y, z);
      pieza.add(new THREE.Mesh(geoCuerpo, matCuerpo));
      const p = { x, y, z };
      for (const [eje, signo, rot, col] of caras) {
        if (p[eje] !== signo) continue;
        const peg = new THREE.Mesh(geoPeg, mats[col]); peg.rotation.set(rot[0], rot[1], rot[2]); peg.position[eje] = signo * 0.487; pieza.add(peg);
      }
      cubo.add(pieza); piezas.push(pieza);
    }
    cubo.rotation.set(0.5, -0.65, 0);

    function ajustar() { const r = contenedor.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); camara.aspect = r.width / r.height; camara.updateProjectionMatrix(); }
    new ResizeObserver(ajustar).observe(contenedor); ajustar();

    let cola = 0, girando = false, ultimo = null;
    const suave = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    function giroAlAzar() {
      let eje, capa, dir;
      do { eje = 'xyz'[Math.floor(Math.random() * 3)]; capa = Math.floor(Math.random() * 3) - 1; dir = Math.random() < 0.5 ? 1 : -1; }
      while (ultimo && ultimo.eje === eje && ultimo.capa === capa && ultimo.dir === -dir);
      return (ultimo = { eje, capa, dir });
    }
    function girar() {
      if (girando || cola === 0) return;
      cola--; girando = true;
      const { eje, capa, dir } = giroAlAzar();
      const pivote = new THREE.Object3D(); cubo.add(pivote);
      for (const p of piezas) if (Math.round(p.position[eje]) === capa) pivote.attach(p);
      const inicio = performance.now(), dur = reducir ? 1 : o.duracion;
      (function paso(ahora) {
        const t = Math.min(1, (ahora - inicio) / dur);
        pivote.rotation[eje] = dir * suave(t) * Math.PI / 2;
        if (t < 1) return requestAnimationFrame(paso);
        pivote.updateMatrixWorld();
        for (const p of [...pivote.children]) {
          cubo.attach(p); p.position.round(); p.updateMatrix();
          const e = p.matrix.elements; for (const i of [0, 1, 2, 4, 5, 6, 8, 9, 10]) e[i] = Math.round(e[i]);
          p.quaternion.setFromRotationMatrix(p.matrix);
        }
        cubo.remove(pivote);
        setTimeout(() => { girando = false; girar(); }, o.pausa);
      })(inicio);
    }

    const t0 = performance.now();
    (function animar(ahora) {
      const t = (ahora - t0) / 1000;
      if (o.flotar && !reducir) { cubo.position.y = Math.sin(t * 1.4) * 0.18; cubo.rotation.y = -0.65 + Math.sin(t * 0.5) * 0.35; cubo.rotation.x = 0.5 + Math.sin(t * 0.7) * 0.08; }
      renderer.render(escena, camara); requestAnimationFrame(animar);
    })(t0);

    return { girar() { cola++; girar(); }, escena, camara, cubo, renderer };
  }

  window.Cubo = { crear };

  // Cubo flotante en la esquina de todas las paginas (se quita con data-cubo="no" en <body>)
  if (document.body.dataset.cubo !== 'no') {
    const boton = document.createElement('button');
    boton.type = 'button'; boton.id = 'cubo'; boton.setAttribute('aria-label', 'Cubo Rubik: girar una capa al azar / Rubik cube: turn a random layer');
    document.body.appendChild(boton);
    const c = crear(boton);
    boton.addEventListener('click', () => c.girar());
  }
})();
