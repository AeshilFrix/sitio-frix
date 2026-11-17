# Dónde quedó el trabajo (17/11/2026)

## Hecho y publicado
- Se quitaron: cursor propio, menú de cartas, brújula, página de Reglas, pañuelos, tema verde.
- Se quedan: flechas ← → para cambiar de página con fundido, lluvia de palos en los costados, botón 88×31, aviso de mantenimiento de 4:00 a 4:59 en la entrada.
- Plan con los 23 juegos de Usogui, fotos y bocetos: https://claude.ai/artifact/Fzj1jVfVSGSvE3BHqVKC1c
- PRODUCT.md (contexto de producto para la skill impeccable).

## Decisión de Frix
- Quiere todo el sitio en un entorno 3D que se pueda mover, con salas donde cada una es un juego, y una animación de transición al cambiar de sala.
- Eligió la dirección **"Manga en tinta"**: el 3D dibujado como página de manga (sombreado plano, contorno de tinta, sombras de trama, papel blanco y negro, un color de imprenta por sala).
- La transición NO debe ser solo líneas de velocidad: tiene que verse el recorrido de una sala a la otra (la cámara viaja de un lado al otro).
- Tirada de impeccable: degradada (sin conexión a impeccable.style). Referencia de semilla: seed:af9713ceb703f119.

## Prototipo 3D (17/11/2026)
- Hecho como artifact privado, sin tocar el sitio en vivo: https://claude.ai/artifact/3xxf5As3aQEVoQ3iBFHupK
- Código: `prototipo-3d/index.html` (fuera de `public/`, así que no se despliega). Se genera desde una plantilla con los datos de `datos.js` metidos dentro como copia fija.
- Contrato de dirección: `.impeccable/surfaces/prototipo-3d-index-html.md`.
- Cinco salas en cruz alrededor de la Ruleta (Inicio): Siete cartas (Blog), Librería (Escritos), Batalla naval (Obras), Paneles (Galería). La cámara viaja por las puertas y rodea la mesa central.
- Detector de impeccable: sin hallazgos.

### Versión 2 (pedidos de Frix, 17/11/2026)
- Sin cartel arriba (ni nombre de la sala ni capítulos de Usogui).
- Blog: imágenes en la viñeta con formato de tablón (Archivo:, miniatura a la izquierda, clic para agrandar). En el artifact no cargan las de tenor/Google (el artifact bloquea imágenes de otros sitios); en el sitio real sí.
- Viñeta ampliable: doble clic, botón arriba a la derecha o Esc. Deja ver el 3D a los lados.
- Modo oscuro: botón de luna en la tira; las salas pasan a tinta en negativo.
- Galería: rondas de 6 paneles A–F que se dan vuelta; botones de ronda; en la viñeta ampliada se ven todas. Ejemplo con 24 imágenes dibujadas.
- Obras: cada obra es un disparo (hundida = completada, tocada = en curso/pausa, agua = abandonada, apuntada = planeada). Flota al fondo de la mesa: un barco por tipo, una pieza por obra hasta 5. Ejemplo con 34 obras.
- Cubo escondido en la Librería (estante del fondo, tabla de abajo): abre el Diario y desbloquea el formato cubo (el sitio como cubo de Rubik, una cara por sección; el Diario es la sexta cara). Se recuerda en localStorage.
- Ideas para después: sala propia de Usogui como otro easter egg.

### Versión 3 (17/11/2026, de madrugada)
- Ruleta: solo es un juego. Casillas reales de ruleta americana; la bola cae en una y el número queda en la viñeta (con las últimas 10 tiradas). Ya no te lleva a otra sala. Frix quiere profundizar después.
- Ya no hay botón de Diario ni de formato cubo en la tira.
- Cubo de pantallas (como el cubo con pantallas de Usogui): cada pieza es una pantalla. Con el cubo armado, cada cara es una sección y sus 9 pantallas son el menú (Inicio: sobre mí, hora en 7 segmentos, frase, jugadas, ruleta, bitácora, enlaces, modo oscuro; Blog: entradas, al azar, contador; Escritos: obras y capítulos; Obras: contadores, minitablero, última, por tipo, mejor nota; Galería: miniaturas).
- La sexta cara (abajo) no tiene señal. 5 clics seguidos a la pantalla del centro muestran el Diario (solo por esa visita).
- Flujo: Librería → clic al cubo (la cámara se acerca y el cubo se levanta; se puede girar y mover filas) → Agarrar → inventario (bolsa en la tira) → Ruleta → clic a un taburete para sentarse → Dejar el cubo → doble clic al cubo → se arma solo y la cámara entra a una cara; la mesa asoma alrededor → clic en la mesa (o Esc) para salir.
- Se recuerda dónde quedó el cubo (estante, mano o mesa) en localStorage.
- Pendiente: sala propia de Usogui (otro easter egg); profundizar el juego de la ruleta; otras pantallas posibles para el cubo (visitas, música, Discord).

### Versión 4 (17/11/2026)
- El cubo se ve como un cubo de Rubik normal (solo colores) en el estante, en la mano y sobre la mesa. Las pantallas se encienden solo al abrir el menú y se apagan al salir.
- En el menú el cubo flota sobre la mesa para no atravesarla al girar.
- Zoom real: la cámara queda muy cerca y se ven 4 pantallas grandes (una ventana de 2x2 de la cara); las demás quedan cortadas y en la esquina asoma la mesa. Flechas o arrastrar para moverse; al pasar el borde se dobla a la cara vecina. Clic en la mesa o Esc para salir.

### Versión 5 (17/11/2026)
- Los dos focos sobre la ruleta prenden y apagan el modo oscuro (el botón de la luna sigue en la tira).
- Rincón de la Ruleta (pared del fondo, junto a la puerta de Escritos): reloj clásico de 12 horas con 3 agujas y la hora en números debajo; calendario de pared con la bitácora por día (clic en un día muestra sus cambios; flechas para cambiar de mes). Cada uno se mira de cerca por separado.
- Inspiración de Persona 5: títulos de sección como recortes (letras sueltas, tipos y giros mezclados), sala actual inclinada con mancha de tinta dentada, botones de acción en paralelogramo, fila elegida con barra de tinta inclinada, entrada del contenido con barrido en diagonal.
- Frix dijo que ya lo subiría; falta su visto bueno final para integrarlo al sitio en vivo.

### Versión 6 (17/11/2026) — publicada en el sitio
- Librería: el atril se cambió por una pantalla con las historias publicadas. Al elegir una, la cámara mira al estante (fondo, derecha, a la altura de los ojos), el libro sale flotando por encima de la pantalla y se posa en la mesa de lectura. Clic al libro: se abre con índice (capítulos, palabras, minutos) y cada capítulo se lee paginado, con hojas que se dan vuelta (← → o los números de página).
- En la Librería la viñeta lateral se esconde (la pantalla es el menú); queda una pestaña "Escritos en texto" para abrirla.
- El cubo se puede devolver a su hueco del estante (clic en el hueco o desde el inventario).
- Sitio real: `public/casa.html` (se genera desde la misma plantilla y lee `datos.js` en vivo). La portada falsa ahora lleva a casa.html; las páginas viejas siguen como versión clásica (enlace en el Inicio 3D y "Salas en 3D" en el menú del avatar).
- Plantilla y script de armado: scratchpad (`tres/plantilla.html`, `construir.py`). Si se pierde el scratchpad, `prototipo-3d/index.html` es la plantilla con los datos ya metidos.

### Versión 7 (17/11/2026) — publicada
- Salón principal más grande (28 × 24, `HX`/`HZ` en la plantilla) como sala de casino: ruleta, tablero de "Últimas jugadas" en la pared oeste, 3 máquinas (la del medio es la de logros; las otras dicen "pronto"), mesa de dados Chinchirorin (pronto), caja (presta ¥10.000 si te quedas sin nada), reloj y calendario. La viga de las lámparas ya no atraviesa el techo.
- Dinero y apuestas: se empieza con ¥10.000 (localStorage del visitante). Clic en la mesa de la ruleta → vista de arriba, fichas de 100/1K/10K/100K, pleno (35:1), docenas y columnas (2:1), rojo/negro, par/impar, 1–18/19–36 (1:1). Ruleta americana (0 y 00).
- Logros (12, 3 secretos): primera apuesta, pleno, todo al cero, racha de 3, ¥20.000, millonario (¥1.000.000), quiebra, préstamo, cubo, cara sin señal, focos (a oscuras), lector. Máquina de logros: palanca cambia a "Datos" (estadísticas).
- Inicio: sin viñeta lateral. Blog: la viñeta solo se abre con las cartas (grande); doble clic en una entrada → vista completa con datos; X o botón de achicar para cerrar/reducir.
- "Frix" en la tira abre un menú: Mis logros, Apostar, Versión clásica.
- Panel → pestaña Pruebas: crea un enlace firmado (ECDSA, llave privada solo en la PC de Frix; la pública va en `datos.ajustes.llavePruebas`) que cambia el dinero en su navegador. Hay que publicar una vez para que el sitio conozca la llave. El dinero puesto desde el panel no da logros.

### Versión 8 (17/11/2026) — publicada
- La viga de las lámparas va solo entre sus dos columnas. Logros en filas horizontales tipo Steam (5 por página, barras de progreso). Tragamonedas jugables (3 rodillos, una línea; RTP cerca de 90 %).

### Versión 9 (17/11/2026) — casino grande con mapa
- Planta inspirada en planos reales (Bellagio, Palms, Venetian): piso octogonal de 64 × 56 con pasillos en grilla y diagonales. Entrada de vidrio al sur (0, 30); salas por puertas en los muros: Blog al oeste, Escritos al norte, Obras al este, Galería al sur (pasillo corto de 4).
- Lugares del casino (`LUGARES` en la plantilla): Entrada, Club de jugadores (tarjeta de socio con el Sobre mí), Bar con rocola (pronto), Sala VIP (cerrada), Ruleta (centro), Chinchirorin, Blackjack, Keno (reloj y calendario), Apuestas (pantallas: Últimas jugadas y Lo que estoy viendo), Tragamonedas y logros (2 islas, 23 máquinas + la de logros), Caja, Pozo (palabras escritas, pared este).
- Mapa chico arriba a la izquierda: clic en un lugar → caminas por los pasillos (grafo `NODOS`/`ARISTAS`, Dijkstra). Botón de agrandar o tecla M → plano completo; clic o Enter en un lugar → caes desde arriba ("ドン"). Flechas ← → recorren los lugares. Ya no están los botones de salas abajo (siguen sin 3D).
- Blackjack: zapato de 6 mazos, pedir / plantarse / doblar, blackjack paga 3 a 2, la banca se planta en 17. Chinchirorin: la banca tira hasta 3 veces; pinzoro ×5, arashi ×3, shigoro ×2, hifumi paga doble, punto contra punto. Logros nuevos: Natural, Shigoro, Pinzoro (17 en total).
- Frix pidió no llenar más por ahora: hay espacio libre en el piso para lo que venga.
- Script de armado: `empalmar-v9.py` arma la v9 desde `plantilla-v8.html` + bloques (`bloque-planta.js`, `bloque-lugares.js`, `bloque-viaje.js`, `bloque-juegos.js`); copia final en `tres/plantilla-v9.html`.

## Ideas anotadas para después (Frix)
- Libro de recuerdos (álbum de fotos) con los logos y enlaces de sus redes; falta decidir dónde va.
- Galería: cambiar el sistema de paneles por libros (no en la librería) y usar la sala para juegos no-casino, p. ej. apuestas en carreras de caballos.
- Inventario: objetos repartidos por el mapa que desbloquean o hacen cosas.
- Sala propia de Usogui (easter egg), juego de la ruleta más profundo, versión en inglés del 3D, música en el 3D (la rocola del bar ya está puesta para eso), Discord/Lanyard, GIFs de MAL.

## Skills usadas (reinstalar en una sesión nueva)
- npx skills@latest add emilkowalski/skills -g -a claude-code -s '*' -y --copy
- npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend" -g -a claude-code -y --copy
- impeccable: el zip que Frix adjuntó (impeccable-main.zip); copiar .claude/skills/impeccable a ~/.claude/skills/
