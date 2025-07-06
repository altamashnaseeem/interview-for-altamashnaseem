import axios from 'axios';
import type { Launch, Launchpad, Rocket, Payload, NormalizedLaunch } from '../types';

export const fetchLaunchData = async (): Promise<NormalizedLaunch[]> => {
  const [launches, rockets, launchpads, payloads] = await Promise.all([
    axios.get<Launch[]>('https://api.spacexdata.com/v4/launches').then(res => res.data),
    axios.get<Rocket[]>('https://api.spacexdata.com/v4/rockets').then(res => res.data),
    axios.get<Launchpad[]>('https://api.spacexdata.com/v4/launchpads').then(res => res.data),
    axios.get<Payload[]>('https://api.spacexdata.com/v4/payloads').then(res => res.data),
  ]);

  const rocketMap = new Map(rockets.map(r => [r.id, r.name]));
  const launchpadMap = new Map(launchpads.map(l => [l.id, `${l.name}, ${l.locality}`]));
  const payloadMap = new Map(payloads.map(p => [p.id, p.orbit]));

  return launches.map((launch, index) => ({
    id: launch.id,
    number: launch.flight_number,
    date: new Date(launch.date_utc).toLocaleString('en-GB'),
    location: launchpadMap.get(launch.launchpad) || 'Unknown',
    mission: launch.name,
    orbit: payloadMap.get(launch.payloads[0]) || 'Unknown',
    status: launch.upcoming ? 'Upcoming' : launch.success ? 'Success' : 'Failed',
    rocket: rocketMap.get(launch.rocket) || 'Unknown',
  }));
};
