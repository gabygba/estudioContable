import { Pencil, Save, Trash2, X } from 'lucide-react';

export function ClientsView({
  clientForm,
  clients,
  conceptForm,
  editingClientId,
  handleAddConcept,
  handleConceptAmountChange,
  handleCreateCharge,
  handleDeleteClient,
  handleEditClient,
  handleSaveClient,
  handleToggleConcept,
  resetClientForm,
  selectedClient,
  selectedClientId,
  setClientForm,
  setConceptForm,
  setSelectedClientId,
}) {
  const hasClients = clients.length > 0;

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Clientes</p>
          <h1>ABM de clientes y conceptos</h1>
        </div>
      </header>

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSaveClient}>
          <p className="eyebrow">{editingClientId ? 'Editar cliente' : 'Alta de cliente'}</p>
          <h2>{editingClientId ? 'Modificar datos del cliente' : 'Registrar cliente'}</h2>
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
              {editingClientId ? 'Guardar cambios' : 'Agregar cliente'}
            </button>
            {editingClientId && (
              <button className="ghost-button" onClick={resetClientForm} type="button">
                <X size={18} />
                Cancelar
              </button>
            )}
          </div>
        </form>

        <article className="panel wide-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Listado</p>
              <h2>Clientes registrados</h2>
            </div>
          </div>
          <div className="table-list">
            {clients.map((client) => (
              <div className="table-row abm-row" key={client.id}>
                <div>
                  <strong>{client.name}</strong>
                  <span>
                    {client.cuit} {client.email ? `- ${client.email}` : ''}
                  </span>
                </div>
                <span>{client.phone || 'Sin telefono'}</span>
                <div className="row-actions">
                  <button
                    className="icon-button"
                    onClick={() => handleEditClient(client)}
                    type="button"
                    aria-label={`Editar ${client.name}`}
                  >
                    <Pencil size={17} />
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
              </div>
            ))}
            {!hasClients && <p className="empty-state">Todavia no hay clientes cargados.</p>}
          </div>
        </article>
      </section>

      <div className="toolbar">
        <label className="field compact">
          Cliente
          <select
            disabled={!hasClients}
            value={selectedClientId}
            onChange={(event) => setSelectedClientId(Number(event.target.value))}
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
        <div className="client-id">
          <span>CUIT</span>
          <strong>{selectedClient?.cuit ?? '-'}</strong>
        </div>
      </div>

      <section className="content-grid">
        <article className="panel wide-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Base de cobro</p>
              <h2>{selectedClient?.name ?? 'Sin cliente seleccionado'}</h2>
            </div>
          </div>

          <div className="table-list">
            {selectedClient?.defaultConcepts.map((item) => (
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
                <button
                  className={item.active ? 'status-toggle on' : 'status-toggle'}
                  onClick={() => handleToggleConcept(item.id)}
                  type="button"
                >
                  {item.active ? 'Activo' : 'Inactivo'}
                </button>
                <button className="secondary-button" onClick={() => handleCreateCharge(item)} type="button">
                  Generar debito
                </button>
              </div>
            ))}
            {selectedClient && selectedClient.defaultConcepts.length === 0 && (
              <p className="empty-state">Este cliente todavia no tiene conceptos recurrentes.</p>
            )}
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
          <button className="primary-button" disabled={!selectedClient} type="submit">
            <Save size={18} />
            Guardar concepto
          </button>
        </form>
      </section>
    </>
  );
}
