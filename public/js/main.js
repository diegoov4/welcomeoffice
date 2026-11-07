// Configuración: pon aquí el email que recibirá las solicitudes de presupuesto.
const CONFIG = { emailContacto: "" };

const SECTORES = {
  "oficinas": "Oficinas",
  "espacios-publicos": "Espacios públicos",
  "hospitales": "Hospitales",
  "formacion": "Formación",
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Menú móvil
const toggle = $(".nav-toggle");
const nav = $("#nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
$$("#nav a").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

$("#anio").textContent = new Date().getFullYear();

// Proyectos
let proyectos = [];
const lista = $("#lista-proyectos");

function pintar(filtro = "todos") {
  const visibles = proyectos.filter((p) => filtro === "todos" || p.sector === filtro);
  if (!visibles.length) {
    lista.innerHTML = `<p class="empty">Pronto publicaremos proyectos de este sector.</p>`;
    return;
  }
  lista.innerHTML = visibles.map((p) => {
    const portada = p.imagenes?.[0];
    return `
      <button class="project" data-id="${esc(p.id)}" aria-label="Ver proyecto ${esc(p.titulo)}">
        ${p.ejemplo ? `<span class="badge badge-ejemplo">Ejemplo</span>` : `<span class="badge">${esc(SECTORES[p.sector] || p.sector)}</span>`}
        ${p.imagenes?.length > 1 ? `<span class="photo-count">${p.imagenes.length} fotos</span>` : ""}
        ${portada ? `<img src="${esc(portada.src)}" alt="${esc(portada.alt || p.titulo)}" loading="lazy" width="1200" height="800">` : ""}
        <div class="project-body">
          <h3>${esc(p.titulo)}</h3>
          <p class="meta">${[p.ubicacion, p.anio].filter(Boolean).map(esc).join(" · ")}</p>
          <ul class="tags">${(p.servicios || []).slice(0, 3).map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
        </div>
      </button>`;
  }).join("");
}

$$(".filter").forEach((b) => b.addEventListener("click", () => {
  $$(".filter").forEach((x) => x.classList.toggle("is-active", x === b));
  pintar(b.dataset.filter);
}));

lista.addEventListener("click", (e) => {
  const card = e.target.closest(".project");
  if (card) abrirVisor(card.dataset.id);
});

fetch("/data/proyectos.json", { cache: "no-cache" })
  .then((r) => r.json())
  .then((d) => { proyectos = d.proyectos || []; pintar(); })
  .catch(() => { lista.innerHTML = `<p class="empty">No se han podido cargar los proyectos.</p>`; });

// Visor
const visor = $("#visor");
let actual = null;
let idx = 0;

function abrirVisor(id) {
  actual = proyectos.find((p) => p.id === id);
  if (!actual) return;
  idx = 0;
  $("#visor-titulo").textContent = actual.titulo + (actual.ejemplo ? " (ejemplo)" : "");
  $("#visor-meta").textContent = [actual.cliente, actual.ubicacion, actual.anio, SECTORES[actual.sector]].filter(Boolean).join(" · ");
  $("#visor-desc").textContent = actual.descripcion || "";
  $("#visor-servicios").innerHTML = (actual.servicios || []).map((s) => `<li>${esc(s)}</li>`).join("");
  $("#visor-thumbs").innerHTML = (actual.imagenes || []).map((im, i) =>
    `<button data-i="${i}" aria-label="Foto ${i + 1}"><img src="${esc(im.src)}" alt="" loading="lazy"></button>`).join("");
  mostrar(0);
  visor.showModal();
}

function mostrar(i) {
  const imgs = actual.imagenes || [];
  if (!imgs.length) return;
  idx = (i + imgs.length) % imgs.length;
  const img = $("#visor-img");
  img.src = imgs[idx].src;
  img.alt = imgs[idx].alt || actual.titulo;
  $$("#visor-thumbs button").forEach((b, j) => b.classList.toggle("is-active", j === idx));
  $$(".viewer-nav").forEach((b) => (b.hidden = imgs.length < 2));
}

$(".viewer-close").addEventListener("click", () => visor.close());
$(".viewer-nav.prev").addEventListener("click", () => mostrar(idx - 1));
$(".viewer-nav.next").addEventListener("click", () => mostrar(idx + 1));
$("#visor-thumbs").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b) mostrar(+b.dataset.i);
});
visor.addEventListener("click", (e) => { if (e.target === visor) visor.close(); });
visor.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") mostrar(idx - 1);
  if (e.key === "ArrowRight") mostrar(idx + 1);
});

// Formulario de contacto (abre el correo del usuario mientras no haya backend)
$("#form-contacto").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const msg = $("#form-msg");
  if (!CONFIG.emailContacto) {
    msg.textContent = "Gracias. El formulario estará operativo muy pronto.";
    return;
  }
  const cuerpo = `Nombre: ${f.get("nombre")}\nEmpresa: ${f.get("empresa")}\nEmail: ${f.get("email")}\nTipo de espacio: ${f.get("tipo")}\n\n${f.get("mensaje")}`;
  location.href = `mailto:${CONFIG.emailContacto}?subject=${encodeURIComponent("Solicitud de presupuesto - " + f.get("tipo"))}&body=${encodeURIComponent(cuerpo)}`;
  msg.textContent = "Abriendo tu programa de correo…";
});
