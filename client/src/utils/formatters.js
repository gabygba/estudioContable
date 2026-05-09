const currencyFormatter = new Intl.NumberFormat('es-AR', {
  currency: 'ARS',
  maximumFractionDigits: 0,
  style: 'currency',
});

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

export function getClientName(clients, clientId) {
  return clients.find((client) => client.id === Number(clientId))?.name ?? 'Sin cliente';
}

export function getMovementPaymentMethod(movement) {
  if (movement.movementType !== 'Pago') return '-';

  return movement.method || 'Sin medio';
}

export function getMovementPaymentMethodTone(movement) {
  if (movement.movementType !== 'Pago') return 'none';

  const method = (movement.method || '').trim().toLowerCase();

  if (method.includes('efectivo')) return 'cash';
  if (method.includes('transfer')) return 'transfer';
  if (method.includes('tarjeta')) return 'card';
  if (method.includes('cheque')) return 'check';

  return 'default';
}

export function getEmployeeName(employees, employeeId) {
  return employees.find((employee) => employee.id === Number(employeeId))?.name ?? 'Sin empleado';
}
