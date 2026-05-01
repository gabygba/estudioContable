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
client/  React app
server/  Express API
```

## Funcionalidades iniciales

- Home con resumen de saldo pendiente, cobros registrados y conceptos activos.
- Gestion de conceptos/importes por defecto por cliente.
- Generacion manual de debitos desde conceptos recurrentes.
- Registro de pagos discriminados por cliente, concepto y medio de pago.
- Reporte imprimible por cliente con debitos, creditos y saldo.
- Vista de empleados con alta simple, liquidacion de sueldos e historial.
- Calculo de variable sugerido sobre honorarios cobrados.

## Endpoints base

- `GET /api/dashboard`
- `GET /api/clients`
- `POST /api/clients/:clientId/concepts`
- `PATCH /api/clients/:clientId/concepts/:conceptId`
- `GET /api/charges`
- `POST /api/charges`
- `GET /api/payments`
- `POST /api/payments`
- `GET /api/reports/client/:clientId`
- `GET /api/employees`
- `POST /api/employees`
- `GET /api/salaries`
- `POST /api/salaries`
