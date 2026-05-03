import { useCallback, useEffect, useMemo, useState } from 'react';
import { accountingApi } from './api/accountingApi.js';
import { Sidebar } from './components/Sidebar.jsx';
import {
  createInitialPaymentForm,
  createInitialSalaryForm,
  EMPTY_CLIENT_FORM,
  EMPTY_CONCEPT_FORM,
  EMPTY_EMPLOYEE_FORM,
  PAYMENT_METHODS,
} from './constants/forms.js';
import { ClientsView } from './views/ClientsView.jsx';
import { DashboardView } from './views/DashboardView.jsx';
import { EmployeesView } from './views/EmployeesView.jsx';

const emptyDashboard = {
  pendingBalance: 0,
  collectedThisMonth: 0,
  upcomingDueDates: 0,
  clientsWithDebt: 0,
};

function pickExistingId(collection, currentId) {
  return collection.some((item) => item.id === Number(currentId)) ? Number(currentId) : (collection[0]?.id ?? '');
}

function getFirstConcept(client) {
  return client?.defaultConcepts?.[0]?.concept ?? 'Honorarios';
}

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [charges, setCharges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [clientReport, setClientReport] = useState(null);
  const [isClientReportLoading, setIsClientReportLoading] = useState(false);
  const [clientScreen, setClientScreen] = useState('list');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientForm, setClientForm] = useState(EMPTY_CLIENT_FORM);
  const [editingClientId, setEditingClientId] = useState(null);
  const [conceptForm, setConceptForm] = useState(EMPTY_CONCEPT_FORM);
  const [paymentForm, setPaymentForm] = useState(createInitialPaymentForm());
  const [employeeForm, setEmployeeForm] = useState(EMPTY_EMPLOYEE_FORM);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [salaryForm, setSalaryForm] = useState(createInitialSalaryForm());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadApplicationData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [
        dashboardData,
        clientsData,
        chargesData,
        paymentsData,
        employeesData,
        salariesData,
      ] = await Promise.all([
        accountingApi.getDashboard(),
        accountingApi.getClients(),
        accountingApi.getCharges(),
        accountingApi.getPayments(),
        accountingApi.getEmployees(),
        accountingApi.getSalaries(),
      ]);

      setDashboard(dashboardData);
      setClients(clientsData);
      setCharges(chargesData);
      setPayments(paymentsData);
      setEmployees(employeesData);
      setSalaryHistory(salariesData);

      setSelectedClientId((currentId) => pickExistingId(clientsData, currentId));
      setPaymentForm((currentForm) => {
        const clientId = pickExistingId(clientsData, currentForm.clientId);
        const client = clientsData.find((item) => item.id === Number(clientId));

        return {
          ...currentForm,
          clientId,
          concept: client?.defaultConcepts.some((item) => item.concept === currentForm.concept)
            ? currentForm.concept
            : getFirstConcept(client),
        };
      });
      setSalaryForm((currentForm) => ({
        ...currentForm,
        employeeId: pickExistingId(employeesData, currentForm.employeeId),
      }));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplicationData();
  }, [loadApplicationData]);

  const selectedClient = clients.find((client) => client.id === Number(selectedClientId)) ?? clients[0] ?? null;

  const honorariosCollected = useMemo(
    () =>
      payments
        .filter((payment) => payment.concept === 'Honorarios')
        .reduce((total, payment) => total + Number(payment.amount), 0),
    [payments],
  );

  function resetClientForm() {
    setClientForm(EMPTY_CLIENT_FORM);
    setEditingClientId(null);
  }

  function handleStartNewClient() {
    resetClientForm();
    setClientScreen('new');
  }

  function handleCancelClientForm() {
    resetClientForm();
    setClientScreen('list');
  }

  function handleSelectClient(clientId) {
    setSelectedClientId(clientId);
    resetClientForm();
    setConceptForm(EMPTY_CONCEPT_FORM);
    setClientScreen('detail');
  }

  function handleShowClientsList() {
    resetClientForm();
    setConceptForm(EMPTY_CONCEPT_FORM);
    setClientScreen('list');
  }

  function handleShowClientReport() {
    resetClientForm();
    setConceptForm(EMPTY_CONCEPT_FORM);
    setClientReport(null);
    setClientScreen('report');
  }

  function handleStartClientPayment(clientId) {
    const client = clients.find((item) => item.id === Number(clientId));

    setSelectedClientId(clientId);
    setPaymentForm((currentForm) => ({
      ...currentForm,
      clientId,
      concept: getFirstConcept(client),
      amount: '',
      receipt: '',
    }));
    setClientScreen('payment');
  }

  async function handleGenerateClientReport(filters) {
    setIsClientReportLoading(true);
    setErrorMessage('');

    try {
      const reportData = await accountingApi.getMovementsReport(filters);
      setClientReport(reportData);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsClientReportLoading(false);
    }
  }

  async function handleSaveClient(event) {
    event.preventDefault();

    const payload = {
      name: clientForm.name.trim(),
      cuit: clientForm.cuit.trim(),
      email: clientForm.email.trim(),
      phone: clientForm.phone.trim(),
    };

    if (!payload.name || !payload.cuit) return;

    try {
      const savedClient = editingClientId
        ? await accountingApi.updateClient(editingClientId, payload)
        : await accountingApi.createClient(payload);

      resetClientForm();
      await loadApplicationData();
      setSelectedClientId(savedClient.id);
      setPaymentForm((currentForm) => ({
        ...currentForm,
        clientId: savedClient.id,
        concept: getFirstConcept(savedClient),
      }));
      setClientScreen('detail');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleEditClient(client) {
    setEditingClientId(client.id);
    setClientForm({
      name: client.name,
      cuit: client.cuit,
      email: client.email ?? '',
      phone: client.phone ?? '',
    });
    setClientScreen('detail');
  }

  async function handleDeleteClient(clientId) {
    if (!window.confirm('Eliminar este cliente tambien quitara sus debitos y pagos cargados.')) return;

    try {
      await accountingApi.deleteClient(clientId);
      if (editingClientId === clientId) resetClientForm();
      await loadApplicationData();
      setClientScreen('list');
      setClientReport(null);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleAddConcept(event) {
    event.preventDefault();

    const payload = {
      concept: conceptForm.concept.trim(),
      amount: Number(conceptForm.amount),
      dueDay: Number(conceptForm.dueDay),
      active: true,
    };

    if (!selectedClient || !payload.concept || !payload.amount || !payload.dueDay) return;

    try {
      await accountingApi.createConcept(selectedClient.id, payload);
      setConceptForm(EMPTY_CONCEPT_FORM);
      await loadApplicationData();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleConceptFieldChange(conceptId, field, value) {
    if (!selectedClient) return;

    setClients((currentClients) =>
      currentClients.map((client) =>
        client.id === selectedClient.id
          ? {
              ...client,
              defaultConcepts: client.defaultConcepts.map((concept) =>
                concept.id === conceptId ? { ...concept, [field]: value } : concept,
              ),
            }
          : client,
      ),
    );
  }

  async function handleUpdateConcept(conceptId, patch) {
    if (!selectedClient) return;

    try {
      await accountingApi.updateConcept(selectedClient.id, conceptId, patch);
      const dashboardData = await accountingApi.getDashboard();
      setDashboard(dashboardData);
    } catch (error) {
      setErrorMessage(error.message);
      await loadApplicationData();
    }
  }

  async function handleToggleConcept(conceptId) {
    if (!selectedClient) return;

    const concept = selectedClient.defaultConcepts.find((item) => item.id === conceptId);
    if (!concept) return;

    const active = !concept.active;

    setClients((currentClients) =>
      currentClients.map((client) =>
        client.id === selectedClient.id
          ? {
              ...client,
              defaultConcepts: client.defaultConcepts.map((item) =>
                item.id === conceptId ? { ...item, active } : item,
              ),
            }
          : client,
      ),
    );

    try {
      await accountingApi.updateConcept(selectedClient.id, conceptId, { active });
      const dashboardData = await accountingApi.getDashboard();
      setDashboard(dashboardData);
    } catch (error) {
      setErrorMessage(error.message);
      await loadApplicationData();
    }
  }

  async function handleCreateCharge(concept) {
    if (!selectedClient) return;

    try {
      await accountingApi.createCharge({
        clientId: selectedClient.id,
        date: new Date().toISOString().slice(0, 10),
        concept: concept.concept,
        amount: concept.amount,
      });
      await loadApplicationData();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleRegisterPayment(event) {
    event.preventDefault();

    const payload = {
      clientId: Number(paymentForm.clientId),
      date: paymentForm.date,
      concept: paymentForm.concept,
      amount: Number(paymentForm.amount),
      method: paymentForm.method,
      receipt: paymentForm.receipt,
    };

    if (!payload.clientId || !payload.amount) return;

    try {
      await accountingApi.createPayment(payload);
      setPaymentForm((currentForm) => ({ ...currentForm, amount: '', receipt: '' }));
      await loadApplicationData();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleAddEmployee(event) {
    event.preventDefault();

    const payload = {
      name: employeeForm.name.trim(),
      role: employeeForm.role.trim(),
      email: employeeForm.email.trim(),
      phone: employeeForm.phone.trim(),
      commissionRate: Number(employeeForm.commissionRate) / 100,
    };

    if (!payload.name || !payload.role || Number.isNaN(payload.commissionRate)) return;

    try {
      const savedEmployee = editingEmployeeId
        ? await accountingApi.updateEmployee(editingEmployeeId, payload)
        : await accountingApi.createEmployee(payload);

      handleCancelEmployeeEdit();
      await loadApplicationData();
      setSalaryForm((currentForm) => ({ ...currentForm, employeeId: savedEmployee.id }));
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleEditEmployee(employee) {
    setEditingEmployeeId(employee.id);
    setEmployeeForm({
      name: employee.name,
      role: employee.role,
      email: employee.email ?? '',
      phone: employee.phone ?? '',
      commissionRate: String(Math.round(employee.commissionRate * 100)),
    });
  }

  function handleCancelEmployeeEdit() {
    setEditingEmployeeId(null);
    setEmployeeForm(EMPTY_EMPLOYEE_FORM);
  }

  async function handleDeleteEmployee(employeeId) {
    if (!window.confirm('Eliminar este empleado tambien quitara su historial de sueldos.')) return;

    try {
      await accountingApi.deleteEmployee(employeeId);
      if (editingEmployeeId === employeeId) handleCancelEmployeeEdit();
      await loadApplicationData();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleRegisterSalary(event) {
    event.preventDefault();

    const employee = employees.find((item) => item.id === Number(salaryForm.employeeId));
    if (!employee) return;

    const baseSalary = Number(salaryForm.baseSalary);
    const variableAmount = Math.round(honorariosCollected * employee.commissionRate);
    const paidAmount = Number(salaryForm.paidAmount || baseSalary + variableAmount);

    if (!baseSalary || !paidAmount) return;

    try {
      await accountingApi.createSalary({
        employeeId: employee.id,
        month: salaryForm.month,
        baseSalary,
        honorariosBase: honorariosCollected,
        variableAmount,
        paidAmount,
        date: salaryForm.date,
        method: salaryForm.method,
        notes: salaryForm.notes,
      });
      setSalaryForm((currentForm) => ({ ...currentForm, baseSalary: '', paidAmount: '', notes: '' }));
      await loadApplicationData();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleSectionChange(sectionId) {
    setActiveSection(sectionId);
    if (sectionId === 'clients') {
      setClientScreen('list');
      resetClientForm();
    }
  }

  function renderActiveView() {
    if (isLoading) {
      return <div className="panel status-panel">Cargando datos del backend...</div>;
    }

    if (activeSection === 'dashboard') {
      return (
        <DashboardView
          charges={charges}
          clients={clients}
          dashboard={dashboard}
          payments={payments}
          setActiveSection={handleSectionChange}
        />
      );
    }

    if (activeSection === 'clients') {
      return (
        <ClientsView
          clientForm={clientForm}
          clientReport={clientReport}
          clientScreen={clientScreen}
          clients={clients}
          conceptForm={conceptForm}
          charges={charges}
          editingClientId={editingClientId}
          handleAddConcept={handleAddConcept}
          handleCancelClientForm={handleCancelClientForm}
          handleConceptFieldChange={handleConceptFieldChange}
          handleCreateCharge={handleCreateCharge}
          handleDeleteClient={handleDeleteClient}
          handleEditClient={handleEditClient}
          handleSaveClient={handleSaveClient}
          handleGenerateClientReport={handleGenerateClientReport}
          handleRegisterPayment={handleRegisterPayment}
          handleSelectClient={handleSelectClient}
          handleShowClientsList={handleShowClientsList}
          handleShowClientReport={handleShowClientReport}
          handleStartClientPayment={handleStartClientPayment}
          handleToggleConcept={handleToggleConcept}
          handleStartNewClient={handleStartNewClient}
          handleUpdateConcept={handleUpdateConcept}
          isClientReportLoading={isClientReportLoading}
          paymentForm={paymentForm}
          paymentMethods={PAYMENT_METHODS}
          payments={payments}
          resetClientForm={resetClientForm}
          selectedClient={selectedClient}
          setClientForm={setClientForm}
          setConceptForm={setConceptForm}
          setPaymentForm={setPaymentForm}
        />
      );
    }

    return (
      <EmployeesView
        editingEmployeeId={editingEmployeeId}
        employeeForm={employeeForm}
        employees={employees}
        handleAddEmployee={handleAddEmployee}
        handleCancelEmployeeEdit={handleCancelEmployeeEdit}
        handleDeleteEmployee={handleDeleteEmployee}
        handleEditEmployee={handleEditEmployee}
        handleRegisterSalary={handleRegisterSalary}
        honorariosCollected={honorariosCollected}
        paymentMethods={PAYMENT_METHODS}
        salaryForm={salaryForm}
        salaryHistory={salaryHistory}
        setEmployeeForm={setEmployeeForm}
        setSalaryForm={setSalaryForm}
      />
    );
  }

  return (
    <main className="app-shell">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      <section className="workspace">
        {errorMessage && (
          <div className="status-panel error-panel" role="alert">
            {errorMessage}
          </div>
        )}
        {renderActiveView()}
      </section>
    </main>
  );
}

export { App };
