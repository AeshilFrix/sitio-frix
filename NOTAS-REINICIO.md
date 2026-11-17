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

## Siguiente paso
1. Que Frix lo recorra y diga qué cambiar.
2. Si lo aprueba: integrarlo al sitio (decidir si reemplaza las páginas o las envuelve), que lea `datos.js` en vivo, versión en inglés, versión simple para teléfono, y escribir DESIGN.md con los tokens finales.

## Skills usadas (reinstalar en una sesión nueva)
- npx skills@latest add emilkowalski/skills -g -a claude-code -s '*' -y --copy
- npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend" -g -a claude-code -y --copy
- impeccable: el zip que Frix adjuntó (impeccable-main.zip); copiar .claude/skills/impeccable a ~/.claude/skills/
