// api.js — cliente HTTP para el backend Help Desk API
// Reemplaza al antiguo data.js (localStorage)

const API_URL = 'http://localhost:3000/api';

const API = {

  // ─── Token / Sesión ────────────────────────────────────────
  getToken()        { return localStorage.getItem('hd_token'); },
  setToken(t)       { localStorage.setItem('hd_token', t); },
  getSession()      { const s = localStorage.getItem('hd_session'); return s ? JSON.parse(s) : null; },
  setSession(u)     { localStorage.setItem('hd_session', JSON.stringify(u)); },
  logout()          { localStorage.removeItem('hd_token'); localStorage.removeItem('hd_session'); location.href = 'index.html'; },

  // ─── HTTP helper ───────────────────────────────────────────
  async request(method, endpoint, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
    return data;
  },

  get(ep)          { return this.request('GET', ep); },
  post(ep, body)   { return this.request('POST', ep, body); },
  put(ep, body)    { return this.request('PUT', ep, body); },
  del(ep)          { return this.request('DELETE', ep); },

  // ─── Auth ──────────────────────────────────────────────────
  async login(email, password) {
    const data = await this.post('/auth/login', { email, password });
    this.setToken(data.token);
    this.setSession(data.user);
    return data.user;
  },

  async register(nombre, email, password, rol) {
    const data = await this.post('/auth/register', { nombre, email, password, rol });
    return data.data;
  },

  redirect(rol) {
    if (rol === 'ADMIN')    location.href = 'admin.html';
    else if (rol === 'PROFESOR') location.href = 'hub-profesor.html';
    else location.href = 'hub-alumno.html';
  },

  // ─── Computadoras ──────────────────────────────────────────
  async getPCs()        { return (await this.get('/computadoras')).data; },
  async getPC(id)       { return (await this.get(`/computadoras/${id}`)).data; },
  async addPC(data)     { return (await this.post('/computadoras', data)).data; },
  async updatePC(id, d) { return (await this.put(`/computadoras/${id}`, d)).data; },
  async deletePC(id)    { return this.del(`/computadoras/${id}`); },

  // ─── Tickets (comentarios del foro) ────────────────────────
  async getTicketsByPC(pcId)  { return (await this.get(`/tickets/computadora/${pcId}`)).data; },
  async getAllTickets()         { return (await this.get('/tickets')).data; },
  async getMyTickets()         { return (await this.get('/tickets/mios')).data; },
  async createTicket(body)     { return (await this.post('/tickets', body)).data; },
  async updateTicketStatus(id, estado) { return (await this.put(`/tickets/${id}/estado`, { estado })).data; },
  async deleteTicket(id)       { return this.del(`/tickets/${id}`); },

  // ─── Users ─────────────────────────────────────────────────
  async getUsers() { return (await this.get('/users')).data; },

  // ─── Helpers UI ────────────────────────────────────────────
  avatar(nombre) {
    return (nombre || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  },

  labLabel(l) {
    return { lab_a: 'Laboratorio A', lab_b: 'Laboratorio B', sala: 'Sala de Profesores', otros: 'Otros' }[l] || l;
  },

  estadoLabel(e) {
    return { ok: 'Operativa', warn: 'Con problemas', danger: 'Crítica' }[e] || e;
  },

  rolLabel(r) {
    return { ADMIN: 'Admin', PROFESOR: 'Profesor', USER: 'Alumno' }[r] || r;
  },

  rolClass(r) {
    return { ADMIN: 'role-admin', PROFESOR: 'role-profesor', USER: 'role-alumno' }[r] || '';
  },

  tipoLabel(t) {
    return { PROBLEMA: 'Problema', SOLUCION: 'Solución', IDEA: 'Idea', INFO: 'Info' }[t] || t;
  },

  tipoClass(t) {
    return { PROBLEMA: 'tag-prob', SOLUCION: 'tag-sol', IDEA: 'tag-idea', INFO: '' }[t] || '';
  },

  formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  },

  stats(pcs) {
    return {
      total:  pcs.length,
      ok:     pcs.filter(p => p.estado === 'ok').length,
      warn:   pcs.filter(p => p.estado === 'warn').length,
      danger: pcs.filter(p => p.estado === 'danger').length,
    };
  },

  // Muestra un error en pantalla
  showError(elId, msg) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
  },

  clearError(elId) {
    const el = document.getElementById(elId);
    if (el) el.classList.remove('show');
  },
};