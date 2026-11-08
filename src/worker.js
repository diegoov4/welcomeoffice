// Worker de WelcomeOffice:
//  - /media/*  -> archivos del bucket R2 "welcomeoffice-media" (fotos de proyectos, fichas, certificados)
//  - resto     -> web estática de la carpeta public/
// Mientras la web esté en pruebas en diemo.dev, se pide a los buscadores que no la indexen
// (para no competir con la web en producción). Para permitir la indexación, pon INDEXAR = true.
const INDEXAR = false;

function sinIndexar(response) {
  if (INDEXAR) return response;
  const r = new Response(response.body, response);
  r.headers.set("X-Robots-Tag", "noindex, nofollow");
  return r;
}

export default {
  async fetch(request, env) {
    return sinIndexar(await atender(request, env));
  },
};

async function atender(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/media/")) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Método no permitido", { status: 405 });
      }
      const key = decodeURIComponent(url.pathname.slice("/media/".length));
      if (!key || key.includes("..")) return new Response("No encontrado", { status: 404 });

      const obj = await env.MEDIA.get(key, { onlyIf: request.headers, range: request.headers });
      if (!obj) return new Response("No encontrado", { status: 404 });

      const headers = new Headers();
      obj.writeHttpMetadata(headers);
      headers.set("etag", obj.httpEtag);
      headers.set("cache-control", "public, max-age=86400");
      headers.set("x-content-type-options", "nosniff");

      if (!("body" in obj) || !obj.body) return new Response(null, { status: 304, headers });
      return new Response(request.method === "HEAD" ? null : obj.body, {
        status: obj.range ? 206 : 200,
        headers,
      });
    }

    return env.ASSETS.fetch(request);
}
