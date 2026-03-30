// ================================================================
// PC Forum — API Client
// Reemplaza localStorage por llamadas reales al backend
// ================================================================

const API_URL = 'http://localhost:3000/api'
// En el servidor del colegio cambiar por:
// const API_URL = 'http://192.168.0.31:3000/api'

// ── Helpers internos ────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('pf_token')
}

function getHeaders(includeAuth = true) {
  const headers = { 'Content-Type': 'application/json' }
  if (includeAuth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

function mapRolBackToFront(rol) {
  // Backend usa ADMIN/USER, frontend usa admin/profesor/alumno
  if (rol === 'ADMIN') return 'admin'
  return 'alumno' // USER del backend = alumno en el frontend
}

function mapEstadoBackToFront(estado) {
  // Backend: ABIERTO/EN_PROCESO/RESUELTO/CERRADO
  // Frontend: danger/warn/ok
  const map = {
    'ABIERTO':    'danger',
    'EN_PROCESO': 'warn',
    'RESUELTO':   'ok',
    'CERRADO':    'ok',
  }
  return map[estado] || 'ok'
}

function mapEstadoFrontToBack(estado) {
  // Frontend: danger/warn/ok → Backend: ABIERTO/EN_PROCESO/RESUELTO
  const map = {
    'danger': 'ABIERTO',
    'warn':   'EN_PROCESO',
    'ok':     'RESUELTO',
  }
  return map[estado] || 'ABIERTO'
}

function buildAvatar(nombre) {
  return (nombre || 'XX')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ── DB — API pública usada por los HTML ─────────────────────────

const DB = {

  // ── SESIÓN ──────────────────────────────────────────────────

  setSession(user) {
    localStorage.setItem('pf_session', JSON.stringify(user))
  },

  getSession() {
    const s = localStorage.getItem('pf_session')
    return s ? JSON.parse(s) : null
  },

  logout() {
    localStorage.removeItem('pf_session')
    localStorage.removeItem('pf_token')
  },

  redirect(rol) {
    if (rol === 'admin')    location.href = 'admin.html'
    else if (rol === 'profesor') location.href = 'hub-profesor.html'
    else                    location.href = 'hub-alumno.html'
  },

  // ── AUTH ────────────────────────────────────────────────────

  async login(usuario, password) {
    // El backend espera email, usamos usuario como email
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email: usuario, password }),
    })
    const data = await res.json()
    if (!res.ok) return null

    // Guardar token
    localStorage.setItem('pf_token', data.token)

    // Construir sesión compatible con el frontend
    const session = {
      id:      data.user.id,
      nombre:  data.user.nombre,
      usuario: data.user.email,
      rol:     mapRolBackToFront(data.user.rol),
      avatar:  buildAvatar(data.user.nombre),
    }
    this.setSession(session)
    return session
  },

  async register(datos) {
    // datos = { nombre, usuario, password, rol }
    // Backend espera: nombre, email, password
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({
        nombre:   datos.nombre,
        email:    datos.usuario,   // usuario como email
        password: datos.password,
      }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, msg: data.message || 'Error al registrarse.' }

    const session = {
      id:      data.data.id,
      nombre:  data.data.nombre,
      usuario: data.data.email,
      rol:     datos.rol || 'alumno',
      avatar:  buildAvatar(data.data.nombre),
    }
    return { ok: true, user: session }
  },

  // ── COMPUTADORAS (Tickets en el backend) ────────────────────

  async getPCs() {
    // Admin ve todos los tickets, users ven los suyos
    const session = this.getSession()
    const endpoint = session && session.rol === 'admin'
      ? `${API_URL}/tickets`
      : `${API_URL}/tickets/mios`

    const res = await fetch(endpoint, { headers: getHeaders() })
    if (!res.ok) return []
    const data = await res.json()

    // Mapear tickets del backend al formato PC del frontend
    return (data.data || []).map(t => ({
      id:          t.id,
      numero:      t.titulo,
      nombre:      t.descripcion,
      marca:       t.computadora?.codigo  || '',
      modelo:      t.computadora?.ubicacion || '',
      procesador:  '',
      ram:         '',
      disco:       '',
      os:          '',
      lab:         t.computadora?.descripcion || 'otros',
      estado:      mapEstadoBackToFront(t.estado),
      _ticket:     t, // referencia al ticket original por si se necesita
    }))
  },

  async getPC(id) {
    const pcs = await this.getPCs()
    return pcs.find(p => p.id == id) || null
  },

  async addPC(datos) {
    const res = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        titulo:      datos.numero,
        descripcion: datos.nombre,
        prioridad:   datos.estado === 'danger' ? 'ALTA' : datos.estado === 'warn' ? 'MEDIA' : 'BAJA',
      }),
    })
    const data = await res.json()
    return data.data?.id || null
  },

  async updatePC(id, datos) {
    if (datos.estado) {
      const res = await fetch(`${API_URL}/tickets/${id}/estado`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ estado: mapEstadoFrontToBack(datos.estado) }),
      })
      return res.ok
    }
    // Si cambia titulo/descripcion no hay endpoint de edición completa en el backend aún
    // Se puede agregar en Sprint 2
    return true
  },

  async deletePC(id) {
    // Primero eliminar comentarios relacionados no es necesario
    // porque el backend borra el historial en cascada
    const res = await fetch(`${API_URL}/tickets/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return res.ok
  },

  // ── COMENTARIOS (Historial en el backend) ───────────────────

  async getComments(pcId) {
    // El historial viene incluido en cada ticket
    // Construimos los comentarios desde los tickets que ya tenemos
    const pcs = await this.getPCs()

    const allComments = []
    for (const pc of pcs) {
      if (pc._ticket && pc._ticket.historial) {
        for (const h of pc._ticket.historial) {
          if (!pcId || pc.id == pcId) {
            allComments.push({
              id:     h.id,
              pcId:   pc.id,
              userId: h.usuarioId,
              autor:  h.usuario?.nombre || 'Usuario',
              rol:    h.usuario?.rol === 'ADMIN' ? 'admin' : 'alumno',
              avatar: buildAvatar(h.usuario?.nombre || 'U'),
              texto:  h.descripcion,
              tipo:   h.accion === 'CREADO' ? 'info'
                    : h.accion === 'CAMBIO_ESTADO' ? 'solucion'
                    : h.accion === 'ELIMINADO' ? 'problema'
                    : 'info',
              fecha:  h.fecha,
            })
          }
        }
      }
    }
    return allComments
  },

  async addComment(datos) {
    // En el backend los comentarios son tickets nuevos o historial
    // Creamos un ticket nuevo con la descripción del comentario
    const res = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        titulo:       `[${datos.tipo?.toUpperCase() || 'COMENTARIO'}] PC #${datos.pcId}`,
        descripcion:  datos.texto,
        prioridad:    datos.tipo === 'problema' ? 'ALTA' : 'MEDIA',
        computadoraId: null,
      }),
    })
    return res.ok
  },

  // ── USUARIOS ────────────────────────────────────────────────

  async getUsers() {
    const res = await fetch(`${API_URL}/users`, { headers: getHeaders() })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data || []).map(u => ({
      id:      u.id,
      nombre:  u.nombre,
      usuario: u.email,
      rol:     mapRolBackToFront(u.rol),
      avatar:  buildAvatar(u.nombre),
    }))
  },

  // ── STATS (calculadas localmente a partir de las PCs) ───────

  async stats() {
    const pcs = await this.getPCs()
    return {
      total:  pcs.length,
      ok:     pcs.filter(p => p.estado === 'ok').length,
      warn:   pcs.filter(p => p.estado === 'warn').length,
      danger: pcs.filter(p => p.estado === 'danger').length,
    }
  },

  // ── HELPERS de display (sin cambios) ────────────────────────

  estadoLabel(e) {
    return { ok: 'Operativa', warn: 'Con problemas', danger: 'Crítica' }[e] || e
  },

  labLabel(l) {
    return {
      lab_a: 'Laboratorio A',
      lab_b: 'Laboratorio B',
      sala:  'Sala de Profesores',
      otros: 'Otros',
    }[l] || l
  },

  formatDate(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' '
      + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  },
}
