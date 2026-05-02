import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { formatCurrency, getEmployeeName } from '../utils/formatters.js';

export function EmployeesView({
  editingEmployeeId,
  employeeForm,
  employees,
  handleAddEmployee,
  handleCancelEmployeeEdit,
  handleDeleteEmployee,
  handleEditEmployee,
  handleRegisterSalary,
  honorariosCollected,
  paymentMethods,
  salaryForm,
  salaryHistory,
  setEmployeeForm,
  setSalaryForm,
}) {
  const selectedEmployee = employees.find((employee) => employee.id === Number(salaryForm.employeeId)) ?? employees[0] ?? null;
  const suggestedVariable = selectedEmployee ? Math.round(honorariosCollected * selectedEmployee.commissionRate) : 0;

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
          <p className="eyebrow">{editingEmployeeId ? 'Editar empleado' : 'Alta de empleado'}</p>
          <h2>{editingEmployeeId ? 'Modificar legajo' : 'Registrar empleado'}</h2>
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
          <div className="form-grid">
            <label className="field">
              Email
              <input
                onChange={(event) => setEmployeeForm({ ...employeeForm, email: event.target.value })}
                placeholder="empleado@estudio.com"
                type="email"
                value={employeeForm.email}
              />
            </label>
            <label className="field">
              Telefono
              <input
                onChange={(event) => setEmployeeForm({ ...employeeForm, phone: event.target.value })}
                placeholder="11 4000-0000"
                value={employeeForm.phone}
              />
            </label>
          </div>
          <label className="field">
            Porcentaje sobre honorarios cobrados
            <input
              min="0"
              onChange={(event) => setEmployeeForm({ ...employeeForm, commissionRate: event.target.value })}
              type="number"
              value={employeeForm.commissionRate}
            />
          </label>
          <div className="button-row">
            <button className="primary-button" type="submit">
              {editingEmployeeId ? <Save size={18} /> : <Plus size={18} />}
              {editingEmployeeId ? 'Guardar cambios' : 'Agregar empleado'}
            </button>
            {editingEmployeeId && (
              <button className="ghost-button" onClick={handleCancelEmployeeEdit} type="button">
                <X size={18} />
                Cancelar
              </button>
            )}
          </div>
        </form>

        <form className="panel form-panel" onSubmit={handleRegisterSalary}>
          <p className="eyebrow">Liquidacion</p>
          <h2>Registrar pago de sueldo</h2>
          <label className="field">
            Empleado
            <select
              disabled={employees.length === 0}
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
          <button className="primary-button" disabled={employees.length === 0} type="submit">
            <Save size={18} />
            Registrar sueldo
          </button>
        </form>
      </section>

      <section className="panel full-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">ABM</p>
            <h2>Empleados registrados</h2>
          </div>
        </div>
        <div className="table-list">
          {employees.map((employee) => (
            <div className="table-row abm-row" key={employee.id}>
              <div>
                <strong>{employee.name}</strong>
                <span>
                  {employee.role} - {Math.round(employee.commissionRate * 100)}% sobre honorarios
                </span>
              </div>
              <span>{employee.email || employee.phone || 'Sin contacto'}</span>
              <div className="row-actions">
                <button
                  className="icon-button"
                  onClick={() => handleEditEmployee(employee)}
                  type="button"
                  aria-label={`Editar ${employee.name}`}
                >
                  <Pencil size={17} />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => handleDeleteEmployee(employee.id)}
                  type="button"
                  aria-label={`Eliminar ${employee.name}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
          {employees.length === 0 && <p className="empty-state">Todavia no hay empleados cargados.</p>}
        </div>
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
                <strong>{getEmployeeName(employees, salary.employeeId)}</strong>
                <span>
                  {salary.month} - Base {formatCurrency(salary.baseSalary)} + variable{' '}
                  {formatCurrency(salary.variableAmount)}
                </span>
              </div>
              <span>{salary.method}</span>
              <strong>{formatCurrency(salary.paidAmount)}</strong>
            </div>
          ))}
          {salaryHistory.length === 0 && <p className="empty-state">Todavia no hay sueldos registrados.</p>}
        </div>
      </section>
    </>
  );
}
