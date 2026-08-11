export const environment = {
  production: false,
  apiBase: 'http://localhost:3000',
};

// Exportar API_BASE por compatibilidad con código existente que espera una
// constante llamada `API_BASE` en lugar de `environment.apiBase`.
export const API_BASE = environment.apiBase;
