// TimeModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { TiArrowSortedUp } from "react-icons/ti";
import { TiArrowSortedDown } from "react-icons/ti";
import { IoClose, IoChevronBack, IoChevronForward } from 'react-icons/io5';

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date | null, endDate: Date | null, presetName: string | null) => void;
}

const DateRangeModal: React.FC<DateRangeModalProps> = ({ isOpen, onClose, onApply }) => {
  const [leftCalendarMonthIdx, setLeftCalendarMonthIdx] = useState<number>(new Date().getMonth());
  const [leftCalendarYear, setLeftCalendarYear] = useState<number>(new Date().getFullYear());

  const [rightCalendarMonthIdx, setRightCalendarMonthIdx] = useState<number>((new Date().getMonth() + 1) % 12);
  const [rightCalendarYear, setRightCalendarYear] = useState<number>(
    new Date().getMonth() === 11 ? new Date().getFullYear() + 1 : new Date().getFullYear()
  );

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(null);
      const now = new Date();
      setLeftCalendarMonthIdx(now.getMonth());
      setLeftCalendarYear(now.getFullYear());
      setRightCalendarMonthIdx((now.getMonth() + 1) % 12);
      setRightCalendarYear(now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear());
      setStartDate(null);
      setEndDate(null);
    }
  }, [isOpen]);

  const presets: string[] = [
    'Past Week',
    'Past Month',
    'Past 3 Months',
    'Past 6 Months',
    'Past Year',
    'Past 2 Years',
    'Clear'
  ];

  const monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getMinMaxYear = () => {
    const currentYearValue = new Date().getFullYear();
    return { min: currentYearValue - 20, max: currentYearValue + 20 };
  };
  const { min: minYear, max: maxYear } = useMemo(getMinMaxYear, []);

  const getDaysInMonth = (year: number, monthIdx: number): (number | null)[] => {
    const firstDay = new Date(year, monthIdx, 1);
    const lastDay = new Date(year, monthIdx + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const navigateMonths = (direction: 'prev' | 'next'): void => {
    setSelectedPreset(null);

    if (direction === 'prev') {
      setLeftCalendarMonthIdx(prev => (prev === 0 ? 11 : prev - 1));
      setLeftCalendarYear(prev => (leftCalendarMonthIdx === 0 ? prev - 1 : prev));

      setRightCalendarMonthIdx(prev => (prev === 0 ? 11 : prev - 1));
      setRightCalendarYear(prev => (rightCalendarMonthIdx === 0 ? prev - 1 : prev));
    } else { // 'next'
      setLeftCalendarMonthIdx(prev => (prev === 11 ? 0 : prev + 1));
      setLeftCalendarYear(prev => (leftCalendarMonthIdx === 11 ? prev + 1 : prev));

      setRightCalendarMonthIdx(prev => (prev === 11 ? 0 : prev + 1));
      setRightCalendarYear(prev => (rightCalendarMonthIdx === 11 ? prev + 1 : prev));
    }
  };

  // Handler for individual month up/down arrows
  const handleMonthNav = (direction: 'up' | 'down', calendar: 'left' | 'right') => {
    setSelectedPreset(null);
    if (calendar === 'left') {
      setLeftCalendarMonthIdx(prev => {
        const newIdx = direction === 'up' ? (prev + 1) % 12 : (prev - 1 + 12) % 12;
        if (direction === 'up' && newIdx === 0) setLeftCalendarYear(y => y + 1); 
        if (direction === 'down' && newIdx === 11) setLeftCalendarYear(y => y - 1); 
        return newIdx;
      });
    } else { 
      setRightCalendarMonthIdx(prev => {
        const newIdx = direction === 'up' ? (prev + 1) % 12 : (prev - 1 + 12) % 12;
        if (direction === 'up' && newIdx === 0) setRightCalendarYear(y => y + 1);
        if (direction === 'down' && newIdx === 11) setRightCalendarYear(y => y - 1);
        return newIdx;
      });
    }
  };

  
  const handleYearNav = (direction: 'up' | 'down', calendar: 'left' | 'right') => {
    setSelectedPreset(null);
    if (calendar === 'left') {
      setLeftCalendarYear(prevYear => {
        const newYear = direction === 'up' ? prevYear + 1 : prevYear - 1;
        return Math.max(minYear, Math.min(maxYear, newYear));
      });
    } else { 
      setRightCalendarYear(prevYear => {
        const newYear = direction === 'up' ? prevYear + 1 : prevYear - 1;
        return Math.max(minYear, Math.min(maxYear, newYear));
      });
    }
  };


  const handlePresetClick = (preset: string): void => {
    setSelectedPreset(preset);

    if (preset === 'Clear') {
      setStartDate(null);
      setEndDate(null);
      const now = new Date();
      setLeftCalendarMonthIdx(now.getMonth());
      setLeftCalendarYear(now.getFullYear());
      setRightCalendarMonthIdx((now.getMonth() + 1) % 12);
      setRightCalendarYear(now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear());
      return;
    }

    const now = new Date();
    const currentEndOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const pastDate = new Date();
    pastDate.setHours(0, 0, 0, 0);

    switch (preset) {
      case 'Past Week':
        pastDate.setDate(now.getDate() - 7);
        break;
      case 'Past Month':
        pastDate.setMonth(now.getMonth() - 1);
        if (pastDate.getDate() > now.getDate()) {
          pastDate.setDate(0);
        }
        break;
      case 'Past 3 Months':
        pastDate.setMonth(now.getMonth() - 3);
        if (pastDate.getDate() > now.getDate()) {
          pastDate.setDate(0);
        }
        break;
      case 'Past 6 Months':
        pastDate.setMonth(now.getMonth() - 6);
        if (pastDate.getDate() > now.getDate()) {
          pastDate.setDate(0);
        }
        break;
      case 'Past Year':
        pastDate.setFullYear(now.getFullYear() - 1);
        if (pastDate.getMonth() === now.getMonth() && pastDate.getDate() > now.getDate()) {
          pastDate.setMonth(pastDate.getMonth() - 1);
          pastDate.setDate(now.getDate());
        }
        break;
      case 'Past 2 Years':
        pastDate.setFullYear(now.getFullYear() - 2);
        if (pastDate.getMonth() === now.getMonth() && pastDate.getDate() > now.getDate()) {
          pastDate.setMonth(pastDate.getMonth() - 1);
          pastDate.setDate(now.getDate());
        }
        break;
      default:
        return;
    }

    setStartDate(pastDate);
    setEndDate(currentEndOfDay);

    
    setLeftCalendarMonthIdx(pastDate.getMonth());
    setLeftCalendarYear(pastDate.getFullYear());
    
    setRightCalendarMonthIdx((pastDate.getMonth() + 1) % 12);
    setRightCalendarYear(pastDate.getMonth() === 11 ? pastDate.getFullYear() + 1 : pastDate.getFullYear());
  };

  const handleDayClick = (day: number, year: number, monthIdx: number): void => {
    const clickedDate = new Date(year, monthIdx, day);
    clickedDate.setHours(0, 0, 0, 0);

    setSelectedPreset(null); // Clear any selected preset when a manual day is clicked

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (clickedDate.getTime() === startDate.getTime()) {
        setStartDate(null);
        setEndDate(null);
      } else if (clickedDate > startDate) {
        setEndDate(clickedDate);
      } else {
        setEndDate(startDate);
        setStartDate(clickedDate);
      }
    }
  };

  const normalizeDateToStartOfDay = (date: Date | null): Date | null => {
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  };

  const normalizeDateToEndOfDay = (date: Date | null): Date | null => {
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  };

  const isDateInRange = (day: number, year: number, monthIdx: number): boolean => {
    if (!startDate) return false;

    const dateToCheck = normalizeDateToStartOfDay(new Date(year, monthIdx, day));
    if (!dateToCheck) return false;

    const normalizedStartDate = normalizeDateToStartOfDay(startDate);
    const normalizedEndDate = normalizeDateToEndOfDay(endDate);

    if (normalizedStartDate && normalizedEndDate) {
      return dateToCheck >= normalizedStartDate && dateToCheck <= normalizedEndDate;
    } else if (normalizedStartDate && !normalizedEndDate) {
      return dateToCheck.getTime() === normalizedStartDate.getTime();
    }
    return false;
  };

  const isDateStart = (day: number, year: number, monthIdx: number): boolean => {
    if (!startDate) return false;
    const date = normalizeDateToStartOfDay(new Date(year, monthIdx, day));
    return date?.getTime() === normalizeDateToStartOfDay(startDate)?.getTime();
  };

  const isDateEnd = (day: number, year: number, monthIdx: number): boolean => {
    if (!endDate) return false;
    const date = normalizeDateToStartOfDay(new Date(year, monthIdx, day));
    return date?.getTime() === normalizeDateToStartOfDay(endDate)?.getTime();
  };

  const CalendarGrid: React.FC<{ year: number; monthIdx: number }> = ({ year, monthIdx }) => {
    const days = getDaysInMonth(year, monthIdx);

    return ( 
      <div className="flex-1 px-8">
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {dayNames.map(day => (
            <div key={day} className="text-gray-500 font-medium py-2 text-xs">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            const isCurrentDay = day ? isDateInRange(day, year, monthIdx) : false;
            const isStart = day ? isDateStart(day, year, monthIdx) : false;
            const isEnd = day ? isDateEnd(day, year, monthIdx) : false;

            return (
              <div
                key={index}
                onClick={() => day && handleDayClick(day, year, monthIdx)}
                className={`h-8 w-8 mx-auto flex items-center justify-center text-sm cursor-pointer
                  ${day ?
                    isCurrentDay
                      ? isStart && isEnd 
                        ? 'bg-blue-500 text-white rounded-full'
                        : isStart 
                          ? 'bg-blue-500 text-white rounded-l-full'
                          : isEnd 
                            ? 'bg-blue-500 text-white rounded-r-full'
                            : 'bg-blue-100 text-blue-600 rounded-none' 
                      : 'text-gray-700 hover:bg-gray-100 rounded' 
                    : '' 
                  }
                `}
              >
                {day || ''}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    // Added overflow-x-auto to the outer fixed container for horizontal scrolling
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-x-auto">
      <div className="bg-white w-[720px] rounded-lg shadow-xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <IoClose size={20} />
        </button>

        <div className="flex">
          {/* Left sidebar with presets */}
          <div className="w-40 border-r border-gray-200 py-4">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors
                  ${preset === 'Clear' ? 'text-red-500' : 'text-gray-700'}
                  ${selectedPreset === preset ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}
                `}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Right side with calendar */}
          <div className="flex-1 p-6">
            {/* Calendar header with navigation */}
            <div className="flex items-center justify-between mb-6 px-2">
              <button
                onClick={() => navigateMonths('prev')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <IoChevronBack size={20} className="text-gray-600" />
              </button>

              {/* Left Calendar Month and Year Controls */}
              <div className="flex items-center gap-1">
                {/* Month Control */}
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold text-gray-800 w-24 text-right">
                    {monthNames[leftCalendarMonthIdx]}
                  </span>
                  <div className="flex flex-col text-gray-500">
                    <TiArrowSortedUp size={16} className="cursor-pointer hover:text-gray-700" onClick={() => handleMonthNav('up', 'left')} />
                    <TiArrowSortedDown size={16} className="cursor-pointer hover:text-gray-700" onClick={() => handleMonthNav('down', 'left')} />
                  </div>
                </div>
                {/* Year Control */}
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-lg font-semibold text-gray-800 w-16 text-right">
                    {leftCalendarYear}
                  </span>
                  <div className="flex flex-col text-gray-500">
                    <TiArrowSortedUp size={16} className="cursor-pointer hover:text-gray-700" onClick={() => handleYearNav('up', 'left')} />
                    <TiArrowSortedDown size={16} className="cursor-pointer hover:text-gray-700" onClick={() => handleYearNav('down', 'left')} />
                  </div>
                </div>
              </div>

              {/* Right Calendar Month and Year Controls */}
              <div className="flex items-center gap-1">
                {/* Month Control */}
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold text-gray-800 w-24 text-right">
                    {monthNames[rightCalendarMonthIdx]}
                  </span>
                  <div className="flex flex-col text-gray-500">
                    <TiArrowSortedUp size={16} className="cursor-pointer hover:text-gray-700" onClick={() => handleMonthNav('up', 'right')} />
                    <TiArrowSortedDown size={16} className="cursor-pointer hover:text-gray-700" onClick={() => handleMonthNav('down', 'right')} />
                  </div>
                </div>
                {/* Year Control */}
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-lg font-semibold text-gray-800 w-16 text-right">
                    {rightCalendarYear}
                  </span>
                  <div className="flex flex-col text-gray-500">
                    <TiArrowSortedUp size={16} className="cursor-pointer hover:text-gray-700" onClick={() => handleYearNav('up', 'right')} />
                    <TiArrowSortedDown size={16} className="cursor-pointer hover:text-gray-700" onClick={() => handleYearNav('down', 'right')} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateMonths('next')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <IoChevronForward size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Calendar grids */}
            <div className="flex gap-8 mb-6">
              <CalendarGrid year={leftCalendarYear} monthIdx={leftCalendarMonthIdx} />
              <CalendarGrid year={rightCalendarYear} monthIdx={rightCalendarMonthIdx} />
            </div>

            {/* Apply button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  const finalStartDate = normalizeDateToStartOfDay(startDate);
                  const finalEndDate = normalizeDateToEndOfDay(endDate);

                  
                  let appliedPresetName: string | null = null;

                  
                  if (selectedPreset && selectedPreset !== 'Clear') {
                    appliedPresetName = selectedPreset;
                  }
                  

                  onApply(finalStartDate, finalEndDate, appliedPresetName); 
                  onClose();
                }}
                className="bg-black hover:opacity-80 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeModal;