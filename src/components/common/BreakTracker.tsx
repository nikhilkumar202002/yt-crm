import { useState, useEffect } from 'react';
import { Play, Square, Clock, Coffee, LogOut } from 'lucide-react';

interface BreakTrackerProps {
  onBreakIn?: () => void;
  onBreakOut?: () => void;
  onPunchIn?: () => void;
  onPunchOut?: () => void;
}

export const BreakTracker = ({ onBreakIn, onBreakOut, onPunchIn, onPunchOut }: BreakTrackerProps) => {
  const [breakInTime, setBreakInTime] = useState<string | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [workInTime, setWorkInTime] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handlePunchIn = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWorkInTime(now);
    setIsWorking(true);
    onPunchIn?.();
  };

  const handlePunchOut = () => {
    setIsWorking(false);
    setIsOnBreak(false);
    setWorkInTime(null);
    setBreakInTime(null);
    onPunchOut?.();
  };

  const handleBreakIn = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBreakInTime(now);
    setIsOnBreak(true);
    onBreakIn?.();
  };

  const handleBreakOut = () => {
    setIsOnBreak(false);
    setBreakInTime(null);
    onBreakOut?.();
  };

  const getStatusText = () => {
    if (!isWorking) return "Not Working";
    if (isOnBreak) return "On Break";
    return "Working";
  };

  const getStatusColor = () => {
    if (!isWorking) return "bg-gray-100 text-gray-600";
    if (isOnBreak) return "bg-orange-100 text-orange-600";
    return "bg-green-100 text-green-600";
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[240px]">
        {/* Header with Status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-500" />
            <span className="text-xs font-normal text-gray-700">Time Tracker</span>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>

        {/* Current Time Display */}
        <div className="text-center mb-3">
          <div className="text-base font-medium text-gray-800">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs text-gray-500">
            {currentTime.toLocaleDateString()}
          </div>
        </div>

        {/* Work Time Display */}
        {isWorking && workInTime && (
          <div className="bg-blue-50 rounded p-1.5 mb-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-700 font-normal">Started:</span>
              <span className="text-blue-800 font-medium">{workInTime}</span>
            </div>
          </div>
        )}

        {/* Break Time Display */}
        {isOnBreak && breakInTime && (
          <div className="bg-orange-50 rounded p-1.5 mb-2 animate-pulse">
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-700 font-normal">Break:</span>
              <span className="text-orange-800 font-medium">{breakInTime}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-1.5">
          {!isWorking ? (
            <button
              onClick={handlePunchIn}
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded transition-colors font-normal text-sm"
            >
              <Clock size={14} />
              Start Work
            </button>
          ) : (
            <>
              {!isOnBreak ? (
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={handleBreakIn}
                    className="flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-2 rounded transition-colors font-normal text-xs"
                  >
                    <Coffee size={12} />
                    Break
                  </button>
                  <button
                    onClick={handlePunchOut}
                    className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white py-1.5 px-2 rounded transition-colors font-normal text-xs"
                  >
                    <LogOut size={12} />
                    End
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleBreakOut}
                  className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded transition-colors font-normal text-sm"
                >
                  <Play size={14} />
                  Resume
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
