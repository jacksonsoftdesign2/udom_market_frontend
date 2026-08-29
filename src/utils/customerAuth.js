const TOKEN_KEY = "customerToken";
const CUSTOMER_KEY = "customerData";

export function getCustomerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCustomerData() {
  const raw = localStorage.getItem(CUSTOMER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setCustomerSession(token, customer) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
}

export function clearCustomerSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_KEY);
}

export function isCustomerLoggedIn() {
  return !!getCustomerToken();
}