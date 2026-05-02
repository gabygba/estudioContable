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
    ├── main.jsx
    │   └── Punto de entrada: renderiza <App /> dentro de #root
    │
    ├── App.jsx
    │   └── Pantallas, estado, datos mock y logica principal
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
   │                  ├─ Home / Dashboard
   │                  ├─ Clientes y conceptos
   │                  ├─ Pagos
   │                  ├─ Reportes
   │                  └─ Empleados y sueldos
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

Es el archivo principal de la aplicacion por ahora.

Contiene:

```text
Datos mock iniciales
   ├─ Clientes
   ├─ Conceptos por defecto
   ├─ Debitos/cargos
   ├─ Pagos
   ├─ Empleados
   └─ Historial de sueldos

Estado con useState
   ├─ Pantalla activa
   ├─ Formularios
   ├─ Cliente seleccionado
   └─ Datos cargados en memoria

Calculos con useMemo
   ├─ Saldos
   ├─ Cobros
   ├─ Reporte por cliente
   └─ Variable de sueldos

Componentes de vista
   ├─ DashboardView
   ├─ ClientsView
   ├─ PaymentsView
   ├─ ReportsView
   └─ EmployeesView
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
├─ Tiene los datos
├─ Tiene las funciones que modifican los datos
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
Agrega el pago al estado payments
   │
   ▼
La pantalla se vuelve a renderizar con el nuevo pago
```

## Proximo orden recomendado

Cuando la app crezca, conviene separar `App.jsx` asi:

```text
src/
├── data/
│   └── mockData.js
│
├── components/
│   ├── Sidebar.jsx
│   ├── MetricCard.jsx
│   └── Panel.jsx
│
├── views/
│   ├── DashboardView.jsx
│   ├── ClientsView.jsx
│   ├── PaymentsView.jsx
│   ├── ReportsView.jsx
│   └── EmployeesView.jsx
│
├── utils/
│   └── formatters.js
│
├── App.jsx
└── main.jsx
```

Por ahora esta todo junto en `App.jsx` porque el prototipo todavia esta en etapa inicial.
