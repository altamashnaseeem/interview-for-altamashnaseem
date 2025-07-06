// LaunchTable.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DetailModal from './DetailModal';
import type { Launch, Rocket, Launchpad, Payload } from '../types';

interface Props {
  dateFilter: { start: Date; end: Date } | null;
  launchStatusFilter: string;
}

const ITEMS_PER_PAGE = 12;

const LaunchTable: React.FC<Props> = ({ dateFilter, launchStatusFilter }) => {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [rocketsMap, setRocketsMap] = useState<Record<string, string>>({});
  const [launchpadsMap, setLaunchpadsMap] = useState<Record<string, string>>({});
  const [payloadsMap, setPayloadsMap] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLaunchId, setSelectedLaunchId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [launchRes, rocketRes, launchpadRes, payloadRes] = await Promise.all([
        axios.get<Launch[]>('https://api.spacexdata.com/v4/launches'),
        axios.get<Rocket[]>('https://api.spacexdata.com/v4/rockets'),
        axios.get<Launchpad[]>('https://api.spacexdata.com/v4/launchpads'),
        axios.get<Payload[]>('https://api.spacexdata.com/v4/payloads')
      ]);

      const rocketMap: Record<string, string> = {};
      rocketRes.data.forEach(r => { rocketMap[r.id] = r.name; });

      const padMap: Record<string, string> = {};
      launchpadRes.data.forEach(p => { padMap[p.id] = p.name; });

      const payloadMap: Record<string, string> = {};
      payloadRes.data.forEach(p => { payloadMap[p.id] = p.orbit; });

      const sortedLaunches = launchRes.data.sort(
        (a, b) => new Date(b.date_utc).getTime() - new Date(a.date_utc).getTime()
      );

      setLaunches(sortedLaunches);
      setRocketsMap(rocketMap);
      setLaunchpadsMap(padMap);
      setPayloadsMap(payloadMap);
    };

    fetchData();
  }, []);

  const filteredLaunches = launches.filter(launch => {
    // Date filtering
    const isDateMatch = dateFilter
      ? (new Date(launch.date_utc) >= dateFilter.start && new Date(launch.date_utc) <= dateFilter.end)
      : true;

    // Status filtering
    let isStatusMatch = true;
    if (launchStatusFilter === 'Upcoming Launches') {
      isStatusMatch = launch.upcoming;
    } else if (launchStatusFilter === 'Successful Launches') {
      isStatusMatch = launch.success === true;
    } else if (launchStatusFilter === 'Failed Launches') {
      isStatusMatch = launch.success === false;
    }

    return isDateMatch && isStatusMatch;
  });

  const totalPages = Math.ceil(filteredLaunches.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLaunches = filteredLaunches.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, launchStatusFilter]);

  const handleRowClick = (launchId: string) => {
    setSelectedLaunchId(launchId);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLaunchId(null);
  };

  return (
    <div className="">
      {/* Added overflow-x-auto here to make the table horizontally scrollable */}
      <div className="overflow-x-auto"> 
        <table className="min-w-full table-auto text-sm border border-gray-200"> {/* Table has overall border */}
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200"> {/* Header row has bottom border */}
              <th className="p-4">No.</th>
              <th className="p-4">Launched (UTC)</th>
              <th className="p-4">Location</th>
              <th className="p-4">Mission</th>
              <th className="p-4">Orbit</th>
              <th className="p-4">Launch Status</th>
              <th className="p-4">Rocket</th>
            </tr>
          </thead>
          <tbody>
            {currentLaunches.map((launch, idx) => (
              <tr
                key={launch.id}
                className="text-center text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-200" // Data rows have bottom border
                onClick={() => handleRowClick(launch.id)}
              >
                <td className="py-4 px-2">{startIndex + idx + 1}</td>
                <td className="py-4 px-2">
                  {new Date(launch.date_utc).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'UTC'
                  })}
                </td>
                <td className="py-4 px-2">{launchpadsMap[launch.launchpad] || 'Unknown'}</td>
                <td className="py-4 px-2">{launch.name}</td>
                <td className="py-4 px-2">{payloadsMap[launch.payloads[0]] || 'Unknown'}</td>
                <td className="py-4 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    launch.upcoming
                      ? 'bg-yellow-100 text-yellow-800'
                      : launch.success
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {launch.upcoming ? 'Upcoming' : launch.success ? 'Success' : 'Failed'}
                  </span>
                </td>
                <td className="py-4 px-2">{rocketsMap[launch.rocket] || 'Unknown'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> {/* End of overflow-x-auto div */}

      {/* Pagination */}
      <div className="mt-4 flex justify-end items-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <button
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : 'border'}`}
        >
          1
        </button>

        {currentPage > 3 && <span className="px-2 py-1">...</span>}

        {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i)
          .filter((page) => page > 1 && page < totalPages)
          .map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'border'}`}
            >
              {page}
            </button>
          ))}

        {currentPage < totalPages - 2 && <span className="px-2 py-1">...</span>}

        {totalPages > 1 && (
          <button
            onClick={() => setCurrentPage(totalPages)}
            className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'border'}`}
          >
            {totalPages}
          </button>
        )}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Detail Modal */}
      {selectedLaunchId && (
        <DetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
          launchId={selectedLaunchId}
        />
      )}
    </div>
  );
};

export default LaunchTable;