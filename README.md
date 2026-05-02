# Estudio Contable

Template full-stack para una app de gestion de cuenta corriente de clientes de un estudio contable.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Monorepo: npm workspaces
- Datos actuales: estado en memoria / endpoints mock

## Comandos

```bash
npm install
npm run dev
```

El frontend corre en `http://localhost:5173` y el backend en `http://localhost:3001`.

## Estructura

```text
client/               React app
client/src/api/       Cliente HTTP para consumir Express
client/src/views/     Pantallas principales
client/src/components Componentes reutilizables
server/               Express API
```

## Funcionalidades iniciales

- Home con resumen de saldo pendiente, cobros registrados y conceptos activos.
- ABM de clientes con alta, modificacion y baja.
- Gestion de conceptos/importes por defecto por cliente.
- Generacion manual de debitos desde conceptos recurrentes.
- Registro de pagos discriminados por cliente, concepto y medio de pago.
- Reporte imprimible por cliente con debitos, creditos y saldo.
- ABM de empleados con alta, modificacion y baja.
- Liquidacion de sueldos e historial de cobro.
- Calculo de variable sugerido sobre honorarios cobrados.
- Frontend modularizado por capas y consumiendo datos desde `/api`.

## Configuracion frontend

Por defecto el frontend usa rutas relativas `/api/...` y Vite las proxyea al backend:

```js
proxy: {
  '/api': 'http://localhost:3001',
}
```

Si se necesita apuntar a otra URL, se puede definir `VITE_API_URL` en el entorno del frontend.

## Endpoints base

- `GET /api/dashboard`
- `GET /api/clients`
- `GET /api/clients/:clientId`
- `POST /api/clients`
- `PUT /api/clients/:clientId`
- `DELETE /api/clients/:clientId`
- `POST /api/clients/:clientId/concepts`
- `PATCH /api/clients/:clientId/concepts/:conceptId`
- `GET /api/charges`
- `POST /api/charges`
- `GET /api/payments`
- `POST /api/payments`
- `GET /api/reports/client/:clientId`
- `GET /api/employees`
- `GET /api/employees/:employeeId`
- `POST /api/employees`
- `PUT /api/employees/:employeeId`
- `DELETE /api/employees/:employeeId`
- `GET /api/salaries`
- `POST /api/salaries`
