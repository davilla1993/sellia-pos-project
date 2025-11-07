export const environment = {
  production: true,
  // En production, utiliser des URLs relatives car le frontend est servi par le même serveur que le backend
  apiUrl: '/api',
  wsUrl: `ws://${window.location.host}/ws`,
  uploadsUrl: '/uploads'
};
