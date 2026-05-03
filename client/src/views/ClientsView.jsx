import { useMemo, useState } from 'react';
import { ArrowLeft, Banknote, FileText, Pencil, Plus, Printer, Save, Trash2, X, ChevronRight } from 'lucide-react';
import { PaymentsView } from './PaymentsView.jsx';
import { formatCurrency, getClientName } from '../utils/formatters.js';

function getClientBalance(clientId, charges, payments) {
  const charged = charges
    .filter((charge) => charge.clientId === clientId)
    .reduce((total, charge) => total + Number(charge.amount), 0);
  const paid = payments
    .filter((payment) => payment.clientId === clientId)
    .reduce((total, payment) => total + Number(payment.amount), 0);

  return charged - paid;
}

function getLatestMovements(charges, payments) {
  return [
    ...charges.map((charge) => ({ ...charge, movementType: 'Debito' })),
    ...payments.map((payment) => ({ ...payment, movementType: 'Pago' })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);
}

export function ClientsView({
  clientForm,
  clientReport,
  clientScreen,
  clients,
  conceptForm,
  charges,
  editingClientId,
  handleAddConcept,
  handleCancelClientForm,
  handleConceptFieldChange,
  handleCreateCharge,
  handleDeleteClient,
  handleEditClient,
  handleGenerateClientReport,
  handleRegisterPayment,
  handleSaveClient,
  handleSelectClient,
  handleShowClientsList,
  handleShowClientReport,
  handleStartClientPayment,
  handleToggleConcept,
  handleStartNewClient,
  handleUpdateConcept,
  isClientReportLoading,
  paymentForm,
  paymentMethods,
  payments,
  resetClientForm,
  selectedClient,
  setClientForm,
  setConceptForm,
  setPaymentForm,
}) {
  if (clientScreen === 'new') {
    return (
      <ClientFormView
        clientForm={clientForm}
        handleCancelClientForm={handleCancelClientForm}
        handleSaveClient={handleSaveClient}
        setClientForm={setClientForm}
      />
    );
  }

  if (clientScreen === 'report') {
    return (
      <ClientReportView
        charges={charges}
        clientReport={clientReport}
        clients={clients}
        handleGenerateClientReport={handleGenerateClientReport}
        handleShowClientsList={handleShowClientsList}
        isClientReportLoading={isClientReportLoading}
        payments={payments}
      />
    );
  }

  if (clientScreen === 'detail' && selectedClient) {
    return (
      <ClientDetailView
        charges={charges}
        clientForm={clientForm}
        conceptForm={conceptForm}
        editingClientId={editingClientId}
        handleAddConcept={handleAddConcept}
        handleConceptFieldChange={handleConceptFieldChange}
        handleCreateCharge={handleCreateCharge}
        handleDeleteClient={handleDeleteClient}
        handleEditClient={handleEditClient}
        handleStartClientPayment={handleStartClientPayment}
        handleSaveClient={handleSaveClient}
        handleSelectClient={handleSelectClient}
        handleShowClientsList={handleShowClientsList}
        handleToggleConcept={handleToggleConcept}
        handleUpdateConcept={handleUpdateConcept}
        payments={payments}
        resetClientForm={resetClientForm}
        selectedClient={selectedClient}
        setClientForm={setClientForm}
        setConceptForm={setConceptForm}
      />
    );
  }

  if (clientScreen === 'payment' && selectedClient) {
    return (
      <PaymentsView
        clients={clients}
        handleRegisterPayment={handleRegisterPayment}
        lockedClientId={selectedClient.id}
        onBack={() => handleSelectClient(selectedClient.id)}
        paymentForm={paymentForm}
        paymentMethods={paymentMethods}
        payments={payments}
        setPaymentForm={setPaymentForm}
      />
    );
  }

  return (
    <ClientsListView
      charges={charges}
      clients={clients}
      handleDeleteClient={handleDeleteClient}
      handleSelectClient={handleSelectClient}
      handleStartNewClient={handleStartNewClient}
      handleShowClientReport={handleShowClientReport}
      payments={payments}
    />
  );
}

function ClientsListView({
  charges,
  clients,
  handleDeleteClient,
  handleSelectClient,
  handleStartNewClient,
  handleShowClientReport,
  payments,
}) {
  const latestMovements = getLatestMovements(charges, payments);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Clientes</p>
          <h1>Clientes</h1>
        </div>
        <div className="button-row">
          <button className="secondary-button" onClick={handleShowClientReport} type="button">
            <FileText size={18} />
            Generar reporte
          </button>
          <button className="primary-button" onClick={handleStartNewClient} type="button">
            <Plus size={18} />
            Agregar cliente
          </button>
        </div>
      </header>

      <section className="content-grid client-home-grid">
        <article className="panel wide-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Listado</p>
              <h2>Clientes registrados</h2>
            </div>
          </div>

          <div className="table-list">
            {clients.map((client) => (
              <div className="table-row client-list-row" key={client.id}>
                <button className="client-select-button" onClick={() => handleSelectClient(client.id)} type="button">
                  <div>
                    <strong>{client.name}</strong>
                    <span>
                      {client.cuit} {client.email ? `- ${client.email}` : ''}
                    </span>
                  </div>
                  <div>
                    <span>Saldo</span>
                    <strong>{formatCurrency(getClientBalance(client.id, charges, payments))}</strong>
                  </div>
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => handleDeleteClient(client.id)}
                  type="button"
                  aria-label={`Eliminar ${client.name}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            {clients.length === 0 && <p className="empty-state">Todavia no hay clientes cargados.</p>}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Actividad</p>
              <h2>Ultimos movimientos</h2>
            </div>
          </div>

          <div className="movement-list">
            {latestMovements.map((movement) => (
              <div className="movement-row compact-movement-row" key={`${movement.movementType}-${movement.id}`}>
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
      </section>
    </>
  );
}

function ClientReportView({
  charges,
  clientReport,
  clients,
  handleGenerateClientReport,
  handleShowClientsList,
  isClientReportLoading,
  payments,
}) {
  const availableConcepts = useMemo(() => {
    const concepts = new Set();
    clients.forEach((client) => client.defaultConcepts.forEach((item) => concepts.add(item.concept)));
    charges.forEach((charge) => concepts.add(charge.concept));
    payments.forEach((payment) => concepts.add(payment.concept));

    return Array.from(concepts).sort((a, b) => a.localeCompare(b));
  }, [charges, clients, payments]);

  const [selectedClientIds, setSelectedClientIds] = useState(() => clients.map((client) => client.id));
  const [selectedConcepts, setSelectedConcepts] = useState([]);
  const [movementTypes, setMovementTypes] = useState(['Debito', 'Pago']);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [outputMode, setOutputMode] = useState('screen');

  const rows = clientReport?.rows ?? [];
  const totals = clientReport?.totals ?? { debit: 0, credit: 0, balance: 0 };
  const printableMode = outputMode === 'printable';

  function toggleValue(value, values, setter) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  function handleSubmit(event) {
    event.preventDefault();

    handleGenerateClientReport({
      clientIds: selectedClientIds,
      concepts: selectedConcepts,
      dateFrom,
      dateTo,
      movementTypes,
    });
  }

  return (
    <>
      <header className="topbar print-hidden">
        <div>
          <p className="eyebrow">Clientes</p>
          <h1>Generar reporte</h1>
        </div>
        <button className="ghost-button" onClick={handleShowClientsList} type="button">
          <ArrowLeft size={18} />
          Volver a clientes
        </button>
      </header>

      <section className="content-grid report-builder-grid print-hidden">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <p className="eyebrow">Filtros</p>
          <h2>Seleccionar informacion</h2>

          <div className="form-grid">
            <label className="field">
              Desde
              <input onChange={(event) => setDateFrom(event.target.value)} type="date" value={dateFrom} />
            </label>
            <label className="field">
              Hasta
              <input onChange={(event) => setDateTo(event.target.value)} type="date" value={dateTo} />
            </label>
          </div>

          <div className="filter-block">
            <div className="panel-header compact-header">
              <strong>Clientes</strong>
              <button
                className="ghost-button compact-button"
                onClick={() =>
                  setSelectedClientIds(
                    selectedClientIds.length === clients.length ? [] : clients.map((client) => client.id),
                  )
                }
                type="button"
              >
                {selectedClientIds.length === clients.length ? 'Limpiar' : 'Todos'}
              </button>
            </div>
            <div className="checkbox-grid">
              {clients.map((client) => (
                <label className="check-option" key={client.id}>
                  <input
                    checked={selectedClientIds.includes(client.id)}
                    onChange={() => toggleValue(client.id, selectedClientIds, setSelectedClientIds)}
                    type="checkbox"
                  />
                  {client.name}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <div className="panel-header compact-header">
              <strong>Conceptos</strong>
              <button className="ghost-button compact-button" onClick={() => setSelectedConcepts([])} type="button">
                Todos
              </button>
            </div>
            <div className="checkbox-grid">
              {availableConcepts.map((concept) => (
                <label className="check-option" key={concept}>
                  <input
                    checked={selectedConcepts.includes(concept)}
                    onChange={() => toggleValue(concept, selectedConcepts, setSelectedConcepts)}
                    type="checkbox"
                  />
                  {concept}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <strong>Tipo de movimiento</strong>
            <div className="checkbox-grid two-cols">
              {['Debito', 'Pago'].map((type) => (
                <label className="check-option" key={type}>
                  <input
                    checked={movementTypes.includes(type)}
                    onChange={() => toggleValue(type, movementTypes, setMovementTypes)}
                    type="checkbox"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <label className="field">
            Salida
            <select onChange={(event) => setOutputMode(event.target.value)} value={outputMode}>
              <option value="screen">Listado en pantalla</option>
              <option value="printable">Imprimible</option>
            </select>
          </label>

          <div className="button-row">
            <button className="primary-button" disabled={isClientReportLoading || movementTypes.length === 0} type="submit">
              <FileText size={18} />
              {isClientReportLoading ? 'Generando...' : 'Generar reporte'}
            </button>
            {printableMode && rows.length > 0 && (
              <button className="secondary-button" onClick={() => window.print()} type="button">
                <Printer size={18} />
                Imprimir
              </button>
            )}
          </div>
        </form>

        <article className="panel action-panel">
          <p className="eyebrow">Resumen</p>
          <h2>Alcance del reporte</h2>
          <div className="report-summary-grid">
            <div>
              <span>Clientes</span>
              <strong>{selectedClientIds.length || 'Todos'}</strong>
            </div>
            <div>
              <span>Conceptos</span>
              <strong>{selectedConcepts.length || 'Todos'}</strong>
            </div>
            <div>
              <span>Movimientos</span>
              <strong>{movementTypes.join(' + ') || '-'}</strong>
            </div>
            <div>
              <span>Formato</span>
              <strong>{printableMode ? 'Imprimible' : 'Pantalla'}</strong>
            </div>
          </div>
        </article>
      </section>

      {clientReport && (
        <article className={printableMode ? 'panel report-sheet client-report-result' : 'panel full-panel client-report-result'}>
          <div className="report-heading">
            <div>
              <p className="eyebrow">Reporte de clientes</p>
              <h2>Movimientos filtrados</h2>
            </div>
            <div>
              <span>Saldo</span>
              <strong>{formatCurrency(totals.balance)}</strong>
            </div>
          </div>

          <div className="report-total-grid">
            <div>
              <span>Debitos</span>
              <strong>{formatCurrency(totals.debit)}</strong>
            </div>
            <div>
              <span>Creditos</span>
              <strong>{formatCurrency(totals.credit)}</strong>
            </div>
            <div>
              <span>Registros</span>
              <strong>{rows.length}</strong>
            </div>
          </div>

          <div className="report-table movement-report-table">
            <div className="report-table-head movement-report-head">
              <span>Fecha</span>
              <span>Cliente</span>
              <span>Concepto</span>
              <span>Tipo</span>
              <span>Debito</span>
              <span>Credito</span>
            </div>
            {rows.map((row) => (
              <div className="report-table-row movement-report-row" key={`${row.type}-${row.id}`}>
                <span>{row.date}</span>
                <strong>{row.clientName}</strong>
                <span>{row.concept}</span>
                <span>{row.type}</span>
                <span>{row.debit ? formatCurrency(row.debit) : '-'}</span>
                <span>{row.credit ? formatCurrency(row.credit) : '-'}</span>
              </div>
            ))}
          </div>
          {rows.length === 0 && <p className="empty-state">No hay movimientos para los filtros seleccionados.</p>}
        </article>
      )}
    </>
  );
}

function ClientFormView({ clientForm, handleCancelClientForm, handleSaveClient, setClientForm }) {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Clientes</p>
          <h1>Nuevo cliente</h1>
        </div>
        <button className="ghost-button" onClick={handleCancelClientForm} type="button">
          <ArrowLeft size={18} />
          Volver
        </button>
      </header>

      <form className="panel form-panel client-form-page" onSubmit={handleSaveClient}>
        <p className="eyebrow">Alta de cliente</p>
        <h2>Registrar cliente</h2>
        <div className="form-grid">
          <label className="field">
            Razon social / nombre
            <input
              onChange={(event) => setClientForm({ ...clientForm, name: event.target.value })}
              placeholder="Ej. Alvarez & Asociados"
              value={clientForm.name}
            />
          </label>
          <label className="field">
            CUIT
            <input
              onChange={(event) => setClientForm({ ...clientForm, cuit: event.target.value })}
              placeholder="30-00000000-0"
              value={clientForm.cuit}
            />
          </label>
        </div>
        <div className="form-grid">
          <label className="field">
            Email
            <input
              onChange={(event) => setClientForm({ ...clientForm, email: event.target.value })}
              placeholder="administracion@cliente.com"
              type="email"
              value={clientForm.email}
            />
          </label>
          <label className="field">
            Telefono
            <input
              onChange={(event) => setClientForm({ ...clientForm, phone: event.target.value })}
              placeholder="11 4000-0000"
              value={clientForm.phone}
            />
          </label>
        </div>
        <div className="button-row">
          <button className="primary-button" type="submit">
            <Save size={18} />
            Guardar cliente
          </button>
          <button className="ghost-button" onClick={handleCancelClientForm} type="button">
            <X size={18} />
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}

function ClientDetailView({
  charges,
  clientForm,
  conceptForm,
  editingClientId,
  handleAddConcept,
  handleConceptFieldChange,
  handleCreateCharge,
  handleDeleteClient,
  handleEditClient,
  handleStartClientPayment,
  handleSaveClient,
  handleSelectClient,
  handleShowClientsList,
  handleToggleConcept,
  handleUpdateConcept,
  payments,
  resetClientForm,
  selectedClient,
  setClientForm,
  setConceptForm,
}) {
  const isEditingClient = editingClientId === selectedClient.id;
  const [showAddConceptForm, setShowAddConceptForm] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const clientPayments = payments.filter((p) => p.clientId === selectedClient.id);
  const clientCharges = charges.filter((c) => c.clientId === selectedClient.id);
  const allMovements = [
    ...clientCharges.map((charge) => ({ ...charge, movementType: 'Debito' })),
    ...clientPayments.map((payment) => ({ ...payment, movementType: 'Pago' })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const selectedPayment = selectedPaymentId ? allMovements.find((m) => m.id === selectedPaymentId) : null;

  function handleCloseAddConceptForm() {
    setShowAddConceptForm(false);
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Clientes</p>
          <h1>{selectedClient.name}</h1>
        </div>
        <button className="ghost-button" onClick={handleShowClientsList} type="button">
          <ArrowLeft size={18} />
          Volver al listado
        </button>
      </header>

      <section className="content-grid">
        <article className="panel wide-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Detalle</p>
              <h2>Datos del cliente</h2>
            </div>
            {!isEditingClient && (
              <div className="row-actions">
                <button
                  className="secondary-button"
                  onClick={() => handleStartClientPayment(selectedClient.id)}
                  type="button"
                >
                  <Banknote size={18} />
                  Registrar pago
                </button>
                <button className="icon-button" onClick={() => handleEditClient(selectedClient)} type="button" aria-label="Editar cliente">
                  <Pencil size={17} />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => handleDeleteClient(selectedClient.id)}
                  type="button"
                  aria-label="Eliminar cliente"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )}
          </div>

          {isEditingClient ? (
            <form className="form-panel inline-form-panel" onSubmit={handleSaveClient}>
              <div className="form-grid">
                <label className="field">
                  Razon social / nombre
                  <input
                    onChange={(event) => setClientForm({ ...clientForm, name: event.target.value })}
                    value={clientForm.name}
                  />
                </label>
                <label className="field">
                  CUIT
                  <input
                    onChange={(event) => setClientForm({ ...clientForm, cuit: event.target.value })}
                    value={clientForm.cuit}
                  />
                </label>
              </div>
              <div className="form-grid">
                <label className="field">
                  Email
                  <input
                    onChange={(event) => setClientForm({ ...clientForm, email: event.target.value })}
                    type="email"
                    value={clientForm.email}
                  />
                </label>
                <label className="field">
                  Telefono
                  <input
                    onChange={(event) => setClientForm({ ...clientForm, phone: event.target.value })}
                    value={clientForm.phone}
                  />
                </label>
              </div>
              <div className="button-row">
                <button className="primary-button" type="submit">
                  <Save size={18} />
                  Guardar cambios
                </button>
                <button className="ghost-button" onClick={resetClientForm} type="button">
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="detail-grid">
              <div>
                <span>CUIT</span>
                <strong>{selectedClient.cuit}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{selectedClient.email || '-'}</strong>
              </div>
              <div>
                <span>Telefono</span>
                <strong>{selectedClient.phone || '-'}</strong>
              </div>
              <div>
                <span>Conceptos activos</span>
                <strong>{selectedClient.defaultConcepts.filter((concept) => concept.active).length}</strong>
              </div>
            </div>
          )}
        </article>

        {showAddConceptForm ? (
          <form className="panel form-panel" onSubmit={(e) => {
            handleAddConcept(e);
            handleCloseAddConceptForm();
          }}>
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
            <div className="button-row">
              <button className="primary-button" type="submit">
                <Save size={18} />
                Guardar concepto
              </button>
              <button 
                className="ghost-button" 
                onClick={handleCloseAddConceptForm} 
                type="button"
              >
                <X size={18} />
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <article className="panel action-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Nuevo concepto</p>
                <h2>Agregar importe recurrente</h2>
              </div>
            </div>
            <button 
              className="primary-button full-width-button"
              onClick={() => setShowAddConceptForm(true)}
              type="button"
            >
              <Plus size={18} />
              Agregar concepto recurrente
            </button>
          </article>
        )}
      </section>

      <section className="panel full-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Base de cobro</p>
            <h2>Conceptos de {selectedClient.name}</h2>
          </div>
        </div>

        <div className="table-list">
          {selectedClient.defaultConcepts.map((item) => (
            <div className="table-row concept-detail-row" key={item.id}>
              <input
                aria-label={`Concepto ${item.concept}`}
                onBlur={() => handleUpdateConcept(item.id, { concept: item.concept })}
                onChange={(event) => handleConceptFieldChange(item.id, 'concept', event.target.value)}
                value={item.concept}
              />
              <input
                aria-label={`Importe ${item.concept}`}
                min="0"
                onBlur={() => handleUpdateConcept(item.id, { amount: Number(item.amount) })}
                onChange={(event) => handleConceptFieldChange(item.id, 'amount', event.target.value)}
                type="number"
                value={item.amount}
              />
              <input
                aria-label={`Vencimiento ${item.concept}`}
                max="31"
                min="1"
                onBlur={() => handleUpdateConcept(item.id, { dueDay: Number(item.dueDay) })}
                onChange={(event) => handleConceptFieldChange(item.id, 'dueDay', event.target.value)}
                type="number"
                value={item.dueDay}
              />
              <button className={item.active ? 'status-toggle on' : 'status-toggle'} onClick={() => handleToggleConcept(item.id)} type="button">
                {item.active ? 'Activo' : 'Inactivo'}
              </button>
              <button className="secondary-button" onClick={() => handleCreateCharge(item)} type="button">
                Generar debito
              </button>
            </div>
          ))}
          {selectedClient.defaultConcepts.length === 0 && (
            <p className="empty-state">Este cliente todavia no tiene conceptos recurrentes.</p>
          )}
        </div>
      </section>

      <section className="panel full-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Historial</p>
            <h2>Cobros discriminados</h2>
          </div>
        </div>

        <div className="table-list">
          {allMovements.map((movement) => (
            <button
              className={`table-row payment-row ${selectedPaymentId === movement.id ? 'active' : ''}`}
              key={`${movement.movementType}-${movement.id}`}
              onClick={() => setSelectedPaymentId(selectedPaymentId === movement.id ? null : movement.id)}
              type="button"
            >
              <div>
                <strong>{movement.concept}</strong>
                <span>{movement.date}</span>
              </div>
              <span className={movement.movementType === 'Pago' ? 'badge paid' : 'badge'}>
                {movement.movementType}
              </span>
              <strong>{formatCurrency(movement.amount)}</strong>
              <ChevronRight size={18} className="row-indicator" />
            </button>
          ))}
          {allMovements.length === 0 && <p className="empty-state">Este cliente todavia no tiene movimientos.</p>}
        </div>

        {selectedPayment && (
          <div className="detail-panel-inline">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Detalle</p>
                <h2>Información del movimiento</h2>
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
                <span className="detail-label">Tipo</span>
                <strong className="detail-value">{selectedPayment.movementType}</strong>
              </div>
              {selectedPayment.method && (
                <div className="detail-row">
                  <span className="detail-label">Medio de pago</span>
                  <strong className="detail-value">{selectedPayment.method}</strong>
                </div>
              )}
              {selectedPayment.receipt && (
                <div className="detail-row">
                  <span className="detail-label">Comprobante</span>
                  <strong className="detail-value">{selectedPayment.receipt}</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
