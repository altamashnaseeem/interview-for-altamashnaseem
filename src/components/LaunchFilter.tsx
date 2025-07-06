import React, { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { RiFilterLine } from 'react-icons/ri';

interface LaunchStatusFilterProps {
  onSelectStatus: (status: string | null) => void;
}

const LaunchStatusFilter: React.FC<LaunchStatusFilterProps> = ({ onSelectStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('All Launches');

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setIsOpen(false);
    onSelectStatus(status === 'All Launches' ? null : status); // Pass null for 'All Launches' to clear filter
  };

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex gap-2 items-center text-gray-700 hover:bg-gray-300 cursor-pointer p-1 px-2 rounded"
      >
        <RiFilterLine />
        <span>{selectedStatus}</span>
        <FaAngleDown />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <ul className="py-1">
            {['All Launches', 'Upcoming Launches', 'Successful Launches', 'Failed Launches'].map((status) => (
              <li
                key={status}
                onClick={() => handleStatusSelect(status)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
              >
                {status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LaunchStatusFilter;