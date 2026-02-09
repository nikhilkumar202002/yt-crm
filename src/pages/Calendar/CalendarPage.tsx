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
import { createCalendarWork, getCalendarWorks, getClients } from '../../api/services/microService';

const CalendarPage = () => {
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));

  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allDateData, setAllDateData] = useState<Record<string, { client_id: number; no_of_creatives: number; no_of_videos: number; content_file?: File }>>({});
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [isClientLoading, setIsClientLoading] = useState(false);
  const [isClientsLoading, setIsClientsLoading] = useState(true);

  // Filtered data based on selected client
  const dateData = selectedClient 
    ? Object.fromEntries(
        Object.entries(allDateData).filter(([_, work]) => work.client_id === selectedClient)
      )
    : allDateData;

  useEffect(() => {
    loadCalendarWorks();
  }, []);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsClientsLoading(true);
        const response = await getClients();
        const clientList = response.data?.data || response.data || [];
        setClients(clientList);
        // Auto-select first client if available
        if (clientList.length > 0 && !selectedClient) {
          setSelectedClient(clientList[0].id);
        }
      } catch (error) {
        console.error('Failed to load clients:', error);
      } finally {
        setIsClientsLoading(false);
      }
    };

    loadClients();
  }, []);

  // Handle client selection loading
  useEffect(() => {
    if (selectedClient !== null) {
      setIsClientLoading(true);
      // Simulate loading time for better UX
      const timer = setTimeout(() => {
        setIsClientLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedClient]);

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
      
      setAllDateData(dataMap);
    } catch (error) {
      console.error('Failed to load calendar works:', error);
    }
  };
  const handleSave = async (data: { client_id: number; date: string; no_of_creatives: number; no_of_videos: number; content_file?: File }) => {
    console.log('CalendarPage: Received data to save:', data);
    // Update local state immediately for instant visual feedback
    if (selectedDate) {
      const dateKey = selectedDate.toDateString();
      setAllDateData(prev => ({ ...prev, [dateKey]: {
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
        const currentDay = day;
        days.push(
          <div
            key={currentDay.toString()}
            className={`p-1 text-center text-[12px] font-medium border border-slate-200 cursor-pointer hover:bg-slate-100 ${
              !isSameMonth(currentDay, monthStart)
                ? 'text-slate-300'
                : dateData[currentDay.toDateString()]
                ? 'bg-green-100 text-green-800 font-semibold'
                : isSameDay(currentDay, new Date())
                ? 'bg-blue-500 text-white rounded'
                : 'text-slate-700'
            }`}
            onClick={() => {
              setSelectedDate(currentDay);
              setIsModalOpen(true);
            }}
          >
            {format(currentDay, dateFormat)}
            {dateData[currentDay.toDateString()]?.no_of_creatives > 0 && (
              <div className="text-[8px] text-blue-600 font-bold">
                {dateData[currentDay.toDateString()].no_of_creatives}C
              </div>
            )}
            {dateData[currentDay.toDateString()]?.no_of_videos > 0 && (
              <div className="text-[8px] text-green-600 font-bold">
                {dateData[currentDay.toDateString()].no_of_videos}V
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="text-blue-600" size={24} />
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Full Year Calendar - {currentYear}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Client:</label>
          <select
            value={selectedClient || ''}
            onChange={(e) => setSelectedClient(e.target.value ? parseInt(e.target.value) : null)}
            disabled={isClientLoading || isClientsLoading}
            className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            {isClientsLoading ? (
              <option>Loading clients...</option>
            ) : (
              <>
                <option value="">All Clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.company_name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 relative">
        {(isClientLoading || isClientsLoading) && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium">
                {isClientsLoading ? 'Loading clients...' : 'Loading calendar...'}
              </span>
            </div>
          </div>
        )}
        {months.map((month) => (
          <div key={month.toString()} className="h-[600px]">
            {renderMonth(month)}
          </div>
        ))}
      </div>

      <DatePopupModal
        key={selectedDate?.toISOString()}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedDate={selectedDate}
        selectedClient={selectedClient}
        onSave={handleSave}
        existingData={selectedDate ? dateData[selectedDate.toDateString()] : undefined}
      />
    </div>
  );
};

export default CalendarPage;