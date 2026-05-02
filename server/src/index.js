import 'dotenv/config';
import cors from 'cors';
import express from 'express';

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

let clients = [
  {
    id: 1,
    name: 'Alvarez & Asociados',
    cuit: '30-71234567-8',
    email: 'administracion@alvarez.com',
    phone: '11 4321-8000',
    defaultConcepts: [
      { id: 1, concept: 'Honorarios', amount: 85000, dueDay: 10, active: true },
      { id: 2, concept: 'Pago de IVA', amount: 126000, dueDay: 20, active: true },
      { id: 3, concept: 'Pago de IIBB', amount: 38500, dueDay: 18, active: true },
    ],
  },
  {
    id: 2,
    name: 'Ferreteria Norte',
    cuit: '20-18654321-5',
    email: 'pagos@ferreterianorte.com',
    phone: '11 4555-9012',
    defaultConcepts: [
      { id: 4, concept: 'Honorarios', amount: 62000, dueDay: 10, active: true },
      { id: 5, concept: 'Monotributo', amount: 42000, dueDay: 20, active: true },
    ],
  },
  {
    id: 3,
    name: 'Clinica San Martin',
    cuit: '30-69876543-1',
    email: 'contable@clinicasm.com',
    phone: '11 4789-2200',
    defaultConcepts: [
      { id: 6, concept: 'Honorarios', amount: 126000, dueDay: 10, active: true },
      { id: 7, concept: 'Liquidacion de sueldos', amount: 96000, dueDay: 15, active: true },
    ],
  },
];

let charges = [
  { id: 1, clientId: 1, date: '2026-04-01', concept: 'Honorarios', amount: 85000 },
  { id: 2, clientId: 1, date: '2026-04-15', concept: 'Pago de IVA', amount: 126000 },
  { id: 3, clientId: 2, date: '2026-04-01', concept: 'Honorarios', amount: 62000 },
  { id: 4, clientId: 2, date: '2026-04-12', concept: 'Monotributo', amount: 42000 },
  { id: 5, clientId: 3, date: '2026-04-01', concept: 'Honorarios', amount: 126000 },
  { id: 6, clientId: 3, date: '2026-04-10', concept: 'Liquidacion de sueldos', amount: 96000 },
];

let payments = [
  {
    id: 1,
    clientId: 2,
    date: '2026-04-16',
    concept: 'Honorarios',
    amount: 62000,
    method: 'Transferencia',
    receipt: 'TR-1024',
  },
  {
    id: 2,
    clientId: 1,
    date: '2026-04-18',
    concept: 'Pago de IVA',
    amount: 76000,
    method: 'Efectivo',
    receipt: 'RC-0041',
  },
];

let employees = [
  {
    id: 1,
    name: 'Mariana Lopez',
    role: 'Administracion',
    commissionRate: 0.08,
    email: 'mariana@estudio.local',
    phone: '11 4020-1001',
  },
  {
    id: 2,
    name: 'Santiago Ruiz',
    role: 'Contador junior',
    commissionRate: 0.12,
    email: 'santiago@estudio.local',
    phone: '11 4020-1002',
  },
];

let salaryHistory = [
  {
    id: 1,
    employeeId: 1,
    month: '2026-04',
    baseSalary: 420000,
    honorariosBase: 62000,
    variableAmount: 4960,
    paidAmount: 424960,
    date: '2026-04-25',
    method: 'Transferencia',
    notes: 'Liquidacion abril',
  },
];

function createId(collection) {
  return collection.length ? Math.max(...collection.map((item) => item.id)) + 1 : 1;
}

function getDashboard() {
  const totalCharges = charges.reduce((total, charge) => total + charge.amount, 0);
  const totalPayments = payments.reduce((total, payment) => total + payment.amount, 0);

  return {
    pendingBalance: totalCharges - totalPayments,
    collectedThisMonth: totalPayments,
    upcomingDueDates: clients.reduce(
      (total, client) => total + client.defaultConcepts.filter((concept) => concept.active).length,
      0,
    ),
    clientsWithDebt: clients.filter((client) => {
      const charged = charges
        .filter((charge) => charge.clientId === client.id)
        .reduce((total, charge) => total + charge.amount, 0);
      const paid = payments
        .filter((payment) => payment.clientId === client.id)
        .reduce((total, payment) => total + payment.amount, 0);

      return charged - paid > 0;
    }).length,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'estudio-contable-api' });
});

app.get('/api/dashboard', (_req, res) => {
  res.json(getDashboard());
});

app.get('/api/clients', (_req, res) => {
  res.json(clients);
});

app.get('/api/clients/:clientId', (req, res) => {
  const client = clients.find((item) => item.id === Number(req.params.clientId));

  if (!client) {
    res.status(404).json({ message: 'Cliente no encontrado' });
    return;
  }

  res.json(client);
});

app.post('/api/clients', (req, res) => {
  const client = {
    id: createId(clients),
    name: req.body.name,
    cuit: req.body.cuit,
    email: req.body.email ?? '',
    phone: req.body.phone ?? '',
    defaultConcepts: req.body.defaultConcepts ?? [],
  };

  clients = [...clients, client];
  res.status(201).json(client);
});

app.put('/api/clients/:clientId', (req, res) => {
  const clientId = Number(req.params.clientId);
  let updatedClient;

  clients = clients.map((client) => {
    if (client.id !== clientId) return client;

    updatedClient = {
      ...client,
      name: req.body.name ?? client.name,
      cuit: req.body.cuit ?? client.cuit,
      email: req.body.email ?? client.email,
      phone: req.body.phone ?? client.phone,
    };

    return updatedClient;
  });

  if (!updatedClient) {
    res.status(404).json({ message: 'Cliente no encontrado' });
    return;
  }

  res.json(updatedClient);
});

app.delete('/api/clients/:clientId', (req, res) => {
  const clientId = Number(req.params.clientId);
  const exists = clients.some((client) => client.id === clientId);

  if (!exists) {
    res.status(404).json({ message: 'Cliente no encontrado' });
    return;
  }

  clients = clients.filter((client) => client.id !== clientId);
  charges = charges.filter((charge) => charge.clientId !== clientId);
  payments = payments.filter((payment) => payment.clientId !== clientId);

  res.status(204).send();
});

app.post('/api/clients/:clientId/concepts', (req, res) => {
  const clientId = Number(req.params.clientId);
  const concept = {
    id: Date.now(),
    concept: req.body.concept,
    amount: Number(req.body.amount),
    dueDay: Number(req.body.dueDay),
    active: req.body.active ?? true,
  };

  clients = clients.map((client) =>
    client.id === clientId ? { ...client, defaultConcepts: [...client.defaultConcepts, concept] } : client,
  );

  res.status(201).json(concept);
});

app.patch('/api/clients/:clientId/concepts/:conceptId', (req, res) => {
  const clientId = Number(req.params.clientId);
  const conceptId = Number(req.params.conceptId);
  let updatedConcept;

  clients = clients.map((client) => {
    if (client.id !== clientId) return client;

    return {
      ...client,
      defaultConcepts: client.defaultConcepts.map((concept) => {
        if (concept.id !== conceptId) return concept;
        updatedConcept = { ...concept, ...req.body };
        return updatedConcept;
      }),
    };
  });

  res.json(updatedConcept);
});

app.get('/api/charges', (_req, res) => {
  res.json(charges);
});

app.post('/api/charges', (req, res) => {
  const charge = {
    id: createId(charges),
    clientId: Number(req.body.clientId),
    date: req.body.date,
    concept: req.body.concept,
    amount: Number(req.body.amount),
  };

  charges = [...charges, charge];
  res.status(201).json(charge);
});

app.get('/api/payments', (_req, res) => {
  res.json(payments);
});

app.post('/api/payments', (req, res) => {
  const payment = {
    id: createId(payments),
    clientId: Number(req.body.clientId),
    date: req.body.date,
    concept: req.body.concept,
    amount: Number(req.body.amount),
    method: req.body.method,
    receipt: req.body.receipt ?? '',
  };

  payments = [...payments, payment];
  res.status(201).json(payment);
});

app.get('/api/reports/client/:clientId', (req, res) => {
  const clientId = Number(req.params.clientId);
  const rows = [
    ...charges
      .filter((charge) => charge.clientId === clientId)
      .map((charge) => ({ ...charge, type: 'Debito', debit: charge.amount, credit: 0 })),
    ...payments
      .filter((payment) => payment.clientId === clientId)
      .map((payment) => ({ ...payment, type: 'Pago', debit: 0, credit: payment.amount })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    client: clients.find((client) => client.id === clientId),
    rows,
    balance: rows.reduce((total, row) => total + row.debit - row.credit, 0),
  });
});

app.get('/api/employees', (_req, res) => {
  res.json(employees);
});

app.get('/api/employees/:employeeId', (req, res) => {
  const employee = employees.find((item) => item.id === Number(req.params.employeeId));

  if (!employee) {
    res.status(404).json({ message: 'Empleado no encontrado' });
    return;
  }

  res.json(employee);
});

app.post('/api/employees', (req, res) => {
  const employee = {
    id: createId(employees),
    name: req.body.name,
    role: req.body.role,
    email: req.body.email ?? '',
    phone: req.body.phone ?? '',
    commissionRate: Number(req.body.commissionRate),
  };

  employees = [...employees, employee];
  res.status(201).json(employee);
});

app.put('/api/employees/:employeeId', (req, res) => {
  const employeeId = Number(req.params.employeeId);
  let updatedEmployee;

  employees = employees.map((employee) => {
    if (employee.id !== employeeId) return employee;

    updatedEmployee = {
      ...employee,
      name: req.body.name ?? employee.name,
      role: req.body.role ?? employee.role,
      email: req.body.email ?? employee.email,
      phone: req.body.phone ?? employee.phone,
      commissionRate:
        req.body.commissionRate === undefined ? employee.commissionRate : Number(req.body.commissionRate),
    };

    return updatedEmployee;
  });

  if (!updatedEmployee) {
    res.status(404).json({ message: 'Empleado no encontrado' });
    return;
  }

  res.json(updatedEmployee);
});

app.delete('/api/employees/:employeeId', (req, res) => {
  const employeeId = Number(req.params.employeeId);
  const exists = employees.some((employee) => employee.id === employeeId);

  if (!exists) {
    res.status(404).json({ message: 'Empleado no encontrado' });
    return;
  }

  employees = employees.filter((employee) => employee.id !== employeeId);
  salaryHistory = salaryHistory.filter((salary) => salary.employeeId !== employeeId);

  res.status(204).send();
});

app.get('/api/salaries', (_req, res) => {
  res.json(salaryHistory);
});

app.post('/api/salaries', (req, res) => {
  const salary = {
    id: createId(salaryHistory),
    employeeId: Number(req.body.employeeId),
    month: req.body.month,
    baseSalary: Number(req.body.baseSalary),
    honorariosBase: Number(req.body.honorariosBase),
    variableAmount: Number(req.body.variableAmount),
    paidAmount: Number(req.body.paidAmount),
    date: req.body.date,
    method: req.body.method,
    notes: req.body.notes ?? '',
  };

  salaryHistory = [...salaryHistory, salary];
  res.status(201).json(salary);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
