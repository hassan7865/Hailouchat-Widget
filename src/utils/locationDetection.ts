
import { LOCATION_APIS, IP_APIS } from '../config/chatConfig';
import type { VisitorMetadata } from '../types/chat';

export const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeout: number = 5000
): Promise<Response> => {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
};

export const getLocationData = async (): Promise<Partial<VisitorMetadata>> => {
  for (const api of LOCATION_APIS) {
    try {
      console.log(`Trying location API: ${api.url}`);
      const response = await fetchWithTimeout(api.url, {}, 3000);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Location data from ${api.url}:`, data);
        
        const locationData = api.transform(data);
        
        if (locationData.city || locationData.country) {
          return {
            ...locationData,
            timezone: locationData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
          };
        }
      } else {
        console.log(`Location API ${api.url} returned status:`, response.status);
      }
    } catch (error: any) {
      console.log(`Failed to fetch location from ${api.url}:`, error.message);
      continue;
    }
  }
  
  console.log('All location APIs failed, using fallback data');
  
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

export const getIPAddress = async (): Promise<string | undefined> => {
  for (const apiUrl of IP_APIS) {
    try {
      console.log(`Trying IP API: ${apiUrl}`);
      const response = await fetchWithTimeout(apiUrl, {}, 3000);
      
      if (response.ok) {
        const data = await response.text();
        
        let ip: string;
        try {
          const jsonData = JSON.parse(data);
          ip = jsonData.ip || jsonData.query || data;
        } catch {
          ip = data.trim();
        }
        
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        if (ipRegex.test(ip)) {
          console.log(`Got IP from ${apiUrl}:`, ip);
          return ip;
        }
      } else {
        console.log(`IP API ${apiUrl} returned status:`, response.status);
      }
    } catch (error: any) {
      console.log(`Failed to fetch IP from ${apiUrl}:`, error.message);
      continue;
    }
  }
  
  console.log('All IP APIs failed');
  return undefined;
};
