
export interface Launch {
  id: string;
  name: string;
  date_utc: string;
  rocket: string;
  success: boolean | null;
  upcoming: boolean; 
  launchpad: string;
  flight_number: number;
  payloads: string[];
}


export interface Rocket {
  id: string;
  name: string;
}

export interface Launchpad {
  id: string;
  name: string;
  locality: string;
}

export interface Payload {
  id: string;
  orbit: string;
}

export interface NormalizedLaunch {
  id: string;
  number: number;
  date: string;
  location: string;
  mission: string;
  orbit: string;
  status: string;
  rocket: string;
}
