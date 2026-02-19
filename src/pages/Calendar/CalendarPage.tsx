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
import { ChevronLeft, ChevronRight, FileText, Video, Calendar as CalendarIcon, Filter, Layers, Layout, Star, Search, Plus, TrendingUp } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
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
  nos?: string;
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
  const [clientCommand, setClientCommand] = useState<string>('');

  // Get user group for conditional rendering
  const { group } = useAppSelector((state) => state.auth);
  const isDMGroup = group?.toUpperCase() === 'DIGITAL MARKETING' || group?.toUpperCase() === 'DM';

  // Filtered data based on selected client - memoized for performance
  const dateData = useMemo(() => {
    if (!selectedClient) return allDateData;
    return Object.fromEntries(
      Object.entries(allDateData).filter(([, work]) => work.client_id === selectedClient)
    );
  }, [allDateData, selectedClient]);

  // Calculate monthly stats for progress tracking
  const monthStats = useMemo(() => {
    const monthStart = months[currentMonthIndex];
    let creatives = 0;
    let videos = 0;

    Object.entries(dateData).forEach(([dateStr, data]) => {
      const date = new Date(dateStr);
      if (isSameMonth(date, monthStart)) {
        data.creative_works?.forEach(work => {
          const count = parseInt(work.nos) || 0;
          const name = (work.name || '').toLowerCase();
          // Heuristic to distinguish videos/reels from static creatives
          if (name.includes('video') || name.includes('reel') || name.includes('short') || name.includes('motion')) {
            videos += count;
          } else {
            creatives += count;
          }
        });
      }
    });

    return { creatives, videos };
  }, [dateData, currentMonthIndex, months]);

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
          creative_works: (work.creatives || []).map(c => ({ id: c.id.toString(), name: c.name, nos: c.nos || '1' })) as CreativeWork[],
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
    const days = [];
    let day = startDate;

    const gridHeaderStyle = "py-2.5 text-center border-r border-slate-100 last:border-r-0 bg-slate-50/10 backdrop-blur-sm";
    const gridHeaderTextStyle = "text-[10px] font-black text-slate-400 uppercase tracking-[1.5px]";

    while (day <= endDate) {
      const currentDay = day;
      const dayData = dateData[currentDay.toDateString()];
      const hasWork = !!dayData;
      const isTodayDate = isSameDay(currentDay, new Date());
      const isCurrentMonth = isSameMonth(currentDay, monthStart);
      const isSpecialDay = dayData?.is_special_day;

      days.push(
        <div
          key={currentDay.toString()}
          className={cn(
            "group relative p-2 transition-all hover:bg-blue-50/30 cursor-pointer overflow-hidden flex flex-col min-h-[135px] border-b border-r border-slate-50",
            !isCurrentMonth && "bg-slate-50/40 opacity-40",
            isTodayDate && "bg-blue-50/60 z-[1]",
            isSpecialDay && "bg-purple-50/40"
          )}
          onClick={() => handleDayClick(currentDay)}
        >
          {isTodayDate && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]"></div>}
          {isSpecialDay && <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-500 opacity-60"></div>}

          {/* Day Header */}
          <div className="flex justify-between items-start mb-2">
            <span className={cn(
              "text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-300 transform group-hover:scale-1",
              isTodayDate 
                ? "bg-blue-600 text-white shadow-md shadow-blue-100 ring-1 ring-white" 
                : isSpecialDay
                ? "bg-purple-600 text-white shadow-sm shadow-purple-50 ring-1 ring-white"
                : isCurrentMonth
                ? "text-slate-500 group-hover:text-slate-900 group-hover:bg-white bg-slate-50/50"
                : "text-slate-300"
            )}>
              {format(currentDay, 'd')}
            </span>
            
            {hasWork && (
              <div className="flex gap-1 items-center mt-0.5">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shadow-sm animate-pulse",
                  isSpecialDay ? "bg-purple-400" : "bg-emerald-400"
                )}></div>
              </div>
            )}
          </div>

          {/* Day Body */}
          <div className="flex-1">
            {dayData ? (
              <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-xl p-2 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-500 group-hover:-translate-y-0.5">
                <div className="flex items-center gap-1.5 mb-1.5 border-b border-slate-50 pb-1.5 overflow-hidden">
                  <div className={cn(
                    "p-1 rounded-md shrink-0",
                    isSpecialDay ? "bg-purple-50" : "bg-blue-50"
                  )}>
                    {isSpecialDay ? <Star className="w-3 h-3 text-purple-600" /> : <Layers className="w-3 h-3 text-blue-600" />}
                  </div>
                  <span className="font-bold text-[10px] text-slate-700 truncate leading-tight tracking-tight">
                    {dayData.work_description || 'Active Flow'}
                  </span>
                </div>
                
                {dayData.creative_works && dayData.creative_works.length > 0 && (
                  <div className="space-y-1.5">
                    {dayData.creative_works.slice(0, 2).map((creative, idx) => (
                      <div key={idx} className="flex items-center justify-between group/item">
                         <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold truncate max-w-[75%]">
                            <div className="w-1 h-1 rounded-full bg-slate-200 group-hover/item:bg-blue-400 transition-colors" />
                            {creative.name}
                         </div>
                         <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-50">
                           {creative.nos}
                         </span>
                      </div>
                    ))}
                  </div>
                )}

                {!isDMGroup && (
                  <div className="mt-2 pt-1.5 border-t border-slate-50 flex items-center justify-between">
                    <button
                      className="text-[8px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-0.5 group/btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(dayData);
                      }}
                    >
                       Details <ChevronRight size={8} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                    
                    {dayData.content_file && (
                      <div 
                        className="flex items-center p-0.5 bg-slate-50 rounded text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewFile(dayData.content_file!);
                        }}
                      >
                        <FileText size={8} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : isCurrentMonth ? (
              <div className="h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-1 group-hover:translate-y-0 min-h-[70px]">
                 <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:shadow-md group-hover:shadow-blue-50 transition-all">
                    <Plus size={16} strokeWidth={2.5} />
                 </div>
                 <p className="text-[8px] font-black text-slate-400 group-hover:text-blue-500 uppercase tracking-[1.5px] mt-2 animate-in fade-in slide-in-from-bottom-1 duration-700">Schedule</p>
              </div>
            ) : null}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }

    return (
      <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
            <div key={weekday} className={gridHeaderStyle}>
              <span className={gridHeaderTextStyle}>{weekday}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  }, [monthData, dateData, handleDayClick, handleViewDetails, handleViewFile, isDMGroup]);

  return (
    <div className="space-y-4 animate-in fade-in duration-700 font-sans pb-8 max-w-[1600px] mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Interactive Calendar</h1>
            </div>
            <p className="text-slate-500 text-[13px] ml-10 font-medium">Manage and track creative schedules efficiently</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Filter className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <select
                value={selectedClient || ''}
                onChange={handleClientChange}
                disabled={isClientLoading || isClientsLoading}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-[13px] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer min-w-[200px] appearance-none font-medium"
              >
                {isClientsLoading ? (
                  <option>Loading clients...</option>
                ) : (
                  <>
                    <option value="">Select Project / Client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {selectedClient && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3 hover:border-blue-100 transition-colors">
              <div className="p-2 bg-white shadow-sm rounded-lg border border-slate-100">
                <Layout className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Selected Account</p>
                <p className="text-[13px] font-bold text-slate-900 truncate max-w-[140px]">
                  {clients.find(c => c.id === selectedClient)?.name || 'Unknown'}
                </p>
              </div>
            </div>

            {clientProposal ? (
              <>
                <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100 flex items-center gap-3 hover:bg-indigo-50 transition-colors">
                  <div className="p-2 bg-white shadow-sm rounded-lg border border-indigo-100">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider leading-none mb-1">Creative Target</p>
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-indigo-900">{Number(clientProposal.creatives_nos) || 0}</span>
                        <span className="text-[9px] font-bold text-indigo-500 italic uppercase">Target</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-white border border-indigo-100 px-1.5 py-0.5 rounded-lg shadow-sm">
                        {monthStats.creatives} Done
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100 flex items-center gap-3 hover:bg-emerald-50 transition-colors">
                  <div className="p-2 bg-white shadow-sm rounded-lg border border-emerald-100">
                    <Video className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider leading-none mb-1">Video Target</p>
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-emerald-900">{Number(clientProposal.videos_nos) || 0}</span>
                        <span className="text-[9px] font-bold text-emerald-500 italic uppercase">Target</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-white border border-emerald-100 px-1.5 py-0.5 rounded-lg shadow-sm">
                        {monthStats.videos} Done
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex items-center gap-3 hover:bg-blue-100 transition-colors">
                  <div className="p-2 bg-white shadow-sm rounded-lg border border-blue-100">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] uppercase font-bold text-blue-400 tracking-wider leading-none mb-1">Month Progress</p>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden border border-blue-100">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${Math.min(100, (((monthStats.creatives + monthStats.videos) / (Number(clientProposal.creatives_nos) + Number(clientProposal.videos_nos) || 1)) * 100))}%` 
                            }}
                          ></div>
                       </div>
                       <span className="text-[11px] font-black text-blue-900">
                         {Math.round(((monthStats.creatives + monthStats.videos) / (Number(clientProposal.creatives_nos) + Number(clientProposal.videos_nos) || 1)) * 100)}%
                       </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3 hover:border-slate-200 transition-colors group/cmd">
                  <div className="p-2 bg-white shadow-sm rounded-lg border border-slate-100 group-focus-within/cmd:border-blue-400 group-focus-within/cmd:ring-2 group-focus-within/cmd:ring-blue-100 transition-all">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within/cmd:text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Client Brief/Command</p>
                    <input
                      type="text"
                      value={clientCommand}
                      onChange={(e) => setClientCommand(e.target.value)}
                      placeholder="Enter instruction..."
                      className="w-full bg-transparent border-none p-0 text-[12px] font-bold text-slate-800 placeholder:text-slate-300 focus:ring-0"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-1 sm:col-span-2 xl:col-span-4 bg-red-50/50 rounded-xl p-3 border border-red-100 flex items-center justify-center italic text-red-500 text-[12px] font-medium">
                No active proposal found for this client
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Navigation Bar */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 group">
             <button
              onClick={handlePreviousMonth}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all active:scale-95"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            
            <div className="relative group/sel">
              <select
                value={currentMonthIndex}
                onChange={handleMonthSelect}
                className="appearance-none bg-transparent font-bold text-slate-800 text-base px-2 py-0.5 cursor-pointer focus:outline-none hover:text-blue-600 transition-colors"
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
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all active:scale-95"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-2">
             <div className="flex items-center gap-3 mr-3 text-[9px] font-bold uppercase tracking-wider text-slate-400 border-r pr-4 border-slate-200 md:flex hidden">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Today</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Work</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Special</div>
             </div>
             
             <button
               onClick={() => setCurrentMonthIndex(new Date().getMonth())}
               className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
             >
               Current Month
             </button>
          </div>
        </div>

        <div className="p-4 relative">
          {(isClientLoading || isClientsLoading) && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-[2.5px] border-slate-100 border-t-blue-600 shadow-xl"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                  Refining Workspace...
                </span>
              </div>
            </div>
          )}
          <div className="min-h-[600px]">
            {renderMonth()}
          </div>
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