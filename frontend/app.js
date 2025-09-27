// ==== CONFIG ====
const API_BASE = 'https://oficioscerca.onrender.com'; 

// ==== HELPERS UI ====
const $ = (sel) => document.querySelector(sel);
const listEl = $("#list");
const emptyEl = $("#empty");
const qEl = $("#q");
const catEl = $("#cat");
const cityEl = $("#city");
const postForm = $("#postForm");
const clearBtn = $("#clear");

// Opcionales (si existen en tu HTML; se ocultan porque el backend maneja datos reales)
const seedBtn = $("#seed");
const resetBtn = $("#reset");
if (seedBtn) seedBtn.style.display = "none";
if (resetBtn) resetBtn.style.display = "none";

// ==== HELPERS DE DATOS/FORMATO ====
function initials(name) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

function normalize(str) {
  return (str || "").toString().toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function telHref(phone) {
  const digits = (phone || "").replace(/\D+/g, "");
  return "tel:+" + digits;
}
function waHref(phone, text) {
  const digits = (phone || "").replace(/\D+/g, "");
  const msg = encodeURIComponent(text || "Hola, vi tu contacto en OficiosCerca y me gustaría consultarte.");
  return `https://wa.me/${digits}?text=${msg}`;
}
function emailHref(email) {
  const subject = encodeURIComponent("Consulta desde OficiosCerca");
  const body = encodeURIComponent("Hola, te contacto porque vi tu perfil en OficiosCerca...");
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

// ==== API ====
async function loadDataFromApi({ q = "", category = "", city = "" } = {}) {
  const url = new URL(API_BASE + "/api/pros");
  if (q) url.searchParams.set("q", q);
  if (category) url.searchParams.set("category", category);
  if (city) url.searchParams.set("city", city);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Error al obtener profesionales");
  return res.json(); // [{ id, name, category, city, phone, email?, bio?, tags:[] , rating, status }]
}

async function createProfessionalApi(payload) {
  const res = await fetch(API_BASE + "/api/pros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    let errMsg = "Error al publicar";
    try {
      const body = await res.json();
      if (body?.error) errMsg = body.error;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }
  return res.json(); // { id, status: "pending" }
}

// ==== RENDER ====
function renderList(data) {
  listEl.innerHTML = "";
  emptyEl.style.display = data.length ? "none" : "block";

  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    const tags = Array.isArray(p.tags) ? p.tags : [];
    const ratingStr = (typeof p.rating === "number" ? p.rating.toFixed(1) : "—");

    card.innerHTML = `
      <div class="avatar" aria-hidden="true">${initials(p.name)}</div>
      <div>
        <div class="c-title">${p.name} · <span class="rating">★ ${ratingStr}</span></div>
        <div class="c-sub">${p.category} · ${p.city}</div>
        <div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
        <div class="c-sub" style="margin-top:6px;">${p.bio || ""}</div>
      </div>
      <div class="actions">
        <a class="iconbtn" href="${waHref(p.phone)}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="iconbtn" href="${telHref(p.phone)}">Llamar</a>
        ${p.email ? `<a class="iconbtn" href="${emailHref(p.email)}">Email</a>` : ""}
      </div>
    `;
    listEl.appendChild(card);
  });
}

let renderTimer = null;
async function renderFromApi() {
  // Evita múltiples requests seguidos mientras el usuario escribe
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(async () => {
    try {
      const q = qEl?.value || "";
      const category = catEl?.value || "";
      const city = cityEl?.value || "";
      const data = await loadDataFromApi({ q, category, city });
      renderList(data);
    } catch (err) {
      console.error(err);
      listEl.innerHTML = "";
      emptyEl.style.display = "block";
      emptyEl.textContent = "No se pudo cargar el listado. Reintentá en unos segundos.";
    }
  }, 150);
}

// ==== EVENTOS ====
if (qEl) qEl.addEventListener("input", renderFromApi);
if (catEl) catEl.addEventListener("change", renderFromApi);
if (cityEl) cityEl.addEventListener("input", renderFromApi);

if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(postForm);
    const payload = {
      name: form.get("name")?.toString().trim(),
      category: form.get("category")?.toString(),
      city: form.get("city")?.toString().trim(),
      phone: form.get("phone")?.toString().trim(),
      email: (form.get("email") || "").toString().trim(),
      tags: (form.get("tags") || "").toString().split(",").map(t => t.trim()).filter(Boolean),
      bio: (form.get("bio") || "").toString().trim()
    };

    if (!payload.name || !payload.category || !payload.city || !payload.phone) {
      alert("Completá los obligatorios."); return;
    }

    try {
      await createProfessionalApi(payload); // queda "pending"
      postForm.reset();
      alert("¡Enviado! Queda pendiente de aprobación y aparecerá cuando se apruebe.");
      await renderFromApi();
    } catch (err) {
      console.error(err);
      alert(err.message || "Hubo un problema al publicar.");
    }
  });
}

if (clearBtn) clearBtn.addEventListener("click", () => postForm?.reset());

// Footer año
const yearEl = document.querySelector("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Primera carga
renderFromApi();
