# Dónde quedó el trabajo (16/11/2026, 21:25)

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

## Siguiente paso
1. Escribir el contrato de dirección (impeccable new-work, paso 5) y leer reference/craft-floor.md.
2. Prototipo 3D aparte (sin tocar el sitio en vivo), como artifact privado:
   - three.js 0.160 (import map desde cdn.jsdelivr.net), sombreado toon + contorno + trama.
   - Salas: Ruleta (Inicio), Siete cartas (Blog), Librería (Escritos), Batalla naval (Obras), Juego maquiavélico (Galería, puede quedar como "próximamente").
   - Las salas conectadas en un mismo espacio para que la cámara recorra el camino entre ellas.
   - Arrastrar para mirar; panel con el contenido real de datos.js.
3. Mostrarle capturas y el enlace, y que elija antes de publicar.

## Skills usadas (reinstalar en una sesión nueva)
- npx skills@latest add emilkowalski/skills -g -a claude-code -s '*' -y --copy
- npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend" -g -a claude-code -y --copy
- impeccable: el zip que Frix adjuntó (impeccable-main.zip); copiar .claude/skills/impeccable a ~/.claude/skills/
