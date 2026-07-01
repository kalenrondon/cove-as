const API = import.meta.env.VITE_API_URL || '';

async function request(url, options = {}) {
  const token = sessionStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['x-admin-token'] = token;

  const res = await fetch(`${API}${url}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: (password) => request('/api/login', { method: 'POST', body: JSON.stringify({ password }) }),
  getTripInfo: () => request('/api/trip-info'),
  updateTripInfo: (key, value) => request('/api/trip-info', { method: 'PUT', body: JSON.stringify({ key, value }) }),
  getDashboard: () => request('/api/dashboard'),
  getFamilies: () => request('/api/families'),
  createFamily: (data) => request('/api/families', { method: 'POST', body: JSON.stringify(data) }),
  updateFamily: (id, data) => request(`/api/families/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFamily: (id) => request(`/api/families/${id}`, { method: 'DELETE' }),
  getPeople: () => request('/api/people'),
  createPerson: (data) => request('/api/people', { method: 'POST', body: JSON.stringify(data) }),
  updatePerson: (id, data) => request(`/api/people/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePerson: (id) => request(`/api/people/${id}`, { method: 'DELETE' }),
  getPayments: () => request('/api/payments'),
  createPayment: (data) => request('/api/payments', { method: 'POST', body: JSON.stringify(data) }),
  updatePayment: (id, data) => request(`/api/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePayment: (id) => request(`/api/payments/${id}`, { method: 'DELETE' }),
  getPaymentRounds: () => request('/api/payment-rounds'),
  createPaymentRound: (data) => request('/api/payment-rounds', { method: 'POST', body: JSON.stringify(data) }),
  deletePaymentRound: (id) => request(`/api/payment-rounds/${id}`, { method: 'DELETE' }),
  getPaymentRoundDetail: (id) => request(`/api/payment-rounds/${id}`),
  deleteRoundPayment: (roundId, personId) => request(`/api/payments/round/${roundId}/person/${personId}`, { method: 'DELETE' }),
  getHistory: (params) => request(`/api/history?${params}`),
  getBudget: () => request('/api/budget'),
  createBudgetCategory: (data) => request('/api/budget/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateBudgetCategory: (id, data) => request(`/api/budget/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBudgetCategory: (id) => request(`/api/budget/categories/${id}`, { method: 'DELETE' }),
  setBudgetAlloc: (personId, categoryId, amount) => request(`/api/budget/alloc/${personId}/${categoryId}`, { method: 'PUT', body: JSON.stringify({ amount }) }),
  clearBudgetAlloc: (personId, categoryId) => request(`/api/budget/alloc/${personId}/${categoryId}`, { method: 'DELETE' }),
  createAbono: (data) => request('/api/abono', { method: 'POST', body: JSON.stringify(data) }),
  getExpenses: () => request('/api/expenses'),
  createExpense: (data) => request('/api/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/api/expenses/${id}`, { method: 'DELETE' }),
  getEvents: () => request('/api/events'),
  createEvent: (data) => request('/api/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id, data) => request(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id) => request(`/api/events/${id}`, { method: 'DELETE' }),
};
