export const PAYMENT_METHODS = ['Transferencia', 'Efectivo', 'Cheque', 'Mercado Pago'];

export const EMPTY_CLIENT_FORM = { name: '', cuit: '', email: '', phone: '' };

export const EMPTY_EMPLOYEE_FORM = {
  name: '',
  role: '',
  email: '',
  phone: '',
  commissionRate: '10',
};

export const EMPTY_CONCEPT_FORM = { concept: '', amount: '', dueDay: '10' };

export function createInitialPaymentForm(clientId = '') {
  return {
    clientId,
    concept: 'Honorarios',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    method: PAYMENT_METHODS[0],
    receipt: '',
  };
}

export function createInitialSalaryForm(employeeId = '') {
  return {
    employeeId,
    month: new Date().toISOString().slice(0, 7),
    baseSalary: '',
    paidAmount: '',
    date: new Date().toISOString().slice(0, 10),
    method: PAYMENT_METHODS[0],
    notes: '',
  };
}
