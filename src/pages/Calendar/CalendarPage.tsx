import { useState, useEffect } from 'react';
import {
  format,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  startOfYear,
} from 'date-fns';
import { Calendar } from 'lucide-react';
import DatePopupModal from './components/DatePopupModal';
import { createCalendarWork, getCalendarWorks } from '../../api/services/microService';

const CalendarPage = () => {
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));

  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateData, setDateData] = useState<Record<string, { client_id: number; no_of_creatives: number; no_of_videos: number; content_file?: File }>>({});

  useEffect(() => {
    loadCalendarWorks();
  }, []);

  const loadCalendarWorks = async () => {
    try {
      const response = await getCalendarWorks();
      // Handle API response structure: response.data.data contains the array
      const works = response.data?.data || [];
      const dataMap: Record<string, { client_id: number; no_of_creatives: number; no_of_videos: number; content_file?: File }> = {};
      
      works.forEach((work: any) => {
        // Parse date as local timezone to avoid timezone issues
        const [year, month, day] = work.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dateKey = dateObj.toDateString();
        dataMap[dateKey] = {
          client_id: parseInt(work.client_id),
          no_of_creatives: parseInt(work.no_of_creatives) || 0,
          no_of_videos: parseInt(work.no_of_videos) || 0,
          content_file: undefined, // API returns file URL, not File object
        };
      });
      
      setDateData(dataMap);
    } catch (error) {
      console.error('Failed to load calendar works:', error);
    }
  };
  const handleSave = async (data: { client_id: number; date: string; no_of_creatives: number; no_of_videos: number; content_file?: File }) => {
    // Update local state immediately for instant visual feedback
    if (selectedDate) {
      const dateKey = selectedDate.toDateString();
      setDateData(prev => ({ ...prev, [dateKey]: {
        client_id: data.client_id,
        no_of_creatives: data.no_of_creatives,
        no_of_videos: data.no_of_videos,
        content_file: data.content_file,
      } }));
    }

    try {
      // Call the API to save the calendar work
      await createCalendarWork({
        date: data.date,
        client_id: data.client_id,
        no_of_creatives: data.no_of_creatives,
        no_of_videos: data.no_of_videos,
        content_file: data.content_file,
      });

      // Reload calendar works to ensure data is up to date
      await loadCalendarWorks();
    } catch (error) {
      console.error('Failed to save calendar work:', error);
      // Local state was already updated, but API failed
      // Reload to revert local changes if needed
      await loadCalendarWorks();
    }
  };

  // Define special days (holidays, etc.) - REMOVED

  const renderMonth = (monthStart: Date) => {
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(
          <div
            key={day.toString()}
            className={`p-1 text-center text-[12px] font-medium border border-slate-200 cursor-pointer hover:bg-slate-100 ${
              !isSameMonth(day, monthStart)
                ? 'text-slate-300'
                : dateData[day.toDateString()]
                ? 'bg-green-100 text-green-800 font-semibold'
                : isSameDay(day, new Date())
                ? 'bg-blue-500 text-white rounded'
                : 'text-slate-700'
            }`}
            onClick={() => {
              setSelectedDate(day);
              setIsModalOpen(true);
            }}
          >
            {format(day, dateFormat)}
            {dateData[day.toDateString()]?.no_of_creatives > 0 && (
              <div className="text-[8px] text-blue-600 font-bold">
                {dateData[day.toDateString()].no_of_creatives}C
              </div>
            )}
            {dateData[day.toDateString()]?.no_of_videos > 0 && (
              <div className="text-[8px] text-green-600 font-bold">
                {dateData[day.toDateString()].no_of_videos}V
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={format(day, 'yyyy-MM-dd')} className="grid grid-cols-7 gap-1 flex-1">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 h-full flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">
          {format(monthStart, 'MMMM yyyy')}
        </h3>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-[10px] font-bold text-slate-400 text-center uppercase">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          {rows}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex items-center gap-2">
        <Calendar className="text-blue-600" size={24} />
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          Full Year Calendar - {currentYear}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {months.map((month) => (
          <div key={month.toString()} className="h-[600px]">
            {renderMonth(month)}
          </div>
        ))}
      </div>

      <DatePopupModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedDate={selectedDate}
        onSave={handleSave}
        existingData={selectedDate ? dateData[selectedDate.toDateString()] : undefined}
      />
    </div>
  );
};

export default CalendarPage;