# Sitio de Frix

Mi sitio personal: [aeshilfrix.github.io/sitio-frix](https://aeshilfrix.github.io/sitio-frix/).
Blog, diario, escritos (con capítulos desde Tintero), obras que veo y leo, y galería.

## Cómo se publica

Nada se sube a mano. Todo lo que llega a la rama `main` se publica solo, en un minuto, en:

- [aeshilfrix.neocities.org](https://aeshilfrix.neocities.org/)
- [aeshilfrix.github.io/sitio-frix](https://aeshilfrix.github.io/sitio-frix/)

Para escribir (blog, diario, capítulos, obras…) se usa el panel: *Publicar ahora* guarda
`public/datos.js` en `main`. Los cambios de diseño también van directo a `main`; la pantalla de
acceso evita que alguien vea el sitio a medio hacer.

## Entrada

`index.html` es una pantalla de acceso; la portada del sitio es `inicio.html`. Si alguien abre
cualquier otra página sin pasar por la entrada, vuelve a ella. Las páginas no aparecen en buscadores.

## Carpetas

```
public/     Lo que se publica: páginas, estilos, sitio.js, cubo.js, datos.js, galeria/ y musica/
panel/      El panel para escribir. Se usa desde tu PC; no se publica
.github/    Las tareas que publican solas el sitio (Neocities y GitHub Pages)
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

### Inicio: paneles vivos

- **Ahora mismo**: lo que suena en Liner (vía Discord y [Lanyard](https://github.com/Phineas/Lanyard)), lo que estás
  viendo o leyendo (las obras marcadas *En curso*) y el último capítulo. El ID de Discord va en *Perfil*; para que
  funcione hay que estar en el servidor de Discord de Lanyard.
- **Frase del día**: una distinta cada día, de las que pongas en *Perfil → Frases del día*.
- **Bitácora de la mesa**: lo que cambia en el sitio; se escribe en la pestaña *Bitácora*.
- **Fichas**: contador de visitas (una por visita) con [Abacus](https://abacus.jasoncameron.dev/).

### Moverse por el sitio

- Las flechas ← → del teclado pasan a la página anterior o siguiente (Inicio, Blog, Escritos, Obras, Galería).
  No lo hacen en el lector, porque ahí cambian de capítulo, ni con el visor de la galería abierto.
- En Chrome y Edge el cambio de página es suave (un fundido corto). Se apaga si el sistema pide menos movimiento.
- Palos y fichas caen despacio en los costados vacíos de la pantalla (nunca detrás del texto).
- La pantalla de acceso dice "mantenimiento" de 4:00 a 4:59 (hora de quien visita); la esquina sigue funcionando.

### Obras (buscador)

Anime y manga (AniList), series (TVMaze), libros y cómics (Open Library), películas, juegos y otros
(Wikidata).

### Imágenes y música

Donde el panel pide una imagen o una canción, pulsa **Subir desde tu PC**: se sube a `public/galeria/`
o `public/musica/` y la ruta se llena sola. También puedes pegar un enlace directo
(`https://i.imgur.com/….png`, `https://….mp3`). Hasta 25 MB por archivo.

## Formato del texto

- Una línea que empieza con `>` sale en verde.
- Una línea en blanco empieza un párrafo nuevo.
- Los enlaces `https://…` se vuelven clicables.
- Color: `# aviso importante #FF0000` pinta ese texto de rojo (cualquier color en hexadecimal).
  En el panel puedes seleccionar el texto y pulsar *Pintar lo seleccionado*.
