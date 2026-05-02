import { Printer } from 'lucide-react';
import { formatCurrency, getClientName } from '../utils/formatters.js';

export function ReportsView({ clients, report, reportClientId, setReportClientId }) {
  const rows = report?.rows ?? [];
  const balance = report?.balance ?? 0;

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
          <select
            disabled={clients.length === 0}
            value={reportClientId}
            onChange={(event) => setReportClientId(Number(event.target.value))}
          >
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
            <strong>{formatCurrency(balance)}</strong>
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
          {rows.map((row) => (
            <div className="report-table-row" key={`${row.type}-${row.id}`}>
              <span>{row.date}</span>
              <strong>{row.concept}</strong>
              <span>{row.type}</span>
              <span>{row.debit ? formatCurrency(row.debit) : '-'}</span>
              <span>{row.credit ? formatCurrency(row.credit) : '-'}</span>
            </div>
          ))}
        </div>
        {rows.length === 0 && <p className="empty-state">No hay movimientos para este cliente.</p>}
      </article>
    </>
  );
}
