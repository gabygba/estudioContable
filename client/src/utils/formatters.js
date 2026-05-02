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

export function getEmployeeName(employees, employeeId) {
  return employees.find((employee) => employee.id === Number(employeeId))?.name ?? 'Sin empleado';
}
