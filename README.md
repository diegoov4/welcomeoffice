# WelcomeOffice — web

Web de WelcomeOffice: equipamiento integral para oficinas, espacios públicos y
hospitales (obra seca, suelos, techos, mamparas y mobiliario interior).
Publicada en **https://welcomeoffice.diemo.com** con un Cloudflare Worker.

## Estructura

| Ruta | Qué es |
|---|---|
| `public/` | La web estática (HTML, CSS, JS, logo, imágenes de ejemplo). |
| `public/data/proyectos.json` | Lista de proyectos que se muestran en la galería. |
| `public/img/logo/` | Logo, icono y favicons (ver su README). |
| `public/img/dummy/` | Imágenes de ejemplo; se irán sustituyendo por fotos reales. |
| `src/worker.js` | Sirve la web y, en `/media/...`, los archivos del bucket R2. |
| `wrangler.jsonc` | Configuración de Cloudflare (dominio, bucket R2). |

## Fotos de proyectos (Cloudflare R2)

Las fotos reales se guardan en el bucket **`welcomeoffice-media`**:

```
proyectos/<id-proyecto>/01.jpg, 02.jpg...   fotos de obras realizadas
productos/<familia>/<producto>/             fotos de producto
fichas-tecnicas/                            PDF técnicos
sostenibilidad/                             certificados y declaraciones ambientales
```

y la web las sirve en `https://welcomeoffice.diemo.com/media/<ruta>`.

Para añadir un proyecto:

```bash
node scripts/subir-proyecto.mjs ./fotos/hospital-x hospital-x "Hospital X" hospitales
# completar cliente, ubicación, servicios y descripción en public/data/proyectos.json
npm run deploy
```

Recomendado: fotos horizontales, en JPG o WebP, de unos 2000 px de ancho y menos de 1 MB.

## Desarrollo y despliegue

```bash
npm install
npm run dev      # http://localhost:8787
npm run deploy   # publica en welcomeoffice.diemo.com
```

`diemo.com` tiene que estar gestionado en la misma cuenta de Cloudflare para que
el dominio personalizado se cree automáticamente.
