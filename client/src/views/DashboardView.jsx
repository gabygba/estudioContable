import { Banknote, CalendarDays, CircleDollarSign, Plus, ReceiptText } from 'lucide-react';
import { MetricCard } from '../components/MetricCard.jsx';
import { formatCurrency, getClientName } from '../utils/formatters.js';

export function DashboardView({ charges, clients, dashboard, payments, setActiveSection }) {
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
      detail: `${dashboard.clientsWithDebt ?? 0} clientes con deuda`,
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
      value: dashboard.upcomingDueDates ?? 0,
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
        {metrics.map((metric) => (
          <MetricCard {...metric} key={metric.label} />
        ))}
      </section>

      <section className="content-grid">
        <article className="panel movements-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Ultimos registros</p>
              <h2>Movimientos recientes</h2>
            </div>
            <button
              className="icon-button"
              onClick={() => setActiveSection('clients')}
              type="button"
              aria-label="Cargar debito"
            >
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
            {latestMovements.length === 0 && <p className="empty-state">Todavia no hay movimientos.</p>}
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
