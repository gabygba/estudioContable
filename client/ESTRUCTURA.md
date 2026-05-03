# Estructura del Frontend React

Esta guia visual muestra como se conecta la app React del proyecto.

## Mapa rapido

```text
client/
├── index.html
│   └── Contiene el div #root donde React monta la app
│
├── package.json
│   └── Define dependencias y scripts del frontend
│
├── vite.config.js
│   └── Configura Vite, React y el proxy hacia el backend
│
└── src/
    ├── api/
    │   └── accountingApi.js
    │       └── Cliente HTTP para consumir el backend Node
    │
    ├── components/
    │   ├── MetricCard.jsx
    │   └── Sidebar.jsx
    │
    ├── constants/
    │   └── forms.js
    │       └── Estados iniciales y opciones compartidas
    │
    ├── utils/
    │   └── formatters.js
    │       └── Formateo de moneda y helpers de nombres
    │
    ├── views/
    │   ├── DashboardView.jsx
    │   ├── ClientsView.jsx
    │   ├── PaymentsView.jsx
    │   └── EmployeesView.jsx
    │
    ├── main.jsx
    │   └── Punto de entrada: renderiza <App /> dentro de #root
    │
    ├── App.jsx
    │   └── Orquesta estado, navegacion y llamadas al backend
    │
    └── styles.css
        └── Estilos globales y estilos de cada vista
```

## Flujo de carga

```text
Navegador
   │
   ▼
index.html
   │
   │ busca:
   ▼
/src/main.jsx
   │
   │ importa:
   ├──────────────► App.jsx
   │                  │
   │                  ├─ api/accountingApi.js
   │                  ├─ components/Sidebar.jsx
   │                  └─ views/*
   │
   └──────────────► styles.css
                      │
                      ├─ Layout general
                      ├─ Sidebar
                      ├─ Formularios
                      ├─ Tablas
                      └─ Vista imprimible
```

## Responsabilidad de cada archivo

### `index.html`

Es la pagina base que entrega Vite al navegador.

Lo mas importante:

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

React no reemplaza todo el HTML: se monta dentro de `#root`.

### `src/main.jsx`

Es el punto de entrada real de React.

Hace tres cosas:

```text
1. Importa React
2. Importa App.jsx
3. Renderiza <App /> dentro de #root
```

### `src/App.jsx`

Es el coordinador principal de la aplicacion.

Contiene:

```text
Estado con useState
   ├─ Pantalla activa
   ├─ Datos recibidos del backend
   ├─ Formularios
   ├─ Cliente seleccionado
   ├─ Empleado seleccionado
   └─ Estados de carga/error

Calculos con useMemo
   └─ Honorarios cobrados para variable de sueldos

Funciones async
   ├─ Cargar dashboard/clientes/pagos/etc
   ├─ Crear/editar/eliminar clientes
   ├─ Crear conceptos y debitos
   ├─ Registrar pagos
   ├─ Crear/editar/eliminar empleados
   └─ Registrar sueldos
```

### `src/api/accountingApi.js`

Centraliza todas las llamadas HTTP.

```text
Frontend
   │
   ▼
accountingApi
   │
   ├─ GET /api/clients
   ├─ POST /api/clients
   ├─ PUT /api/clients/:id
   ├─ DELETE /api/clients/:id
   ├─ POST /api/payments
   └─ ...
```

Las vistas no llaman a `fetch` directamente. Eso mantiene la UI desacoplada del transporte HTTP.

### `src/views/*`

Cada archivo representa una pantalla.

```text
DashboardView   resumen y ultimos movimientos
ClientsView     listado, alta, detalle, conceptos, pagos y reportes filtrados
PaymentsView    formulario reutilizado dentro del detalle de cliente
EmployeesView   ABM de empleados y sueldos
```

### `src/styles.css`

Define toda la apariencia visual.

Agrupa estilos para:

```text
Layout
   ├─ .app-shell
   ├─ .sidebar
   └─ .workspace

Componentes visuales
   ├─ .panel
   ├─ .metric-card
   ├─ .table-row
   ├─ .field
   └─ .primary-button

Responsive
   ├─ @media max-width: 1050px
   └─ @media max-width: 720px

Impresion
   └─ @media print
```

### `vite.config.js`

Configura el servidor de desarrollo.

Puntos clave:

```js
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:3001',
  },
}
```

Eso permite que el frontend pueda pedir datos a `/api/...` y Vite lo redirija al backend Node.

## Como pensar la app

```text
App.jsx
│
├─ Carga los datos desde el backend
├─ Tiene las funciones async que modifican los datos
├─ Decide que pantalla mostrar
└─ Pasa datos y funciones a cada vista
```

Ejemplo:

```text
PaymentsView
   │
   ├─ Recibe paymentForm
   ├─ Recibe clients
   ├─ Recibe setPaymentForm
   └─ Recibe handleRegisterPayment

Cuando se envia el formulario:
   │
   ▼
handleRegisterPayment()
   │
   ▼
POST /api/payments
   │
   ▼
App.jsx vuelve a cargar datos desde el backend
   │
   ▼
La pantalla se renderiza con la respuesta actualizada
```

## Organizacion actual

La app ya esta separada en capas:

```text
src/
├── api/
│   └── accountingApi.js
│
├── components/
│   ├── Sidebar.jsx
│   ├── MetricCard.jsx
│
├── constants/
│   └── forms.js
│
├── views/
│   ├── DashboardView.jsx
│   ├── ClientsView.jsx
│   ├── PaymentsView.jsx
│   └── EmployeesView.jsx
│
├── utils/
│   └── formatters.js
│
├── App.jsx
└── main.jsx
```
