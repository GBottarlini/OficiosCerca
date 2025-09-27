# OficiosCerca ⚡

OficiosCerca es una plataforma sencilla e intuitiva que conecta a personas que ofrecen **oficios** (electricistas, carpinteros, plomeros, etc.) con quienes necesitan contratar servicios de manera rápida y directa.

El proyecto surge como una **iniciativa comunitaria** dentro de un club de fútbol: ante la difícil situación laboral de muchas familias, se buscó crear una herramienta accesible para que trabajadores puedan publicar su oficio y ser contactados fácilmente, incluso por personas con poca experiencia en tecnología.

---

## 🚀 Características

- 📋 **Publicación rápida** de oficios en minutos
- 🔎 **Búsqueda simple** por categoría, ciudad o palabras clave
- 📱 **Contacto directo** al profesional vía teléfono, WhatsApp o email
- 🔒 **Panel de administración** para aprobar, rechazar o eliminar publicaciones
- 🗂️ **Gestión de estados**: pendientes, aprobados, rechazados y eliminados
- 🌐 **Arquitectura separada** frontend y admin para despliegue sencillo

---

## 🛠️ Stack Tecnológico

### Frontend
- HTML, CSS, JavaScript (Vanilla)

### Backend
- Node.js + Express
- Prisma ORM
- SQLite (desarrollo) / PostgreSQL (producción)
- JWT + Argon2 para autenticación

### Deployment
- **Backend**: [Render](https://render.com)
- **Frontend**: [Netlify](https://www.netlify.com)

---

## ⚙️ Instalación y Uso Local

### Prerrequisitos
- Node.js instalado
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/oficioscerca.git
cd oficioscerca 
```

### 2. Configurar el Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```
El backend estará disponible en http://localhost:10000

### 3. Configurar el Frontend
```bash
cd frontend
# Abrir index.html o admin.html en el navegador
```
## ⚙️ Instalación y Uso Local
