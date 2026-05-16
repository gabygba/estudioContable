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
    concepts: [{ conceptId: 4, concept: 'Honorarios', amount: 62000 }],
    method: 'Transferencia',
    receipt: 'TR-1024',
  },
  {
    id: 2,
    clientId: 1,
    date: '2026-04-18',
    concept: 'Pago de IVA',
    amount: 76000,
    concepts: [{ conceptId: 2, concept: 'Pago de IVA', amount: 76000 }],
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

function createConceptId() {
  const concepts = clients.flatMap((client) => client.defaultConcepts);
  return createId(concepts);
}

function normalizePaymentConcepts(payment) {
  if (Array.isArray(payment.concepts) && payment.concepts.length > 0) {
    return payment.concepts.map((concept) => ({
      conceptId: concept.conceptId === undefined ? undefined : Number(concept.conceptId),
      concept: concept.concept,
      amount: Number(concept.amount),
    }));
  }

  if (payment.concept) {
    return [
      {
        concept: payment.concept,
        amount: Number(payment.amount),
      },
    ];
  }

  return [];
}

function buildPaymentConceptLabel(concepts) {
  if (concepts.length === 0) return 'Pago sin concepto';
  if (concepts.length === 1) return concepts[0].concept;
  return `${concepts[0].concept} + ${concepts.length - 1} mas`;
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
  const client = clients.find((item) => item.id === clientId);

  if (!client) {
    res.status(404).json({ message: 'Cliente no encontrado' });
    return;
  }

  const concept = {
    id: createConceptId(),
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
  const patch = {
    ...req.body,
    ...(req.body.amount === undefined ? {} : { amount: Number(req.body.amount) }),
    ...(req.body.dueDay === undefined ? {} : { dueDay: Number(req.body.dueDay) }),
  };

  clients = clients.map((client) => {
    if (client.id !== clientId) return client;

    return {
      ...client,
      defaultConcepts: client.defaultConcepts.map((concept) => {
        if (concept.id !== conceptId) return concept;
        updatedConcept = { ...concept, ...patch };
        return updatedConcept;
      }),
    };
  });

  if (!updatedConcept) {
    res.status(404).json({ message: 'Concepto no encontrado' });
    return;
  }

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
  const concepts = normalizePaymentConcepts(req.body).filter(
    (concept) => concept.concept && Number(concept.amount) > 0,
  );

  const payment = {
    id: createId(payments),
    clientId: Number(req.body.clientId),
    date: req.body.date,
    concept: buildPaymentConceptLabel(concepts),
    amount: concepts.reduce((total, concept) => total + Number(concept.amount), 0),
    concepts,
    method: req.body.method,
    receipt: req.body.receipt ?? '',
  };

  payments = [...payments, payment];
  res.status(201).json(payment);
});

app.get('/api/reports/client/:clientId', (req, res) => {
  const clientId = Number(req.params.clientId);
  const client = clients.find((item) => item.id === clientId);

  if (!client) {
    res.status(404).json({ message: 'Cliente no encontrado' });
    return;
  }

  const rows = [
    ...charges
      .filter((charge) => charge.clientId === clientId)
      .map((charge) => ({ ...charge, type: 'Debito', debit: charge.amount, credit: 0 })),
    ...payments
      .filter((payment) => payment.clientId === clientId)
      .map((payment) => ({ ...payment, type: 'Pago', debit: 0, credit: payment.amount })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    client,
    rows,
    balance: rows.reduce((total, row) => total + row.debit - row.credit, 0),
  });
});

app.get('/api/reports/movements', (req, res) => {
  const clientIds = req.query.clientIds
    ? String(req.query.clientIds)
        .split(',')
        .map(Number)
        .filter(Boolean)
    : [];
  const concepts = req.query.concepts
    ? String(req.query.concepts)
        .split(',')
        .map((concept) => concept.trim())
        .filter(Boolean)
    : [];
  const movementTypes = req.query.movementTypes
    ? String(req.query.movementTypes)
        .split(',')
        .map((type) => type.trim())
        .filter(Boolean)
    : ['Debito', 'Pago'];
  const dateFrom = req.query.dateFrom ? String(req.query.dateFrom) : '';
  const dateTo = req.query.dateTo ? String(req.query.dateTo) : '';

  const rows = [
    ...charges.map((charge) => ({
      id: charge.id,
      clientId: charge.clientId,
      clientName: clients.find((client) => client.id === charge.clientId)?.name ?? 'Sin cliente',
      date: charge.date,
      concept: charge.concept,
      type: 'Debito',
      debit: charge.amount,
      credit: 0,
    })),
    ...payments.map((payment) => ({
      id: payment.id,
      clientId: payment.clientId,
      clientName: clients.find((client) => client.id === payment.clientId)?.name ?? 'Sin cliente',
      date: payment.date,
      concept: payment.concept,
      type: 'Pago',
      debit: 0,
      credit: payment.amount,
      concepts: normalizePaymentConcepts(payment),
      method: payment.method,
      receipt: payment.receipt,
    })),
  ]
    .filter((row) => clientIds.length === 0 || clientIds.includes(row.clientId))
    .filter((row) => {
      if (concepts.length === 0) return true;
      if (row.type === 'Debito') return concepts.includes(row.concept);
      return row.concepts?.some((concept) => concepts.includes(concept.concept));
    })
    .filter((row) => movementTypes.includes(row.type))
    .filter((row) => !dateFrom || row.date >= dateFrom)
    .filter((row) => !dateTo || row.date <= dateTo)
    .sort((a, b) => a.date.localeCompare(b.date) || a.clientName.localeCompare(b.clientName));

  const totals = rows.reduce(
    (accumulator, row) => ({
      debit: accumulator.debit + row.debit,
      credit: accumulator.credit + row.credit,
      balance: accumulator.balance + row.debit - row.credit,
    }),
    { debit: 0, credit: 0, balance: 0 },
  );

  res.json({
    filters: {
      clientIds,
      concepts,
      dateFrom,
      dateTo,
      movementTypes,
    },
    rows,
    totals,
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
