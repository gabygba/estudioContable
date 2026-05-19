import { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ArrowLeft, Banknote, CircleDollarSign, CalendarDays, FileText, Pencil, Plus, Printer, Save, Trash2, X } from 'lucide-react';
import { PaymentsView } from './PaymentsView.jsx';
import { formatCurrency, getClientName, getMovementPaymentMethod, getMovementPaymentMethodTone } from '../utils/formatters.js';
import { MetricCard } from '../components/MetricCard.jsx';

export function useOverflowToggle(isExpanded, dependencies = []) {
  const [canToggle, setCanToggle] = useState(false);
  const listRef = useRef(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    const updateOverflowState = () => {
      if (isExpanded) return;
      setCanToggle(list.scrollHeight > list.clientHeight + 1);
    };

    updateOverflowState();
    window.addEventListener('resize', updateOverflowState);

    if (typeof ResizeObserver === 'undefined') {
      return () => window.removeEventListener('resize', updateOverflowState);
    }

    const observer = new ResizeObserver(updateOverflowState);
    observer.observe(list);

    return () => {
      window.removeEventListener('resize', updateOverflowState);
      observer.disconnect();
    };
  }, [isExpanded, ...dependencies]);

  return { canToggle, listRef };
}

export function useAvailableViewportHeight(dependencies = []) {
  const [availableHeight, setAvailableHeight] = useState(null);
  const panelRef = useRef(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;

    const updateAvailableHeight = () => {
      const { top } = panel.getBoundingClientRect();
      setAvailableHeight(Math.max(220, window.innerHeight - top - 32));
    };

    updateAvailableHeight();
    window.addEventListener('resize', updateAvailableHeight);

    return () => window.removeEventListener('resize', updateAvailableHeight);
  }, dependencies);

  return { availableHeight, panelRef };
}

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
  handleDeleteClient,
  handleEditClient,
  handleGenerateClientReport,
  handleRegisterPayment,
  handleSaveClient,
  handleSelectClient,
  handleShowClientsList,
  handleShowClientReport,
  handleStartClientPayment,
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
        handleDeleteClient={handleDeleteClient}
        handleEditClient={handleEditClient}
        handleStartClientPayment={handleStartClientPayment}
        handleSaveClient={handleSaveClient}
        handleSelectClient={handleSelectClient}
        handleShowClientsList={handleShowClientsList}
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
  const [selectedMovementId, setSelectedMovementId] = useState(null);
  const [isClientsCollapsed, setIsClientsCollapsed] = useState(true);
  const [isActivityCollapsed, setIsActivityCollapsed] = useState(true);
  const { availableHeight: clientsPanelHeight, panelRef: clientsPanelRef } = useAvailableViewportHeight([
    clients.length,
  ]);
  const { availableHeight: clientHomePanelHeight, panelRef: activityPanelRef } = useAvailableViewportHeight([
    latestMovements.length,
  ]);
  const { canToggle: canToggleClients, listRef: clientsListRef } = useOverflowToggle(!isClientsCollapsed, [
    clients.length,
    clientsPanelHeight,
  ]);
  const { canToggle: canToggleActivity, listRef: activityListRef } = useOverflowToggle(!isActivityCollapsed, [
    latestMovements.length,
    clientHomePanelHeight,
  ]);
  const selectedMovement = selectedMovementId
    ? latestMovements.find((movement) => `${movement.movementType}-${movement.id}` === selectedMovementId)
    : null;

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

      <section className="metric-grid" aria-label="Resumen">
        {(() => {
          const totalPending = clients.reduce((sum, client) => sum + Math.max(0, getClientBalance(client.id, charges, payments)), 0);
          const clientsWithDebt = clients.filter((c) => getClientBalance(c.id, charges, payments) > 0).length;
          const collected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
          const activeConcepts = clients.reduce((sum, c) => sum + (Array.isArray(c.defaultConcepts) ? c.defaultConcepts.filter((d) => d.active).length : 0), 0);

          const metrics = [
            { label: 'Saldo pendiente', value: formatCurrency(totalPending), detail: `${clientsWithDebt} clientes con deuda`, icon: CircleDollarSign },
            { label: 'Cobrado registrado', value: formatCurrency(collected), detail: `${payments.length} pagos cargados`, icon: Banknote },
            { label: 'Conceptos activos', value: activeConcepts, detail: 'Importes por defecto por cliente', icon: CalendarDays },
          ];

          return metrics.map((metric) => <MetricCard {...metric} key={metric.label} />);
        })()}
      </section>

      <section
        className="content-grid client-home-grid"
        style={{
          ...(clientsPanelHeight ? { '--clients-panel-height': `${clientsPanelHeight}px` } : {}),
          ...(clientHomePanelHeight ? { '--client-home-panel-height': `${clientHomePanelHeight}px` } : {}),
        }}
      >
        <article
          className={`panel wide-panel clients-list-panel ${isClientsCollapsed ? '' : 'is-expanded'}`}
          ref={clientsPanelRef}
        >
          <div className="panel-header">
            <div>
              <p className="eyebrow">Listado</p>
              <h2>Clientes registrados</h2>
            </div>
          </div>

          <div className="table-list clients-scroll-list-container">
            <div className="clients-scroll-list" ref={clientsListRef}>
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
            {canToggleClients && (
              <button
                className="secondary-button compact-button clients-toggle-button"
                onClick={() => setIsClientsCollapsed((currentValue) => !currentValue)}
                type="button"
              >
                {isClientsCollapsed ? 'Mostrar mas' : 'Mostrar menos'}
              </button>
            )}
          </div>
        </article>

        <article className={`panel clients-activity-panel ${isActivityCollapsed ? '' : 'is-expanded'}`} ref={activityPanelRef}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Actividad</p>
              <h2>Ultimos movimientos</h2>
            </div>
          </div>

          <div className="movement-list clients-scroll-list-container">
            <div className="movement-list clients-scroll-list" ref={activityListRef}>
              {latestMovements.length > 0 && (
                <div className="movement-list-head client-home-movement-head" aria-hidden="true">
                  <span>Nombre y apellido</span>
                  <span>Fecha</span>
                  <span>Importe</span>
                </div>
              )}
              {latestMovements.map((movement) => (
                <button
                  className="movement-row compact-movement-row movement-button movement-record-row client-home-movement-row"
                  key={`${movement.movementType}-${movement.id}`}
                  onClick={() => setSelectedMovementId(`${movement.movementType}-${movement.id}`)}
                  type="button"
                >
                  <div>
                    <strong>{getClientName(clients, movement.clientId)}</strong>
                  </div>
                  <div>
                    <span>{movement.date}</span>
                  </div>
                  <strong>{formatCurrency(movement.amount)}</strong>
                </button>
              ))}
              {latestMovements.length === 0 && <p className="empty-state">Todavia no hay movimientos.</p>}
            </div>
            {canToggleActivity && (
              <button
                className="secondary-button compact-button activity-toggle-button"
                onClick={() => setIsActivityCollapsed((currentValue) => !currentValue)}
                type="button"
              >
                {isActivityCollapsed ? 'Mostrar mas' : 'Mostrar menos'}
              </button>
            )}
          </div>
        </article>
      </section>

      {selectedMovement && (
        <MovementDetailModal movement={selectedMovement} onClose={() => setSelectedMovementId(null)} />
      )}
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
    payments.forEach((payment) => {
      if (Array.isArray(payment.concepts) && payment.concepts.length > 0) {
        payment.concepts.forEach((item) => concepts.add(item.concept));
        return;
      }

      if (payment.concept) {
        concepts.add(payment.concept);
      }
    });

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
  handleDeleteClient,
  handleEditClient,
  handleStartClientPayment,
  handleSaveClient,
  handleSelectClient,
  handleShowClientsList,
  handleUpdateConcept,
  payments,
  resetClientForm,
  selectedClient,
  setClientForm,
  setConceptForm,
}) {
  const isEditingClient = editingClientId === selectedClient.id;
  const [showAddConceptForm, setShowAddConceptForm] = useState(false);
  const addConceptRef = useRef(null);
  const [isActivityCollapsed, setIsActivityCollapsed] = useState(true);
  const { availableHeight: clientDetailPanelHeight, panelRef: detailActivityPanelRef } = useAvailableViewportHeight([
    selectedClient.id,
  ]);

  useEffect(() => {
    if (showAddConceptForm && addConceptRef.current) {
      // Smooth scroll to the add-concept form when it becomes visible
      addConceptRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showAddConceptForm]);
  const [selectedMovementId, setSelectedMovementId] = useState(null);
  const [editingConceptId, setEditingConceptId] = useState(null);
  const [conceptDraft, setConceptDraft] = useState({ concept: '', amount: '', dueDay: '', active: true });

  const clientPayments = payments.filter((payment) => payment.clientId === selectedClient.id);
  const clientCharges = charges.filter((charge) => charge.clientId === selectedClient.id);
  const allMovements = [
    ...clientCharges.map((charge) => ({ ...charge, movementType: 'Debito' })),
    ...clientPayments.map((payment) => ({ ...payment, movementType: 'Pago' })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const { canToggle: canToggleActivity, listRef: detailActivityListRef } = useOverflowToggle(!isActivityCollapsed, [
    allMovements.length,
    clientDetailPanelHeight,
    selectedClient.id,
  ]);

  const selectedMovement = selectedMovementId
    ? allMovements.find((movement) => `${movement.movementType}-${movement.id}` === selectedMovementId)
    : null;

  function handleCloseAddConceptForm() {
    setShowAddConceptForm(false);
  }

  function handleStartConceptEdit(concept) {
    setEditingConceptId(concept.id);
    setConceptDraft({
      concept: concept.concept,
      amount: String(concept.amount),
      dueDay: String(concept.dueDay),
      active: concept.active,
    });
  }

  function handleCancelConceptEdit() {
    setEditingConceptId(null);
    setConceptDraft({ concept: '', amount: '', dueDay: '', active: true });
  }

  async function handleSaveConceptEdit(conceptId) {
    const payload = {
      concept: conceptDraft.concept.trim(),
      amount: Number(conceptDraft.amount),
      dueDay: Number(conceptDraft.dueDay),
      active: conceptDraft.active,
    };

    if (!payload.concept || !payload.amount || !payload.dueDay) return;

    const saved = await handleUpdateConcept(conceptId, payload);
    if (saved !== false) {
      handleCancelConceptEdit();
    }
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

      <section className="metric-grid" aria-label="Resumen del cliente">
        {(() => {
          const pending = getClientBalance(selectedClient.id, charges, payments);
          const collected = payments
            .filter((p) => p.clientId === selectedClient.id)
            .reduce((sum, p) => sum + Number(p.amount), 0);
          const activeConcepts = (selectedClient.defaultConcepts || []).filter((c) => c.active).length;

          const metrics = [
            { label: 'Saldo pendiente', value: formatCurrency(pending), detail: `${pending > 0 ? 'Con deuda' : 'Sin deuda'}`, icon: CircleDollarSign },
            { label: 'Cobrado registrado', value: formatCurrency(collected), detail: `${payments.filter((p) => p.clientId === selectedClient.id).length} pagos cargados`, icon: Banknote },
            { label: 'Conceptos activos', value: activeConcepts, detail: 'Importes por defecto del cliente', icon: CalendarDays },
          ];

          return metrics.map((metric) => <MetricCard {...metric} key={metric.label} />);
        })()}
      </section>

      <section
        className="content-grid client-detail-grid"
        style={clientDetailPanelHeight ? { '--client-detail-panel-height': `${clientDetailPanelHeight}px` } : undefined}
      >
        <article className="panel wide-panel client-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Detalle</p>
              <h2>Datos del cliente</h2>
            </div>
            {!isEditingClient && (
              <div className="row-actions">
                <button
                  className="secondary-button"
                  onClick={() => setShowAddConceptForm((currentValue) => !currentValue)}
                  type="button"
                >
                  <Plus size={18} />
                  Agregar concepto
                </button>
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

        <article
          className={`panel clients-activity-panel client-detail-activity-panel ${isActivityCollapsed ? '' : 'is-expanded'}`}
          ref={detailActivityPanelRef}
        >
          <div className="panel-header">
            <div>
              <p className="eyebrow">Actividad</p>
              <h2>Ultimos movimientos del cliente</h2>
            </div>
          </div>

          <div className="movement-list clients-scroll-list-container">
            <div className="movement-list clients-scroll-list" ref={detailActivityListRef}>
            {allMovements.length > 0 && (
              <div className="movement-list-head client-detail-movement-head" aria-hidden="true">
                <span>Fecha</span>
                <span>Importe</span>
                <span>Medio de pago</span>
              </div>
            )}
            {allMovements.map((movement) => (
              <button
                className="movement-row compact-movement-row movement-button movement-record-row client-detail-movement-row"
                key={`${movement.movementType}-${movement.id}`}
                onClick={() => setSelectedMovementId(`${movement.movementType}-${movement.id}`)}
                type="button"
              >
                <div>
                  <span>{movement.date}</span>
                </div>
                <strong>{formatCurrency(movement.amount)}</strong>
                <span className={`payment-method-cell payment-method-pill payment-method-${getMovementPaymentMethodTone(movement)}`}>
                  {getMovementPaymentMethod(movement)}
                </span>
              </button>
            ))}
            {allMovements.length === 0 && <p className="empty-state">Este cliente todavia no tiene movimientos.</p>}
            </div>
            {canToggleActivity && (
              <button
                className="secondary-button compact-button activity-toggle-button"
                onClick={() => setIsActivityCollapsed((currentValue) => !currentValue)}
                type="button"
              >
                {isActivityCollapsed ? 'Mostrar mas' : 'Mostrar menos'}
              </button>
            )}
          </div>
        </article>
      </section>

      {showAddConceptForm && (
        <form
          ref={addConceptRef}
          className="panel form-panel full-panel"
          onSubmit={(event) => {
            handleAddConcept(event);
            handleCloseAddConceptForm();
          }}
        >
          <p className="eyebrow">Nuevo concepto</p>
          <h2>Agregar importe recurrente</h2>
          <div className="form-grid">
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
          </div>
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
            <button className="ghost-button" onClick={handleCloseAddConceptForm} type="button">
              <X size={18} />
              Cancelar
            </button>
          </div>
        </form>
      )}

      <section className="panel full-panel concepts-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Base de cobro</p>
            <h2>Conceptos de {selectedClient.name}</h2>
          </div>
        </div>

        <div className="table-list">
          {selectedClient.defaultConcepts.length > 0 && (
            <div className="concept-table-head" aria-hidden="true">
              <span>Concepto</span>
              <span>Valor</span>
              <span>Fecha de vencimiento</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
          )}
          {selectedClient.defaultConcepts.map((item) => (
            <div
              className={`table-row concept-detail-row ${editingConceptId === item.id ? 'concept-edit-row' : 'concept-readonly-row'}`}
              key={item.id}
            >
              {editingConceptId === item.id ? (
                <>
                  <input
                    aria-label={`Concepto ${item.concept}`}
                    onChange={(event) => setConceptDraft((current) => ({ ...current, concept: event.target.value }))}
                    value={conceptDraft.concept}
                  />
                  <input
                    aria-label={`Importe ${item.concept}`}
                    min="0"
                    onChange={(event) => setConceptDraft((current) => ({ ...current, amount: event.target.value }))}
                    type="number"
                    value={conceptDraft.amount}
                  />
                  <input
                    aria-label={`Vencimiento ${item.concept}`}
                    max="31"
                    min="1"
                    onChange={(event) => setConceptDraft((current) => ({ ...current, dueDay: event.target.value }))}
                    type="number"
                    value={conceptDraft.dueDay}
                  />
                  <button
                    className={conceptDraft.active ? 'status-toggle on' : 'status-toggle'}
                    onClick={() => setConceptDraft((current) => ({ ...current, active: !current.active }))}
                    type="button"
                  >
                    {conceptDraft.active ? 'Activo' : 'Inactivo'}
                  </button>
                  <div className="button-row concept-row-actions">
                    <button className="primary-button" onClick={() => handleSaveConceptEdit(item.id)} type="button">
                      <Save size={16} />
                      Guardar
                    </button>
                    <button className="ghost-button" onClick={handleCancelConceptEdit} type="button">
                      <X size={16} />
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="concept-readonly-field">
                    <strong>{item.concept}</strong>
                  </div>
                  <div className="concept-readonly-field concept-value-field">
                    <strong>{formatCurrency(item.amount)}</strong>
                  </div>
                  <div className="concept-readonly-field concept-value-field">
                    <strong>Dia {item.dueDay}</strong>
                  </div>
                  <button className={item.active ? 'status-toggle on' : 'status-toggle'} disabled type="button">
                    {item.active ? 'Activo' : 'Inactivo'}
                  </button>
                  <div className="button-row concept-row-actions">
                    <button className="secondary-button" onClick={() => handleStartConceptEdit(item)} type="button">
                      <Pencil size={16} />
                      Editar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {selectedClient.defaultConcepts.length === 0 && (
            <p className="empty-state">Este cliente todavia no tiene conceptos recurrentes.</p>
          )}
        </div>
      </section>

      {selectedMovement && (
        <MovementDetailModal movement={selectedMovement} onClose={() => setSelectedMovementId(null)} />
      )}
    </>
  );
}

export function MovementDetailModal({ movement, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        aria-labelledby="movement-detail-title"
        aria-modal="true"
        className="modal-card panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">Detalle</p>
            <h2 id="movement-detail-title">Informacion del movimiento</h2>
          </div>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Cerrar detalle">
            <X size={18} />
          </button>
        </div>

        <div className="detail-content">
          <div className="detail-row">
            <span className="detail-label">Concepto</span>
            <strong className="detail-value">{movement.concept}</strong>
          </div>
          <div className="detail-row">
            <span className="detail-label">Fecha</span>
            <strong className="detail-value">{movement.date}</strong>
          </div>
          <div className="detail-row">
            <span className="detail-label">Monto</span>
            <strong className="detail-value">{formatCurrency(movement.amount)}</strong>
          </div>
          <div className="detail-row">
            <span className="detail-label">Tipo</span>
            <strong className="detail-value">{movement.movementType}</strong>
          </div>
          {Array.isArray(movement.concepts) && movement.concepts.length > 0 && (
            <div className="detail-row detail-row-stack">
              <span className="detail-label">Conceptos imputados</span>
              <div className="detail-breakdown">
                {movement.concepts.map((item, index) => (
                  <div className="detail-breakdown-item" key={`${item.concept}-${index}`}>
                    <span>{item.concept}</span>
                    <strong>{formatCurrency(item.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          {movement.method && (
            <div className="detail-row">
              <span className="detail-label">Medio de pago</span>
              <strong className="detail-value">{movement.method}</strong>
            </div>
          )}
          {movement.receipt && (
            <div className="detail-row">
              <span className="detail-label">Comprobante</span>
              <strong className="detail-value">{movement.receipt}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
