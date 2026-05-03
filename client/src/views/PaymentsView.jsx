import { useState } from 'react';
import { ArrowLeft, Banknote, ChevronRight, X } from 'lucide-react';
import { formatCurrency, getClientName } from '../utils/formatters.js';

export function PaymentsView({
  clients,
  handleRegisterPayment,
  lockedClientId,
  onBack,
  paymentForm,
  paymentMethods,
  payments,
  setPaymentForm,
}) {
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  
  const selectedClient =
    clients.find((client) => client.id === Number(lockedClientId ?? paymentForm.clientId)) ?? clients[0] ?? null;
  const visiblePayments = lockedClientId
    ? payments.filter((payment) => payment.clientId === Number(lockedClientId))
    : payments;
  
  const selectedPayment = selectedPaymentId ? visiblePayments.find((p) => p.id === selectedPaymentId) : null;

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Pagos</p>
          <h1>{selectedClient ? `Registrar pago de ${selectedClient.name}` : 'Registrar cobros del estudio'}</h1>
        </div>
        {onBack && (
          <button className="ghost-button" onClick={onBack} type="button">
            <ArrowLeft size={18} />
            Volver al cliente
          </button>
        )}
      </header>

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleRegisterPayment}>
          <p className="eyebrow">Imputacion</p>
          <h2>Nuevo pago</h2>
          {lockedClientId ? (
            <div className="readonly-field">
              <span>Cliente</span>
              <strong>{selectedClient?.name ?? 'Sin cliente'}</strong>
            </div>
          ) : (
            <label className="field">
              Cliente
              <select
                disabled={clients.length === 0}
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
          )}
          <label className="field">
            Concepto
            <select
              value={paymentForm.concept}
              onChange={(event) => setPaymentForm({ ...paymentForm, concept: event.target.value })}
            >
              {selectedClient?.defaultConcepts.map((item) => (
                <option key={item.id} value={item.concept}>
                  {item.concept}
                </option>
              ))}
              {!selectedClient?.defaultConcepts.length && <option value="Honorarios">Honorarios</option>}
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
          <button className="primary-button" disabled={clients.length === 0} type="submit">
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
            {visiblePayments.map((payment) => (
              <button
                className={`table-row payment-row ${selectedPaymentId === payment.id ? 'active' : ''}`}
                key={payment.id}
                onClick={() => setSelectedPaymentId(selectedPaymentId === payment.id ? null : payment.id)}
                type="button"
              >
                <div>
                  <strong>{getClientName(clients, payment.clientId)}</strong>
                  <span>
                    {payment.date} - {payment.concept}
                  </span>
                </div>
                <span>{payment.method}</span>
                <strong>{formatCurrency(payment.amount)}</strong>
                <ChevronRight size={18} className="row-indicator" />
              </button>
            ))}
            {visiblePayments.length === 0 && <p className="empty-state">Todavia no hay pagos registrados.</p>}
          </div>
        </article>

        {selectedPayment && (
          <article className="panel detail-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Detalle</p>
                <h2>Información del pago</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedPaymentId(null)}
                type="button"
                aria-label="Cerrar detalle"
              >
                <X size={18} />
              </button>
            </div>
            <div className="detail-content">
              <div className="detail-row">
                <span className="detail-label">Cliente</span>
                <strong className="detail-value">{getClientName(clients, selectedPayment.clientId)}</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Concepto</span>
                <strong className="detail-value">{selectedPayment.concept}</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fecha</span>
                <strong className="detail-value">{selectedPayment.date}</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Monto</span>
                <strong className="detail-value">{formatCurrency(selectedPayment.amount)}</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Medio de pago</span>
                <strong className="detail-value">{selectedPayment.method}</strong>
              </div>
              {selectedPayment.receipt && (
                <div className="detail-row">
                  <span className="detail-label">Comprobante</span>
                  <strong className="detail-value">{selectedPayment.receipt}</strong>
                </div>
              )}
            </div>
          </article>
        )}
      </section>
    </>
  );
}
