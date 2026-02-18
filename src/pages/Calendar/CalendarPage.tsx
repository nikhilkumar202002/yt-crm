import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { ChevronLeft, ChevronRight, FileText, Video } from 'lucide-react';
import DatePopupModal from './components/DatePopupModal';
import { createCalendarWork, getCalendarWorks, getClients, getCalendarWorkCreatives, getProposals } from '../../api/services/microService';
import { useAppSelector } from '../../store/store';

// Type definitions
interface Client {
  id: number;
  name: string;
  company_name: string;
  proposal_id?: number;
}

interface CreativeWork {
  id: string;
  name: string;
  nos: string;
}

interface Work {
  date: string;
  client_id: string;
  content_description: string;
  description: string;
  notes: string;
  creatives: Creative[];
  is_special_day: boolean;
}

interface Creative {
  id: number;
  name: string;
  type: string;
  url?: string;
}

interface CalendarWorkCreative {
  id: number;
  name: string;
  description: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CalendarWorkData {
  client_id: number;
  work_description?: string;
  items: { description: string }[];
  content_file?: File;
  notes?: string;
  creative_works?: CreativeWork[];
  is_special_day?: boolean;
}

interface ModalData {
  work_description?: string;
  items: { description: string }[];
  notes?: string;
  creative_works?: CreativeWork[];
  is_special_day?: boolean;
}

interface Proposal {
  id: number;
  lead_assign_id: number;
  creatives_nos: string | number;
  videos_nos: string | number;
  amount: number;
  gst_percentage: number;
  file_url?: string;
  is_accepted?: boolean;
  lead_assign?: {
    lead?: {
      client_id: number;
      name?: string;
      company_name?: string;
      email?: string;
      phone_number?: string;
    };
    client_id?: number;
  };
}

const CalendarPage = () => {
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));

  // Memoize months array to avoid recalculating
  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i)), 
    [yearStart]
  );

  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());

  // Memoize client change handler
  const handleClientChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClient(e.target.value ? parseInt(e.target.value) : null);
  }, []);

  // Memoize month navigation handlers
  const handlePreviousMonth = useCallback(() => {
    setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1));
  }, []);

  const handleMonthSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonthIndex(parseInt(e.target.value));
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allDateData, setAllDateData] = useState<Record<string, CalendarWorkData>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [isClientLoading, setIsClientLoading] = useState(false);
  const [isClientsLoading, setIsClientsLoading] = useState(true);
  const [calendarWorkCreatives, setCalendarWorkCreatives] = useState<CalendarWorkCreative[]>([]);
  const [contentModal, setContentModal] = useState<{ isOpen: boolean; file: File | null }>({ isOpen: false, file: null });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; data: ModalData | null }>({ isOpen: false, data: null });
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // Get user group for conditional rendering
  const { group } = useAppSelector((state) => state.auth);
  const isDMGroup = group?.toUpperCase() === 'DIGITAL MARKETING' || group?.toUpperCase() === 'DM';

  // Get proposal data for selected client - memoized for performance
  const clientProposal = useMemo(() => {
    if (!selectedClient || proposals.length === 0) return null;

    // Find the client
    const client = clients.find(c => c.id === selectedClient);

    if (!client || !client.proposal_id) return null;

    // Find proposal by proposal_id
    const proposal = proposals.find((p: Proposal) => Number(p.id) === Number(client.proposal_id));

    return proposal || null;
  }, [selectedClient, proposals, clients]);

  // Filtered data based on selected client - memoized for performance
  const dateData = useMemo(() => {
    if (!selectedClient) return allDateData;
    return Object.fromEntries(
      Object.entries(allDateData).filter(([, work]) => work.client_id === selectedClient)
    );
  }, [allDateData, selectedClient]);

  const loadCalendarWorks = useCallback(async () => {
    try {
      console.log('Loading calendar works...');
      const response = await getCalendarWorks();
      console.log('Calendar works response:', response);
      const works = response.data?.data || [];
      console.log('Parsed works:', works);
      
      const dataMap: Record<string, CalendarWorkData> = {};
      
      works.forEach((work: Work) => {
        console.log('Processing work:', work);
        const [year, month, day] = work.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dateKey = dateObj.toDateString();
        console.log('Date key:', dateKey);
        
        dataMap[dateKey] = {
          client_id: parseInt(work.client_id),
          work_description: work.content_description || '',
          items: JSON.parse(work.description || '[]'),
          content_file: undefined,
          notes: work.notes || '',
          creative_works: work.creatives || [],
          is_special_day: work.is_special_day || false,
        };
      });
      
      console.log('Final dataMap:', dataMap);
      setAllDateData(dataMap);
    } catch (error) {
      console.error('Failed to load calendar works:', error);
    }
  }, []);

  useEffect(() => {
    loadCalendarWorks();
  }, [loadCalendarWorks]); // loadCalendarWorks is stable with empty dependencies

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsClientsLoading(true);
        
        // Load clients and creative templates first
        const [clientsRes, creativesResponse] = await Promise.all([
          getClients(1),
          getCalendarWorkCreatives()
        ]);

        const allClients = clientsRes?.data?.data || [];

        setClients(allClients);
        
        // Auto-select first client if available
        if (allClients.length > 0 && !selectedClient) {
          setSelectedClient(allClients[0].id);
        }
        
        setCalendarWorkCreatives(creativesResponse.data?.data || []);

        // Fetch all proposals and leads in parallel
        const [proposalsData] = await Promise.all([
          // Fetch all proposals (handle pagination)
          (async () => {
            try {
              const firstProposalRes = await getProposals(1);
              const firstPageData = firstProposalRes?.data?.data || [];
              const totalPages = firstProposalRes?.data?.last_page || 1;
              
              let allProposals = [...firstPageData];
              
              if (totalPages > 1) {
                // Fetch remaining pages in parallel
                const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
                const remainingResponses = await Promise.all(
                  remainingPages.map(p => getProposals(p))
                );
                
                remainingResponses.forEach(res => {
                  const pageData = res?.data?.data || [];
                  allProposals = allProposals.concat(pageData);
                });
              }
              console.log('All proposals loaded:', allProposals);
              return allProposals;
            } catch (error) {
              console.warn("Could not fetch proposals:", error);
              return [];
            }
          })()
        ]);

        setProposals(proposalsData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setCalendarWorkCreatives([]);
        setProposals([]);
      } finally {
        setIsClientsLoading(false);
      }
    };

    loadInitialData();
  }, [selectedClient]); // Include selectedClient since it's used in the effect

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

  const constructCreativeWorks = useCallback((description: string): CreativeWork[] => {
    try {
      const items = JSON.parse(description || '[]');
      if (!items?.calendar_works_creative_ids || !items?.creative_nos) return [];
      
      const ids = items.calendar_works_creative_ids.split(',');
      const nos = items.creative_nos.split(',');
      
      return ids.map((id: string, index: number) => {
        const creative = calendarWorkCreatives.find(c => c.id === parseInt(id));
        return {
          id,
          name: creative?.name || 'Unknown',
          nos: nos[index] || '0'
        };
      });
    } catch {
      return [];
    }
  }, [calendarWorkCreatives]);

  const handleSave = useCallback(async (data: { client_id: number; date: string; description: string; content_description: string; notes: string; content_file?: File | null; is_special_day?: boolean }) => {
    if (!selectedDate) return;

    const dateKey = selectedDate.toDateString();
    const creative_works = constructCreativeWorks(data.description);

    // Optimistic update
    setAllDateData(prev => ({
      ...prev,
      [dateKey]: {
        client_id: data.client_id,
        work_description: data.content_description,
        items: JSON.parse(data.description || '[]'),
        content_file: data.content_file ?? undefined,
        notes: data.notes,
        creative_works,
        is_special_day: data.is_special_day,
      }
    }));

    try {
      await createCalendarWork({
        date: data.date,
        client_id: data.client_id,
        description: data.description,
        content_description: data.content_description,
        notes: data.notes,
        content_file: data.content_file ?? undefined,
        is_special_day: data.is_special_day,
      });
      await loadCalendarWorks();
    } catch (error) {
      console.error('Failed to save calendar work:', error);
    }
  }, [selectedDate, constructCreativeWorks, loadCalendarWorks]);

  // Memoize month data to avoid recalculating on every render
  const monthData = useMemo(() => {
    const monthStart = months[currentMonthIndex];
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    return { monthStart, startDate, endDate };
  }, [months, currentMonthIndex]);

  // Memoize day click handler
  const handleDayClick = useCallback((day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  }, []);

  // Memoize details view handler
  const handleViewDetails = useCallback((data: CalendarWorkData) => {
    setDetailsModal({ isOpen: true, data });
  }, []);

  // Memoize file view handler
  const handleViewFile = useCallback((file: File) => {
    setContentModal({ isOpen: true, file });
  }, []);

  const renderMonth = useCallback(() => {
    const { monthStart, startDate, endDate } = monthData;
    const dateFormat = 'd';
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const dayData = dateData[currentDay.toDateString()];
        const hasWork = !!dayData;
        const isToday = isSameDay(currentDay, new Date());
        const isCurrentMonth = isSameMonth(currentDay, monthStart);
        const isSpecialDay = dayData?.is_special_day;

        days.push(
          <div
            key={currentDay.toString()}
            className={`p-3 text-left text-[14px] font-medium border border-slate-200 cursor-pointer hover:bg-slate-100 flex flex-col items-start relative ${
              !isCurrentMonth
                ? 'text-slate-300'
                : isSpecialDay
                ? 'bg-purple-100 text-purple-800 font-semibold'
                : hasWork
                ? 'bg-green-100 text-green-800 font-semibold'
                : isToday
                ? 'bg-blue-500 text-white rounded'
                : 'text-slate-700'
            }`}
            onClick={() => handleDayClick(currentDay)}
          >
            <div className="flex items-center gap-1">
              {format(currentDay, dateFormat)}
              {isSpecialDay && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-purple-500 text-white">
                  ★
                </span>
              )}
            </div>
            
            {dayData?.creative_works && dayData.creative_works.length > 0 && (
              <div className="text-left text-[12px] mt-1 space-y-0.5">
                {dayData.creative_works.slice(0, 3).map((creative, idx) => (
                  <div key={idx} className="truncate max-w-full">
                    • {creative.name}:{creative.nos}
                  </div>
                ))}
                {dayData.creative_works.length > 3 && (
                  <div className="text-[10px]">+{dayData.creative_works.length - 3} more</div>
                )}
              </div>
            )}
            
            {hasWork && !isDMGroup && (
              <button
                className="mt-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] hover:bg-blue-100 hover:border-blue-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(dayData);
                }}
              >
                👁 View Details
              </button>
            )}
            
            {dayData?.content_file && !isDMGroup && (
              <div 
                className="text-left text-[10px] mt-1 text-blue-600 cursor-pointer hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewFile(dayData.content_file!);
                }}
              >
                📎 {dayData.content_file!.name}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={format(day, 'yyyy-MM-dd')} className="grid grid-cols-7 gap-2 flex-1">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 h-full flex flex-col">
        <div className="grid grid-cols-7 gap-2 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-[10px] font-bold text-slate-400 text-center uppercase">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          {rows}
        </div>
      </div>
    );
  }, [monthData, dateData, handleDayClick, handleViewDetails, handleViewFile, isDMGroup]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          {selectedClient && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">Client: {clients.find(c => c.id === selectedClient)?.name || 'Unknown'}</span>
              {clientProposal ? (
                <>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Creatives: {Number(clientProposal.creatives_nos) || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    Videos: {Number(clientProposal.videos_nos) || 0}
                  </span>
                </>
              ) : (
                <span className="text-red-500">No proposal data</span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedClient || ''}
            onChange={handleClientChange}
            disabled={isClientLoading || isClientsLoading}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isClientsLoading ? (
              <option>Loading clients...</option>
            ) : (
              <>
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
          <select
            value={currentMonthIndex}
            onChange={handleMonthSelect}
            className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {format(month, 'MMMM yyyy')}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="relative">
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
        <div className="h-screen">
          {renderMonth()}
        </div>
      </div>

      <DatePopupModal
        key={selectedDate?.toISOString()}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedDate={selectedDate}
        selectedClient={selectedClient}
        onSave={handleSave}
        existingData={selectedDate ? (() => {
          const data = dateData[selectedDate.toDateString()];
          return data ? {
            client_id: data.client_id,
            description: JSON.stringify(data.items),
            content_description: data.work_description || '',
            notes: data.notes || '',
            content_file: data.content_file || null,
            is_special_day: data.is_special_day
          } : undefined;
        })() : undefined}
        clients={clients}
        calendarWorkCreatives={calendarWorkCreatives}
      />

      {contentModal.isOpen && contentModal.file && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">File Content</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {contentModal.file.name}</p>
              <p><strong>Size:</strong> {(contentModal.file.size / 1024).toFixed(2)} KB</p>
              <p><strong>Type:</strong> {contentModal.file.type || 'Unknown'}</p>
              {contentModal.file.type.startsWith('image/') && (
                <img 
                  src={URL.createObjectURL(contentModal.file)} 
                  alt="File preview" 
                  className="max-w-full max-h-64 object-contain border rounded"
                />
              )}
            </div>
            <button
              onClick={() => setContentModal({ isOpen: false, file: null })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {detailsModal.isOpen && detailsModal.data && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Work Details</h3>
            <div className="space-y-4">
              {detailsModal.data.work_description && (
                <div>
                  <strong>Work Description:</strong>
                  <p className="mt-1 text-sm text-slate-700">{detailsModal.data.work_description}</p>
                </div>
              )}
              {detailsModal.data.notes && (
                <div>
                  <strong>Notes:</strong>
                  <p className="mt-1 text-sm text-slate-700">{detailsModal.data.notes}</p>
                </div>
              )}
              {detailsModal.data.creative_works && detailsModal.data.creative_works.length > 0 && (
                <div>
                  <strong>Creative Works:</strong>
                  <ul className="mt-1 list-disc list-inside text-sm text-slate-700">
                    {detailsModal.data.creative_works.map((creative, idx) => (
                      <li key={idx}>{creative.name}: {creative.nos}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => setDetailsModal({ isOpen: false, data: null })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;