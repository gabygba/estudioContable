import { useMemo, useState } from 'react';
import {
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Plus,
  Printer,
  ReceiptText,
  Save,
  Search,
  Users,
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  currency: 'ARS',
  maximumFractionDigits: 0,
  style: 'currency',
});

const initialClients = [
  {
    id: 1,
    name: 'Alvarez & Asociados',
    cuit: '30-71234567-8',
    defaultConcepts: [
      { id: 1, concept: 'Honorarios', amount: 85000, dueDay: 10, active: true },
      { id: 2, concept: 'Pago de IVA', amount: 126000, dueDay: 20, active: true },
      { id: 3, concept: 'Pago de IIBB', amount: 38500, dueDay: 18, active: true },
    ],
  },
  {
    id: 2,
    name: 'Ferreteria Norte',
    cuit: '20-18654321-5',
    defaultConcepts: [
      { id: 4, concept: 'Honorarios', amount: 62000, dueDay: 10, active: true },
      { id: 5, concept: 'Monotributo', amount: 42000, dueDay: 20, active: true },
    ],
  },
  {
    id: 3,
    name: 'Clinica San Martin',
    cuit: '30-69876543-1',
    defaultConcepts: [
      { id: 6, concept: 'Honorarios', amount: 126000, dueDay: 10, active: true },
      { id: 7, concept: 'Liquidacion de sueldos', amount: 96000, dueDay: 15, active: true },
    ],
  },
];

const initialCharges = [
  { id: 1, clientId: 1, date: '2026-04-01', concept: 'Honorarios', amount: 85000 },
  { id: 2, clientId: 1, date: '2026-04-15', concept: 'Pago de IVA', amount: 126000 },
  { id: 3, clientId: 2, date: '2026-04-01', concept: 'Honorarios', amount: 62000 },
  { id: 4, clientId: 2, date: '2026-04-12', concept: 'Monotributo', amount: 42000 },
  { id: 5, clientId: 3, date: '2026-04-01', concept: 'Honorarios', amount: 126000 },
  { id: 6, clientId: 3, date: '2026-04-10', concept: 'Liquidacion de sueldos', amount: 96000 },
];

const initialPayments = [
  {
    id: 1,
    clientId: 2,
    date: '2026-04-16',
    concept: 'Honorarios',
    amount: 62000,
    method: 'Transferencia',
    receipt: 'TR-1024',
  },
  {
    id: 2,
    clientId: 1,
    date: '2026-04-18',
    concept: 'Pago de IVA',
    amount: 76000,
    method: 'Efectivo',
    receipt: 'RC-0041',
  },
];

const initialEmployees = [
  { id: 1, name: 'Mariana Lopez', role: 'Administracion', commissionRate: 0.08 },
  { id: 2, name: 'Santiago Ruiz', role: 'Contador junior', commissionRate: 0.12 },
];

const initialSalaryHistory = [
  {
    id: 1,
    employeeId: 1,
    month: '2026-04',
    baseSalary: 420000,
    honorariosBase: 62000,
    variableAmount: 4960,
    paidAmount: 424960,
    date: '2026-04-25',
    method: 'Transferencia',
    notes: 'Liquidacion abril',
  },
];

const paymentMethods = ['Transferencia', 'Efectivo', 'Cheque', 'Mercado Pago'];

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function getClientName(clients, clientId) {
  return clients.find((client) => client.id === Number(clientId))?.name ?? 'Sin cliente';
}

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [clients, setClients] = useState(initialClients);
  const [charges, setCharges] = useState(initialCharges);
  const [payments, setPayments] = useState(initialPayments);
  const [employees, setEmployees] = useState(initialEmployees);
  const [salaryHistory, setSalaryHistory] = useState(initialSalaryHistory);
  const [selectedClientId, setSelectedClientId] = useState(initialClients[0].id);
  const [reportClientId, setReportClientId] = useState(initialClients[0].id);
  const [conceptForm, setConceptForm] = useState({ concept: '', amount: '', dueDay: '10' });
  const [paymentForm, setPaymentForm] = useState({
    clientId: initialClients[0].id,
    concept: 'Honorarios',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    method: 'Transferencia',
    receipt: '',
  });
  const [employeeForm, setEmployeeForm] = useState({ name: '', role: '', commissionRate: '10' });
  const [salaryForm, setSalaryForm] = useState({
    employeeId: initialEmployees[0].id,
    month: '2026-04',
    baseSalary: '',
    paidAmount: '',
    date: new Date().toISOString().slice(0, 10),
    method: 'Transferencia',
    notes: '',
  });

  const selectedClient = clients.find((client) => client.id === Number(selectedClientId)) ?? clients[0];

  const honorariosCollected = useMemo(
    () =>
      payments
        .filter((payment) => payment.concept === 'Honorarios')
        .reduce((total, payment) => total + payment.amount, 0),
    [payments],
  );

  const dashboard = useMemo(() => {
    const totalCharges = charges.reduce((total, charge) => total + charge.amount, 0);
    const totalPayments = payments.reduce((total, payment) => total + payment.amount, 0);
    const pendingByClient = clients.filter((client) => {
      const charged = charges
        .filter((charge) => charge.clientId === client.id)
        .reduce((total, charge) => total + charge.amount, 0);
      const paid = payments
        .filter((payment) => payment.clientId === client.id)
        .reduce((total, payment) => total + payment.amount, 0);

      return charged - paid > 0;
    }).length;

    return {
      collectedThisMonth: totalPayments,
      pendingBalance: totalCharges - totalPayments,
      pendingByClient,
      recurringConcepts: clients.reduce(
        (total, client) => total + client.defaultConcepts.filter((concept) => concept.active).length,
        0,
      ),
    };
  }, [charges, clients, payments]);

  const reportRows = useMemo(() => {
    const rows = [
      ...charges
        .filter((charge) => charge.clientId === Number(reportClientId))
        .map((charge) => ({ ...charge, type: 'Debito', debit: charge.amount, credit: 0 })),
      ...payments
        .filter((payment) => payment.clientId === Number(reportClientId))
        .map((payment) => ({ ...payment, type: 'Pago', debit: 0, credit: payment.amount })),
    ];

    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, [charges, payments, reportClientId]);

  const reportBalance = reportRows.reduce((total, row) => total + row.debit - row.credit, 0);

  function handleAddConcept(event) {
    event.preventDefault();

    const concept = conceptForm.concept.trim();
    const amount = Number(conceptForm.amount);
    const dueDay = Number(conceptForm.dueDay);

    if (!concept || !amount || !dueDay) return;

    setClients((currentClients) =>
      currentClients.map((client) =>
        client.id === selectedClient.id
          ? {
              ...client,
              defaultConcepts: [
                ...client.defaultConcepts,
                { id: Date.now(), concept, amount, dueDay, active: true },
              ],
            }
          : client,
      ),
    );
    setConceptForm({ concept: '', amount: '', dueDay: '10' });
  }

  function handleConceptAmountChange(conceptId, amount) {
    setClients((currentClients) =>
      currentClients.map((client) =>
        client.id === selectedClient.id
          ? {
              ...client,
              defaultConcepts: client.defaultConcepts.map((concept) =>
                concept.id === conceptId ? { ...concept, amount: Number(amount) } : concept,
              ),
            }
          : client,
      ),
    );
  }

  function handleToggleConcept(conceptId) {
    setClients((currentClients) =>
      currentClients.map((client) =>
        client.id === selectedClient.id
          ? {
              ...client,
              defaultConcepts: client.defaultConcepts.map((concept) =>
                concept.id === conceptId ? { ...concept, active: !concept.active } : concept,
              ),
            }
          : client,
      ),
    );
  }

  function handleCreateCharge(concept) {
    setCharges((currentCharges) => [
      ...currentCharges,
      {
        id: Date.now(),
        clientId: selectedClient.id,
        date: new Date().toISOString().slice(0, 10),
        concept: concept.concept,
        amount: concept.amount,
      },
    ]);
  }

  function handleRegisterPayment(event) {
    event.preventDefault();

    const amount = Number(paymentForm.amount);
    if (!amount) return;

    setPayments((currentPayments) => [
      ...currentPayments,
      {
        id: Date.now(),
        clientId: Number(paymentForm.clientId),
        date: paymentForm.date,
        concept: paymentForm.concept,
        amount,
        method: paymentForm.method,
        receipt: paymentForm.receipt,
      },
    ]);

    setPaymentForm((currentForm) => ({ ...currentForm, amount: '', receipt: '' }));
  }

  function handleAddEmployee(event) {
    event.preventDefault();

    const name = employeeForm.name.trim();
    const role = employeeForm.role.trim();
    const commissionRate = Number(employeeForm.commissionRate) / 100;

    if (!name || !role || Number.isNaN(commissionRate)) return;

    const employee = { id: Date.now(), name, role, commissionRate };
    setEmployees((currentEmployees) => [...currentEmployees, employee]);
    setSalaryForm((currentForm) => ({ ...currentForm, employeeId: employee.id }));
    setEmployeeForm({ name: '', role: '', commissionRate: '10' });
  }

  function handleRegisterSalary(event) {
    event.preventDefault();

    const employee = employees.find((item) => item.id === Number(salaryForm.employeeId));
    if (!employee) return;

    const baseSalary = Number(salaryForm.baseSalary);
    const variableAmount = Math.round(honorariosCollected * employee.commissionRate);
    const paidAmount = Number(salaryForm.paidAmount || baseSalary + variableAmount);

    if (!baseSalary || !paidAmount) return;

    setSalaryHistory((currentHistory) => [
      ...currentHistory,
      {
        id: Date.now(),
        employeeId: employee.id,
        month: salaryForm.month,
        baseSalary,
        honorariosBase: honorariosCollected,
        variableAmount,
        paidAmount,
        date: salaryForm.date,
        method: salaryForm.method,
        notes: salaryForm.notes,
      },
    ]);

    setSalaryForm((currentForm) => ({ ...currentForm, baseSalary: '', paidAmount: '', notes: '' }));
  }

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: CircleDollarSign },
    { id: 'clients', label: 'Clientes y conceptos', icon: Users },
    { id: 'payments', label: 'Pagos', icon: Banknote },
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'employees', label: 'Empleados', icon: BriefcaseBusiness },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">EC</div>
          <div>
            <strong>Estudio Contable</strong>
            <span>Cuenta corriente</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Principal">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                className={activeSection === item.id ? 'nav-item active' : 'nav-item'}
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                type="button"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="workspace">
        {activeSection === 'dashboard' && (
          <DashboardView
            clients={clients}
            dashboard={dashboard}
            payments={payments}
            charges={charges}
            setActiveSection={setActiveSection}
          />
        )}

        {activeSection === 'clients' && (
          <ClientsView
            clients={clients}
            conceptForm={conceptForm}
            handleAddConcept={handleAddConcept}
            handleConceptAmountChange={handleConceptAmountChange}
            handleCreateCharge={handleCreateCharge}
            handleToggleConcept={handleToggleConcept}
            selectedClient={selectedClient}
            selectedClientId={selectedClientId}
            setConceptForm={setConceptForm}
            setSelectedClientId={setSelectedClientId}
          />
        )}

        {activeSection === 'payments' && (
          <PaymentsView
            clients={clients}
            handleRegisterPayment={handleRegisterPayment}
            paymentForm={paymentForm}
            paymentMethods={paymentMethods}
            payments={payments}
            setPaymentForm={setPaymentForm}
          />
        )}

        {activeSection === 'reports' && (
          <ReportsView
            clients={clients}
            reportBalance={reportBalance}
            reportClientId={reportClientId}
            reportRows={reportRows}
            setReportClientId={setReportClientId}
          />
        )}

        {activeSection === 'employees' && (
          <EmployeesView
            employeeForm={employeeForm}
            employees={employees}
            handleAddEmployee={handleAddEmployee}
            handleRegisterSalary={handleRegisterSalary}
            honorariosCollected={honorariosCollected}
            paymentMethods={paymentMethods}
            salaryForm={salaryForm}
            salaryHistory={salaryHistory}
            setEmployeeForm={setEmployeeForm}
            setSalaryForm={setSalaryForm}
          />
        )}
      </section>
    </main>
  );
}

function DashboardView({ clients, dashboard, payments, charges, setActiveSection }) {
  const latestMovements = [
    ...charges.map((charge) => ({ ...charge, movementType: 'Debito' })),
    ...payments.map((payment) => ({ ...payment, movementType: 'Pago' })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const metrics = [
    {
      label: 'Saldo pendiente',
      value: formatCurrency(dashboard.pendingBalance),
      detail: `${dashboard.pendingByClient} clientes con deuda`,
      icon: CircleDollarSign,
    },
    {
      label: 'Cobrado registrado',
      value: formatCurrency(dashboard.collectedThisMonth),
      detail: `${payments.length} pagos cargados`,
      icon: Banknote,
    },
    {
      label: 'Conceptos activos',
      value: dashboard.recurringConcepts,
      detail: 'Importes por defecto por cliente',
      icon: CalendarDays,
    },
  ];

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Panel inicial</p>
          <h1>Cuenta corriente de clientes</h1>
        </div>
        <button className="primary-button" onClick={() => setActiveSection('payments')} type="button">
          <Plus size={18} />
          Registrar pago
        </button>
      </header>

      <section className="metric-grid" aria-label="Resumen">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article className="metric-card" key={metric.label}>
              <div className="metric-icon">
                <Icon size={20} />
              </div>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="content-grid">
        <article className="panel movements-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Ultimos registros</p>
              <h2>Movimientos recientes</h2>
            </div>
            <button className="icon-button" onClick={() => setActiveSection('clients')} type="button" aria-label="Cargar debito">
              <ReceiptText size={18} />
            </button>
          </div>

          <div className="movement-list">
            {latestMovements.map((movement) => (
              <div className="movement-row" key={`${movement.movementType}-${movement.id}`}>
                <div>
                  <strong>{getClientName(clients, movement.clientId)}</strong>
                  <span>
                    {movement.date} - {movement.concept}
                  </span>
                </div>
                <div className="movement-meta">
                  <strong>{formatCurrency(movement.amount)}</strong>
                  <span className={movement.movementType === 'Pago' ? 'badge paid' : 'badge'}>
                    {movement.movementType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel action-panel">
          <p className="eyebrow">Flujo sugerido</p>
          <h2>Definir conceptos, cobrar e imprimir saldo</h2>
          <div className="quick-actions">
            <button className="secondary-button" onClick={() => setActiveSection('clients')} type="button">
              Conceptos por cliente
            </button>
            <button className="secondary-button" onClick={() => setActiveSection('reports')} type="button">
              Reporte imprimible
            </button>
            <button className="secondary-button" onClick={() => setActiveSection('employees')} type="button">
              Sueldos del estudio
            </button>
          </div>
        </article>
      </section>
    </>
  );
}

function ClientsView({
  clients,
  conceptForm,
  handleAddConcept,
  handleConceptAmountChange,
  handleCreateCharge,
  handleToggleConcept,
  selectedClient,
  selectedClientId,
  setConceptForm,
  setSelectedClientId,
}) {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Clientes</p>
          <h1>Conceptos e importes por defecto</h1>
        </div>
      </header>

      <div className="toolbar">
        <label className="field compact">
          Cliente
          <select value={selectedClientId} onChange={(event) => setSelectedClientId(Number(event.target.value))}>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
        <div className="client-id">
          <span>CUIT</span>
          <strong>{selectedClient.cuit}</strong>
        </div>
      </div>

      <section className="content-grid">
        <article className="panel wide-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Base de cobro</p>
              <h2>{selectedClient.name}</h2>
            </div>
          </div>

          <div className="table-list">
            {selectedClient.defaultConcepts.map((item) => (
              <div className="table-row concept-row" key={item.id}>
                <div>
                  <strong>{item.concept}</strong>
                  <span>Vence dia {item.dueDay}</span>
                </div>
                <input
                  aria-label={`Importe ${item.concept}`}
                  className="amount-input"
                  min="0"
                  onChange={(event) => handleConceptAmountChange(item.id, event.target.value)}
                  type="number"
                  value={item.amount}
                />
                <button className={item.active ? 'status-toggle on' : 'status-toggle'} onClick={() => handleToggleConcept(item.id)} type="button">
                  {item.active ? 'Activo' : 'Inactivo'}
                </button>
                <button className="secondary-button" onClick={() => handleCreateCharge(item)} type="button">
                  Generar debito
                </button>
              </div>
            ))}
          </div>
        </article>

        <form className="panel form-panel" onSubmit={handleAddConcept}>
          <p className="eyebrow">Nuevo concepto</p>
          <h2>Agregar importe recurrente</h2>
          <label className="field">
            Concepto
            <input
              onChange={(event) => setConceptForm({ ...conceptForm, concept: event.target.value })}
              placeholder="Ej. Pago de IVA"
              value={conceptForm.concept}
            />
          </label>
          <label className="field">
            Importe
            <input
              min="0"
              onChange={(event) => setConceptForm({ ...conceptForm, amount: event.target.value })}
              placeholder="0"
              type="number"
              value={conceptForm.amount}
            />
          </label>
          <label className="field">
            Dia de vencimiento
            <input
              max="31"
              min="1"
              onChange={(event) => setConceptForm({ ...conceptForm, dueDay: event.target.value })}
              type="number"
              value={conceptForm.dueDay}
            />
          </label>
          <button className="primary-button" type="submit">
            <Save size={18} />
            Guardar concepto
          </button>
        </form>
      </section>
    </>
  );
}

function PaymentsView({ clients, handleRegisterPayment, paymentForm, paymentMethods, payments, setPaymentForm }) {
  const selectedClient = clients.find((client) => client.id === Number(paymentForm.clientId)) ?? clients[0];

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Pagos</p>
          <h1>Registrar cobros del estudio</h1>
        </div>
      </header>

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleRegisterPayment}>
          <p className="eyebrow">Imputacion</p>
          <h2>Nuevo pago</h2>
          <label className="field">
            Cliente
            <select
              value={paymentForm.clientId}
              onChange={(event) =>
                setPaymentForm({
                  ...paymentForm,
                  clientId: Number(event.target.value),
                  concept:
                    clients.find((client) => client.id === Number(event.target.value))?.defaultConcepts[0]
                      ?.concept ?? 'Honorarios',
                })
              }
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Concepto
            <select
              value={paymentForm.concept}
              onChange={(event) => setPaymentForm({ ...paymentForm, concept: event.target.value })}
            >
              {selectedClient.defaultConcepts.map((item) => (
                <option key={item.id} value={item.concept}>
                  {item.concept}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label className="field">
              Importe
              <input
                min="0"
                onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })}
                placeholder="0"
                type="number"
                value={paymentForm.amount}
              />
            </label>
            <label className="field">
              Fecha
              <input
                onChange={(event) => setPaymentForm({ ...paymentForm, date: event.target.value })}
                type="date"
                value={paymentForm.date}
              />
            </label>
          </div>
          <label className="field">
            Medio de pago
            <select
              value={paymentForm.method}
              onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })}
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Comprobante
            <input
              onChange={(event) => setPaymentForm({ ...paymentForm, receipt: event.target.value })}
              placeholder="Opcional"
              value={paymentForm.receipt}
            />
          </label>
          <button className="primary-button" type="submit">
            <Banknote size={18} />
            Registrar pago
          </button>
        </form>

        <article className="panel wide-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Historial</p>
              <h2>Cobros discriminados</h2>
            </div>
          </div>
          <div className="table-list">
            {payments.map((payment) => (
              <div className="table-row payment-row" key={payment.id}>
                <div>
                  <strong>{getClientName(clients, payment.clientId)}</strong>
                  <span>
                    {payment.date} - {payment.concept}
                  </span>
                </div>
                <span>{payment.method}</span>
                <strong>{formatCurrency(payment.amount)}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function ReportsView({ clients, reportBalance, reportClientId, reportRows, setReportClientId }) {
  return (
    <>
      <header className="topbar print-hidden">
        <div>
          <p className="eyebrow">Reportes</p>
          <h1>Detalle imprimible de deuda y saldo</h1>
        </div>
        <button className="primary-button" onClick={() => window.print()} type="button">
          <Printer size={18} />
          Imprimir
        </button>
      </header>

      <div className="toolbar print-hidden">
        <label className="field compact">
          Cliente
          <select value={reportClientId} onChange={(event) => setReportClientId(Number(event.target.value))}>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <article className="panel report-sheet">
        <div className="report-heading">
          <div>
            <p className="eyebrow">Estado de cuenta</p>
            <h2>{getClientName(clients, reportClientId)}</h2>
          </div>
          <div>
            <span>Saldo</span>
            <strong>{formatCurrency(reportBalance)}</strong>
          </div>
        </div>

        <div className="report-table">
          <div className="report-table-head">
            <span>Fecha</span>
            <span>Concepto</span>
            <span>Tipo</span>
            <span>Debito</span>
            <span>Credito</span>
          </div>
          {reportRows.map((row) => (
            <div className="report-table-row" key={`${row.type}-${row.id}`}>
              <span>{row.date}</span>
              <strong>{row.concept}</strong>
              <span>{row.type}</span>
              <span>{row.debit ? formatCurrency(row.debit) : '-'}</span>
              <span>{row.credit ? formatCurrency(row.credit) : '-'}</span>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}

function EmployeesView({
  employeeForm,
  employees,
  handleAddEmployee,
  handleRegisterSalary,
  honorariosCollected,
  paymentMethods,
  salaryForm,
  salaryHistory,
  setEmployeeForm,
  setSalaryForm,
}) {
  const selectedEmployee = employees.find((employee) => employee.id === Number(salaryForm.employeeId)) ?? employees[0];
  const suggestedVariable = Math.round(honorariosCollected * selectedEmployee.commissionRate);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Empleados</p>
          <h1>Sueldos e historial de cobro</h1>
        </div>
      </header>

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleAddEmployee}>
          <p className="eyebrow">Legajo</p>
          <h2>Registrar empleado</h2>
          <label className="field">
            Nombre
            <input
              onChange={(event) => setEmployeeForm({ ...employeeForm, name: event.target.value })}
              placeholder="Nombre y apellido"
              value={employeeForm.name}
            />
          </label>
          <label className="field">
            Puesto
            <input
              onChange={(event) => setEmployeeForm({ ...employeeForm, role: event.target.value })}
              placeholder="Ej. Administracion"
              value={employeeForm.role}
            />
          </label>
          <label className="field">
            Porcentaje sobre honorarios cobrados
            <input
              min="0"
              onChange={(event) => setEmployeeForm({ ...employeeForm, commissionRate: event.target.value })}
              type="number"
              value={employeeForm.commissionRate}
            />
          </label>
          <button className="primary-button" type="submit">
            <Plus size={18} />
            Agregar empleado
          </button>
        </form>

        <form className="panel form-panel" onSubmit={handleRegisterSalary}>
          <p className="eyebrow">Liquidacion</p>
          <h2>Registrar pago de sueldo</h2>
          <label className="field">
            Empleado
            <select
              value={salaryForm.employeeId}
              onChange={(event) => setSalaryForm({ ...salaryForm, employeeId: Number(event.target.value) })}
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>
          <div className="salary-base">
            <span>Honorarios cobrados considerados</span>
            <strong>{formatCurrency(honorariosCollected)}</strong>
            <span>Variable sugerido: {formatCurrency(suggestedVariable)}</span>
          </div>
          <div className="form-grid">
            <label className="field">
              Mes
              <input
                onChange={(event) => setSalaryForm({ ...salaryForm, month: event.target.value })}
                type="month"
                value={salaryForm.month}
              />
            </label>
            <label className="field">
              Sueldo base
              <input
                min="0"
                onChange={(event) => setSalaryForm({ ...salaryForm, baseSalary: event.target.value })}
                placeholder="0"
                type="number"
                value={salaryForm.baseSalary}
              />
            </label>
          </div>
          <div className="form-grid">
            <label className="field">
              Total pagado
              <input
                min="0"
                onChange={(event) => setSalaryForm({ ...salaryForm, paidAmount: event.target.value })}
                placeholder={formatCurrency(Number(salaryForm.baseSalary || 0) + suggestedVariable)}
                type="number"
                value={salaryForm.paidAmount}
              />
            </label>
            <label className="field">
              Medio
              <select
                value={salaryForm.method}
                onChange={(event) => setSalaryForm({ ...salaryForm, method: event.target.value })}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            Observaciones
            <input
              onChange={(event) => setSalaryForm({ ...salaryForm, notes: event.target.value })}
              placeholder="Opcional"
              value={salaryForm.notes}
            />
          </label>
          <button className="primary-button" type="submit">
            <Save size={18} />
            Registrar sueldo
          </button>
        </form>
      </section>

      <section className="panel full-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Historial</p>
            <h2>Pagos de sueldos</h2>
          </div>
        </div>
        <div className="table-list">
          {salaryHistory.map((salary) => (
            <div className="table-row salary-row" key={salary.id}>
              <div>
                <strong>{employees.find((employee) => employee.id === salary.employeeId)?.name}</strong>
                <span>
                  {salary.month} - Base {formatCurrency(salary.baseSalary)} + variable{' '}
                  {formatCurrency(salary.variableAmount)}
                </span>
              </div>
              <span>{salary.method}</span>
              <strong>{formatCurrency(salary.paidAmount)}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export { App };
