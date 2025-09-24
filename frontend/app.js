const $ = sel => document.querySelector(sel);
const listEl = document.querySelector('#list');
const emptyEl = document.querySelector('#empty');
const qEl = document.querySelector('#q');
const catEl = document.querySelector('#cat');
const cityEl = document.querySelector('#city');
const postForm = document.querySelector('#postForm');
const clearBtn = document.querySelector('#clear');
const seedBtn = document.querySelector('#seed');
const resetBtn = document.querySelector('#reset');

// Datos de ejemplo (se muestran si no hay nada guardado)
const demo = [
  { id: 1, name: 'Ana López', category:'Electricidad', city:'Córdoba',
    phone:'+54 9 351 555-1111', email:'ana.electricista@example.com',
    tags:['urgencias','trifásica','tableros'], rating:4.8,
    bio:'Electricista matriculada. Urgencias 24/7. Zonas: Centro, Nueva Córdoba, Güemes.' },
  { id: 2, name: 'Juan Pérez', category:'Plomería', city:'Rosario',
    phone:'+54 9 341 444-2222', email:'juan.plomero@example.com',
    tags:['destapaciones','termotanque'], rating:4.6,
    bio:'Plomero gasista. Instalación y mantenimiento. Trabajos con garantía.' },
  { id: 3, name: 'Carpintería El Roble', category:'Carpintería', city:'CABA',
    phone:'+54 9 11 333-9876', email:'contacto@elroble.com',
    tags:['muebles a medida','colocación'], rating:4.9,
    bio:'Muebles a medida y restauración. Presupuestos sin cargo.' },
];

const storeKey = 'oficioscerca:data';

function readStore(){
  try {
    const raw = localStorage.getItem(storeKey);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed)) return null;
    return parsed;
  } catch(e){ return null; }
}

function loadData(){
  const data = readStore();
  // Si no hay nada o está vacío, mostrar demo por defecto
  if(!data || data.length === 0) return demo.slice();
  return data;
}

function saveData(data){
  localStorage.setItem(storeKey, JSON.stringify(data));
}

function seedDemo(){
  saveData(demo.slice());
  render();
  alert('Se cargaron los ejemplos');
}

function resetDemo(){
  localStorage.removeItem(storeKey);
  render();
  alert('Demo reseteada. Si no cargás nada, verás los ejemplos por defecto.');
}

function initials(name){
  return name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
}

function normalize(str){ return (str||'').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,''); }

function matches(item){
  const q = normalize(qEl.value);
  const c = catEl.value;
  const city = normalize(cityEl.value);
  const hayQ = !q || (
    normalize(item.name).includes(q) ||
    normalize(item.category).includes(q) ||
    normalize(item.bio).includes(q) ||
    (item.tags||[]).some(t=>normalize(t).includes(q))
  );
  const hayCat = !c || item.category === c;
  const hayCity = !city || normalize(item.city).includes(city);
  return hayQ && hayCat && hayCity;
}

function telHref(phone){ const digits = phone.replace(/\D+/g,''); return 'tel:+'+digits; }
function waHref(phone, text){ const digits = phone.replace(/\D+/g,''); const msg = encodeURIComponent(text || 'Hola, vi tu contacto en OficiosCerca y me gustaría consultarte.'); return `https://wa.me/${digits}?text=${msg}`; }
function emailHref(email){ const subject = encodeURIComponent('Consulta desde OficiosCerca'); const body = encodeURIComponent('Hola, te contacto porque vi tu perfil en OficiosCerca...'); return `mailto:${email}?subject=${subject}&body=${body}`; }

function render(){
  const data = loadData().filter(matches);
  listEl.innerHTML = '';
  emptyEl.style.display = data.length ? 'none' : 'block';
  data.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="avatar" aria-hidden="true">${initials(p.name)}</div>
      <div>
        <div class="c-title">${p.name} · <span class="rating">★ ${(p.rating?.toFixed?.(1) || '—')}</span></div>
        <div class="c-sub">${p.category} · ${p.city}</div>
        <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <div class="c-sub" style="margin-top:6px;">${p.bio||''}</div>
      </div>
      <div class="actions">
        <a class="iconbtn" href="${waHref(p.phone)}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="iconbtn" href="${telHref(p.phone)}">Llamar</a>
        ${p.email ? `<a class="iconbtn" href="${emailHref(p.email)}">Email</a>` : ''}
      </div>
    `;
    listEl.appendChild(card);
  });
}

qEl.addEventListener('input', render);
catEl.addEventListener('change', render);
cityEl.addEventListener('input', render);

postForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const form = new FormData(postForm);
  const data = readStore() || [];
  const newItem = {
    id: Date.now(),
    name: form.get('name').toString().trim(),
    category: form.get('category'),
    city: form.get('city').toString().trim(),
    phone: form.get('phone').toString().trim(),
    email: (form.get('email')||'').toString().trim(),
    tags: (form.get('tags')||'').toString().split(',').map(t=>t.trim()).filter(Boolean),
    rating: 5.0,
    bio: (form.get('bio')||'').toString().trim(),
  };
  if(!newItem.name || !newItem.category || !newItem.city || !newItem.phone){ alert('Completá los obligatorios.'); return; }
  data.push(newItem);
  saveData(data);
  postForm.reset();
  render();
  alert('¡Publicado! (Guardado localmente en este demo).');
});

clearBtn.addEventListener('click', ()=> postForm.reset());
seedBtn.addEventListener('click', seedDemo);
resetBtn.addEventListener('click', resetDemo);

document.querySelector('#year').textContent = new Date().getFullYear();
render();
