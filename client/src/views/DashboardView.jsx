import { useState } from 'react';
import { Banknote, CalendarDays, CircleDollarSign, Plus, ReceiptText } from 'lucide-react';
import { MetricCard } from '../components/MetricCard.jsx';
import { formatCurrency, getClientName, getMovementPaymentMethod } from '../utils/formatters.js';
import { MovementDetailModal } from './ClientsView.jsx';

export function DashboardView({ charges, clients, dashboard, payments, setActiveSection }) {
  const latestMovements = [
    ...charges.map((charge) => ({ ...charge, movementType: 'Debito' })),
    ...payments.map((payment) => ({ ...payment, movementType: 'Pago' })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  const [selectedMovementId, setSelectedMovementId] = useState(null);
  const selectedMovement = selectedMovementId
    ? latestMovements.find((movement) => `${movement.movementType}-${movement.id}` === selectedMovementId)
    : null;

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
        <button className="primary-button" onClick={() => setActiveSection('clients')} type="button">
          <Plus size={18} />
          Ver clientes
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
            {latestMovements.length > 0 && (
              <div className="movement-list-head" aria-hidden="true">
                <span>Nombre y apellido</span>
                <span>Importe</span>
                <span>Medio de pago</span>
              </div>
            )}
            {latestMovements.map((movement) => (
              <button
                className="movement-row movement-button movement-record-row"
                key={`${movement.movementType}-${movement.id}`}
                onClick={() => setSelectedMovementId(`${movement.movementType}-${movement.id}`)}
                type="button"
              >
                <div>
                  <strong>{getClientName(clients, movement.clientId)}</strong>
                  <span>
                    {movement.date} - {movement.concept}
                  </span>
                </div>
                <strong>{formatCurrency(movement.amount)}</strong>
                <span className="payment-method-cell">{getMovementPaymentMethod(movement)}</span>
              </button>
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
            <button className="secondary-button" onClick={() => setActiveSection('clients')} type="button">
              Reportes de clientes
            </button>
            <button className="secondary-button" onClick={() => setActiveSection('employees')} type="button">
              Sueldos del estudio
            </button>
          </div>
        </article>
      </section>

      {selectedMovement && (
        <MovementDetailModal movement={selectedMovement} onClose={() => setSelectedMovementId(null)} />
      )}
    </>
  );
}
