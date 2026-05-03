const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  const config = {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body !== undefined) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? 'No se pudo completar la operacion');
  }

  return data;
}

function buildQueryParams(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      searchParams.set(key, value.join(','));
      return;
    }

    if (!Array.isArray(value) && value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const accountingApi = {
  getDashboard: () => request('/api/dashboard'),

  getClients: () => request('/api/clients'),
  getClient: (clientId) => request(`/api/clients/${clientId}`),
  createClient: (client) => request('/api/clients', { method: 'POST', body: client }),
  updateClient: (clientId, client) => request(`/api/clients/${clientId}`, { method: 'PUT', body: client }),
  deleteClient: (clientId) => request(`/api/clients/${clientId}`, { method: 'DELETE' }),

  createConcept: (clientId, concept) =>
    request(`/api/clients/${clientId}/concepts`, { method: 'POST', body: concept }),
  updateConcept: (clientId, conceptId, concept) =>
    request(`/api/clients/${clientId}/concepts/${conceptId}`, { method: 'PATCH', body: concept }),

  getCharges: () => request('/api/charges'),
  createCharge: (charge) => request('/api/charges', { method: 'POST', body: charge }),

  getPayments: () => request('/api/payments'),
  createPayment: (payment) => request('/api/payments', { method: 'POST', body: payment }),

  getMovementsReport: (filters) => request(`/api/reports/movements${buildQueryParams(filters)}`),

  getEmployees: () => request('/api/employees'),
  getEmployee: (employeeId) => request(`/api/employees/${employeeId}`),
  createEmployee: (employee) => request('/api/employees', { method: 'POST', body: employee }),
  updateEmployee: (employeeId, employee) =>
    request(`/api/employees/${employeeId}`, { method: 'PUT', body: employee }),
  deleteEmployee: (employeeId) => request(`/api/employees/${employeeId}`, { method: 'DELETE' }),

  getSalaries: () => request('/api/salaries'),
  createSalary: (salary) => request('/api/salaries', { method: 'POST', body: salary }),
};
