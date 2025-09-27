// ====== CONFIG ======
const API_BASE = 'https://oficioscerca.onrender.com';
const TOKEN_KEY = 'oficioscerca:adminToken';

// ====== DOM ======
const loginCard = document.getElementById('loginCard');
const panelCard = document.getElementById('panelCard');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loginMsg = document.getElementById('loginMsg');
const logoutBtn = document.getElementById('logoutBtn');
const whoEl = document.getElementById('who');
const emptyMsg = document.getElementById('emptyMsg');
const tbl = document.getElementById('tbl');
const tbody = document.getElementById('tbody');
const tabPending = document.getElementById('tabPending');
const tabApproved = document.getElementById('tabApproved');

// ====== STATE ======
let currentTab = 'pending'; // 'pending' | 'approved'
function getToken(){ return localStorage.getItem(TOKEN_KEY) || ''; }
function setToken(t){ localStorage.setItem(TOKEN_KEY, t); }
function clearToken(){ localStorage.removeItem(TOKEN_KEY); }
function showLogin(){ loginCard.classList.remove('hidden'); panelCard.classList.add('hidden'); }
function showPanel(){ loginCard.classList.add('hidden'); panelCard.classList.remove('hidden'); }

// ====== API ======
async function login(email, password){
  const res = await fetch(API_BASE + '/api/auth/login', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ email, password })
  });
  if(!res.ok) throw new Error('Credenciales inválidas');
  const { token } = await res.json();
  return token;
}

async function fetchPendings(){
  const res = await fetch(API_BASE + '/api/pros/admin/pending', {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  if(res.status === 401) { clearToken(); throw new Error('Sesión expirada'); }
  if(!res.ok) throw new Error('Error cargando pendientes');
  return res.json();
}

async function fetchApproved(){
  const res = await fetch(API_BASE + '/api/pros/admin/approved', {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  if(res.status === 401) { clearToken(); throw new Error('Sesión expirada'); }
  if(!res.ok) throw new Error('Error cargando aprobados');
  return res.json();
}

async function updateStatus(id, status){
  const res = await fetch(API_BASE + '/api/pros/' + id + '/status', {
    method:'PATCH',
    headers:{
      'Content-Type':'application/json',
      'Authorization': 'Bearer ' + getToken()
    },
    body: JSON.stringify({ status })
  });
  if(res.status === 401) { clearToken(); throw new Error('Sesión expirada'); }
  if(!res.ok) throw new Error('Error actualizando estado');
  return res.json();
}

async function deleteProfessional(id){
  const res = await fetch(API_BASE + '/api/pros/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  if(res.status === 401){ clearToken(); throw new Error('Sesión expirada'); }
  if(!res.ok) throw new Error('Error eliminando');
  return res.json();
}

// ====== RENDER ======
function renderRows(rows){
  tbody.innerHTML = '';
  if(!rows.length){
    emptyMsg.style.display = 'block';
    tbl.classList.add('hidden');
    return;
  }
  emptyMsg.style.display = 'none';
  tbl.classList.remove('hidden');

  rows.forEach(p => {
    const tr = document.createElement('tr');
    const tags = (() => { try { return JSON.parse(p.tags || '[]'); } catch { return []; } })();
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.city}</td>
      <td>${tags.map(t=>`<span class="tag">${t}</span>`).join('')}</td>
      <td>${p.phone}</td>
      <td>
        ${
          currentTab === 'pending'
          ? `
            <button data-act="approve" data-id="${p.id}" class="primary">Aprobar</button>
            <button data-act="reject" data-id="${p.id}">Rechazar</button>
            <button data-act="delete" data-id="${p.id}">Eliminar</button>
          `
          : `
            <button data-act="reject" data-id="${p.id}">Ocultar</button>
            <button data-act="delete" data-id="${p.id}">Eliminar</button>
          `
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadCurrent(){
  const loader = currentTab === 'pending' ? fetchPendings : fetchApproved;
  const rows = await loader();
  renderRows(rows);
}

// ====== EVENTS ======
loginBtn?.addEventListener('click', async () => {
  const email = (emailEl.value || '').trim();
  const password = (passwordEl.value || '').trim();
  if(!email || !password){ loginMsg.textContent = 'Completá email y contraseña'; return; }
  loginMsg.textContent = 'Ingresando...';
  try{
    const token = await login(email, password);
    setToken(token);
    whoEl.textContent = email;
    showPanel();
    await loadCurrent();
    loginMsg.textContent = '';
  }catch(err){
    loginMsg.textContent = err.message || 'Error';
  }
});

logoutBtn?.addEventListener('click', () => {
  clearToken();
  emailEl.value = '';
  passwordEl.value = '';
  showLogin();
});

tabPending?.addEventListener('click', async () => {
  currentTab = 'pending';
  await loadCurrent();
});

tabApproved?.addEventListener('click', async () => {
  currentTab = 'approved';
  await loadCurrent();
});

tbody?.addEventListener('click', async (e) => {
  const target = e.target;
  if(!(target instanceof HTMLElement)) return;
  const act = target.getAttribute('data-act');
  const id = target.getAttribute('data-id');
  if(!act || !id) return;

  try{
    if (act === 'approve' || act === 'reject') {
      await updateStatus(id, act === 'approve' ? 'approved' : 'rejected');
    } else if (act === 'delete') {
      if (!confirm('¿Eliminar este perfil? Esta acción lo ocultará del sitio.')) return;
      await deleteProfessional(id);
    }
    await loadCurrent();
  }catch(err){
    alert(err.message || 'Error');
  }
});

// ====== INIT ======
(function init(){
  if(getToken()){
    whoEl.textContent = 'Sesión activa';
    showPanel();
    loadCurrent(); // arranca mostrando pendientes
  } else {
    showLogin();
  }
})();
