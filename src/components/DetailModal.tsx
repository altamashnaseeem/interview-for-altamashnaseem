// DetailModal.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Youtube } from 'lucide-react';
import { BiLogoWikipedia } from "react-icons/bi";

const NASA_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  launchId: string;
}

interface LaunchDetail {
  id: string;
  name: string;
  date_utc: string;
  rocket: string;
  success: boolean | null;
  upcoming: boolean;
  launchpad: string;
  flight_number: number;
  payloads: string[];
  details: string | null;
  links: {
    wikipedia: string | null;
    youtube_id: string | null;
    article: string | null;
    webcast: string | null;
    patch: {
      small: string | null;
      large: string | null;
    };
  };
}

interface RocketDetail {
  id: string;
  name: string;
  type: string;
  company: string;
  country: string;
  height: {
    meters: number | null;
    feet: number | null;
  };
  diameter: {
    meters: number | null;
    feet: number | null;
  };
}

interface LaunchpadDetail {
  id: string;
  name: string;
  full_name: string;
  locality: string;
  region: string;
}

interface PayloadDetail {
  id: string;
  name: string;
  type: string;
  orbit: string;
  nationality: string;
  manufacturer: string;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, launchId }) => {
  const [launch, setLaunch] = useState<LaunchDetail | null>(null);
  const [rocket, setRocket] = useState<RocketDetail | null>(null);
  const [launchpad, setLaunchpad] = useState<LaunchpadDetail | null>(null);
  const [payload, setPayload] = useState<PayloadDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && launchId) {
      fetchLaunchDetails();
    }
  }, [isOpen, launchId]);

  const fetchLaunchDetails = async () => {
    try {
      setLoading(true);

      const launchResponse = await axios.get<LaunchDetail>(`https://api.spacexdata.com/v4/launches/${launchId}`);
      const launchData = launchResponse.data;
      setLaunch(launchData);

      if (launchData.rocket) {
        const rocketResponse = await axios.get<RocketDetail>(`https://api.spacexdata.com/v4/rockets/${launchData.rocket}`);
        setRocket(rocketResponse.data);
      }

      if (launchData.launchpad) {
        const launchpadResponse = await axios.get<LaunchpadDetail>(`https://api.spacexdata.com/v4/launchpads/${launchData.launchpad}`);
        setLaunchpad(launchpadResponse.data);
      }

      if (launchData.payloads && launchData.payloads.length > 0) {
        const payloadResponse = await axios.get<PayloadDetail>(`https://api.spacexdata.com/v4/payloads/${launchData.payloads[0]}`);
        setPayload(payloadResponse.data);
      }
    } catch (err) {
      console.error('Error fetching launch details:', err);
      setLaunch(null);
      setRocket(null);
      setLaunchpad(null);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDateWithTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  const getStatusClasses = (success: boolean | null, upcoming: boolean) => {
    if (upcoming) return 'bg-yellow-100 text-yellow-800';
    if (success === true) return 'bg-green-100 text-green-800';
    if (success === false) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800'; // Fallback for unknown status
  };

  const getStatusText = (success: boolean | null, upcoming: boolean) => {
    if (upcoming) return 'Upcoming';
    if (success === true) return 'Success';
    if (success === false) return 'Failed';
    return 'Unknown';
  };

  if (!isOpen) return null;

  return (
    // Added overflow-x-auto to the outer fixed container
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-x-auto">
      {/* Reverted width to fixed 520px */}
      <div className="bg-white rounded-lg w-[520px] relative max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : launch ? (
          <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'inherit' }}>
            {/* Mission Icon, Name, Status, Rocket Name, and Social Icons */}
            <div className="flex items-start gap-4 mb-3">
              {launch.links?.patch?.small && (
                <img
                  src={launch.links.patch.small}
                  alt={`${launch.name} Patch`}
                  className="w-16 h-16 flex-shrink-0 object-contain"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">{launch.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(launch.success, launch.upcoming)}`}>
                    {getStatusText(launch.success, launch.upcoming)}
                  </span>
                </div>
                {/* Rocket Name - smaller, below mission name */}
                <p className="text-gray-600 text-sm mb-2">{rocket?.name || 'Unknown Rocket'}</p>

                {/* NASA, Wikipedia, YouTube Icons/Links */}
                <div className="flex gap-2 items-center">
                  {/* NASA Logo/Link (Conditional for CRS missions as an example) */}
                  {(launch.name.includes('CRS') || launch.details?.includes('NASA')) && (
                    <a
                      href="https://www.nasa.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      title="NASA Mission"
                    >
                      <img src={NASA_LOGO_URL} alt="NASA" className="w-4 h-4 object-contain" />
                    </a>
                  )}

                  {/* Wikipedia Link (using BiLogoWikipedia icon) */}
                  {launch.links?.wikipedia && (
                    <a
                      href={launch.links.wikipedia}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      title="Wikipedia"
                    >
                      <BiLogoWikipedia size={16} className="text-gray-700" />
                    </a>
                  )}

                  {/* YouTube Link - Corrected URL */}
                  {launch.links?.youtube_id && (
                    <a
                      href={`https://www.youtube.com/watch?v=${launch.links.youtube_id}`} // Corrected YouTube URL
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      title="YouTube"
                    >
                      <Youtube size={16} className="text-gray-700" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Mission description or "No details available" */}
            <div className="mb-6 text-gray-600 text-sm leading-relaxed">
              {launch.details ? (
                <>
                  {launch.details}
                </>
              ) : (
                <span className="italic">No mission description available.</span>
              )}
            </div>

            <div className="space-y-2 text-gray-900">
                {/* Flight Number */}
                <div className="flex gap-24 pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Flight Number:</span>
                    <span className="text-gray-500">{launch.flight_number}</span>
                </div>
                {/* Mission Name */}
                <div className="flex gap-24 pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Mission Name:</span>
                    <span className="text-gray-500">{launch.name}</span>
                </div>
                {/* Rocket Type */}
                <div className="flex gap-28 pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Rocket Type:</span>
                    <span className="text-gray-500">{rocket?.type || 'Unknown'}</span>
                </div>
                {/* Rocket Name */}
                <div className="flex gap-24 pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Rocket Name:</span>
                    <span className="text-gray-500">{rocket?.name || 'Unknown'}</span>
                </div>
                {/* Manufacturer */}
                <div className="flex gap-24 pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Manufacturer:</span>
                    <span className="text-gray-500">{rocket?.company || 'Unknown'}</span>
                </div>
                {/* Nationality (from rocket/country, consistent with Screenshot 37) */}
                <div className="flex gap-24 pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Nationality:</span>
                    <span className="text-gray-500">{rocket?.country || 'Unknown'}</span>
                </div>
                  {/* Height */}
                {rocket?.height?.meters && (
                    <div className="flex gap-32 pb-2 border-b border-gray-200">
                        <span className="text-sm text-gray-500">Height:</span>
                        <span className="text-gray-500">{`${rocket.height.meters}m (${rocket.height.feet}ft)`}</span>
                    </div>
                )}
                {/* Diameter */}
                {rocket?.diameter?.meters && (
                    <div className="flex gap-28 pb-2 border-b border-gray-200">
                        <span className="text-sm text-gray-500">Diameter:</span>
                        <span className="text-gray-500">{`${rocket.diameter.meters}m (${rocket.diameter.feet}ft)`}</span>
                    </div>
                )}
                {/* Launch Date */}
                <div className="flex gap-24 pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Launch Date:</span>
                    <span className="text-gray-500">{formatDateWithTime(launch.date_utc)}</span>
                </div>
                {/* Payload Type */}
                <div className="flex gap-24 pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Payload Type:</span>
                    <span className="text-gray-500">{payload?.type || 'Unknown'}</span>
                </div>
                {/* Orbit */}
                <div className="flex gap-36 pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Orbit:</span>
                    <span className="text-gray-500">{payload?.orbit || 'Unknown'}</span>
                </div>
                {/* Launch Site */}
                <div className="flex gap-20 pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Launch Site:</span>
                    <span className="text-gray-500">{launchpad?.full_name || 'Unknown'}</span>
                </div>
            </div>

          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Failed to load launch details or launch not found.
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailModal;