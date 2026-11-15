# Sitio de Frix

Mi sitio personal en Neocities: [aeshilfrix.neocities.org](https://aeshilfrix.neocities.org/).
Blog, diario, escritos (con capítulos desde Tintero), obras que veo y leo, y galería.

## Cómo se publica

Nada se sube a mano. Todo pasa por este repositorio:

| Rama | Qué hay | Dónde se ve |
|------|---------|-------------|
| `main` | Lo publicado | [aeshilfrix.neocities.org](https://aeshilfrix.neocities.org/), se actualiza solo en ~1 minuto |
| `diseno` | Cambios de diseño en prueba | [Vista previa](https://aeshilfrix.github.io/sitio-frix/), con una etiqueta roja abajo |

- **Escribir** (blog, diario, capítulos, obras…): con el panel. Al pulsar *Publicar ahora*, el panel guarda `public/datos.js` en `main` y GitHub lo sube a Neocities.
- **Diseño**: los cambios se prueban en `diseno`. Cuando la vista previa está bien, se pasan a `main` y se publican.

## Carpetas

```
public/     Lo que se publica: páginas, estilos, sitio.js, cubo.js, datos.js y galeria/
panel/      El panel para escribir. Se usa desde tu PC; no se publica
.github/    Las tareas que publican solas (Neocities y la vista previa)
```

## El panel

Abre `panel/panel.html` con doble clic (en Chrome). Escribe en la pestaña que quieras; todo se guarda
en el navegador hasta que publiques.

**Conectarlo una vez:** en la pestaña *Publicar*, sigue el enlace para crear una clave de GitHub
(permiso *Contents: Read and write*, solo para este repositorio) y pégala. Se guarda solo en ese
navegador. Desde ahí, publicar es un clic, y el panel carga lo último publicado cada vez que lo abres.

### Escritos con capítulos (Tintero)

1. En *Escritos* crea el escrito. Sus *Notas* salen debajo del título en el sitio.
2. Al guardarlo aparece la caja *Capítulos*: “Subir capítulos desde Tintero” y eliges uno o varios
   `.tintero`. Cada pestaña del archivo es un capítulo (también sirven `.rtf` y `.txt`).
3. En la lista puedes renombrar, cambiar la fecha, ordenar, ver, borrar o reemplazar el texto.

Se conservan cursivas, negritas, subrayado, rayas de diálogo y párrafos.

### Traducción al inglés

El blog, el diario, la galería y el perfil se traducen solos al inglés al guardar. Si corriges el
inglés a mano, se respeta. Los escritos **no** se traducen: la versión en inglés es otro escrito con
idioma *English* (sale con la etiqueta **#English**), y se pueden enlazar entre sí.

Traductor: el de Chrome si el navegador lo tiene; si no, [MyMemory](https://mymemory.translated.net/)
(gratis: 5.000 letras al día, o 50.000 con un correo).

### Obras (buscador)

Anime y manga (AniList), series (TVMaze), libros y cómics (Open Library), películas, juegos y otros
(Wikidata). Solo funciona en el panel desde tu PC: Neocities gratis bloquea esas búsquedas en el sitio.

### Imágenes y música

- **Galería:** pon la imagen en `public/galeria/` (en GitHub: *Add file → Upload files*) y en el panel
  escribe su ruta, por ejemplo `galeria/mi-foto.png`.
- **Música:** Neocities gratis no acepta mp3. Usa enlaces directos a audio alojado en otro sitio.

## Formato del texto

- Una línea que empieza con `>` sale en verde.
- Una línea en blanco empieza un párrafo nuevo.
- Los enlaces `https://…` se vuelven clicables.
