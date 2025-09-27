# OficiosCerca – Backend (Express + Prisma + TS)

## Dev (SQLite)
1) Copiá `.env.example` a `.env` y ajustá si querés:
```
DATABASE_URL="file:./dev.db"
PORT=10000
JWT_SECRET=pon_un_secreto_largo_y_unico
CORS_ORIGIN=*
```
2) Instalá y generá Prisma:
```
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```
3) Probar:
- `GET http://localhost:10000/health` -> `{ ok: true }`
- `POST /api/pros` -> crea `pending`
- `POST /api/auth/login` -> devuelve `{ token }` (admin seed)
- `PATCH /api/pros/:id/status` (Bearer token) -> `approved`/`rejected`
- `GET /api/pros` -> lista aprobados

## Producción (Render + Postgres)
1) Cambiá `prisma/schema.prisma` -> `provider = "postgresql"`
2) Variables en Render:
- `DATABASE_URL` (de tu Postgres Render)
- `JWT_SECRET` (largo)
- `CORS_ORIGIN=https://<tu-netlify>.netlify.app`
3) Build: `npm install && npx prisma generate && npx prisma migrate deploy`
4) Start: `npm run start`
5) (uno) Seed desde consola: `npm run seed`

> Si querés mantener ambos providers sin editar a mano, luego agregamos dos schemas (dev/prod) o un paso de build.