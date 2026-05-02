import { Banknote } from 'lucide-react';
import { formatCurrency, getClientName } from '../utils/formatters.js';

export function PaymentsView({
  clients,
  handleRegisterPayment,
  paymentForm,
  paymentMethods,
  payments,
  setPaymentForm,
}) {
  const selectedClient = clients.find((client) => client.id === Number(paymentForm.clientId)) ?? clients[0] ?? null;

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
            {payments.length === 0 && <p className="empty-state">Todavia no hay pagos registrados.</p>}
          </div>
        </article>
      </section>
    </>
  );
}
