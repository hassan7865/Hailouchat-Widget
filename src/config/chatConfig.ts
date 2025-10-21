export const DEFAULT_CONFIG = {
  API_BASE: 'http://localhost:8000/api/v1',
  WS_BASE: 'ws://localhost:8000',
  POSITION: 'bottom-right' as const,
  THEME: 'light' as const,
};

export const LOCATION_APIS = [
  {
    url: 'https://ipapi.co/json/',
    transform: (data: any) => ({
      city: data.city,
      region: data.region,
      country: data.country_name,
      timezone: data.timezone
    })
  },
  {
    url: 'https://ipinfo.io/json',
    transform: (data: any) => ({
      city: data.city,
      region: data.region,
      country: data.country,
      timezone: data.timezone
    })
  }
];

export const IP_APIS = [
  'https://api.ipify.org?format=json',
  'https://ipinfo.io/ip'
];
