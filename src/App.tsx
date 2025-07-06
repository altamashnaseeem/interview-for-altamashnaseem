import { useState } from 'react';
import LaunchTable from './components/LaunchTable';
import { CiCalendar } from "react-icons/ci";
import { FaAngleDown } from "react-icons/fa";
import { RiFilterLine } from "react-icons/ri";
import DateRangeModal from './components/TimeModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<{ start: Date; end: Date; presetName: string | null } | null>(null);
  
  const [launchStatusFilter, setLaunchStatusFilter] = useState<string>('All Launches');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<boolean>(false);

  const handleApply = (startDate: Date | null, endDate: Date | null, presetName: string | null): void => {
    if (startDate && endDate) {
      setDateFilter({ start: startDate, end: endDate, presetName: presetName });
    } else {
      setDateFilter(null); 
    }
  };

  const formatDateRange = (): string => {
    if (!dateFilter) {
      return "Select Timeframe"; 
    }

    if (dateFilter.presetName) {
      return dateFilter.presetName; 
    }

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const startFormatted = dateFilter.start.toLocaleDateString('en-US', options);
    const endFormatted = dateFilter.end.toLocaleDateString('en-US', options);

    if (dateFilter.start.toDateString() === dateFilter.end.toDateString()) {
      return startFormatted;
    }

    return `${startFormatted} - ${endFormatted}`;
  };

  const handleStatusSelect = (status: string) => {
    setLaunchStatusFilter(status);
    setIsStatusDropdownOpen(false); 
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pb-12">
      <img src="https://upload.wikimedia.org/wikipedia/commons/d/de/SpaceX-Logo.svg" alt="SpaceX" className="h-12 mx-auto my-6" />
      <hr className="w-full max-w-[952px] border-gray-200 mb-8" />
      <div className='w-full max-w-[952px] mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Filters */}
        <div className='flex justify-between pb-8 pt-4'>
          <div
            onClick={() => setIsModalOpen(true)}
            className='flex gap-2 items-center text-gray-700 hover:bg-gray-300 cursor-pointer p-1 px-2 rounded'
          >
            <CiCalendar />
            <span>{formatDateRange()}</span>
            <FaAngleDown />
          </div>

          <div className='relative'>
            <div
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className='flex gap-2 items-center text-gray-700 hover:bg-gray-300 cursor-pointer p-1 px-2 rounded'
            >
              <RiFilterLine />
              <span>{launchStatusFilter}</span> 
              <FaAngleDown />
            </div>

            {isStatusDropdownOpen && (
              <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10'>
                <ul className='py-1'>
                  {['All Launches', 'Upcoming Launches', 'Successful Launches', 'Failed Launches'].map((status) => (
                    <li
                      key={status}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${launchStatusFilter === status ? 'bg-gray-100 font-medium' : ''}`}
                      onClick={() => handleStatusSelect(status)}
                    >
                      {status}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <LaunchTable dateFilter={dateFilter} launchStatusFilter={launchStatusFilter} /> {/* Pass launchStatusFilter */}
      </div>

      <DateRangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleApply}
      />
    </div>
  );
}

export default App;