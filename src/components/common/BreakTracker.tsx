import { useState } from 'react';
import { Play, Square } from 'lucide-react';

interface BreakTrackerProps {
  onBreakIn?: () => void;
  onBreakOut?: () => void;
}

export const BreakTracker = ({ onBreakIn, onBreakOut }: BreakTrackerProps) => {
  const [breakInTime, setBreakInTime] = useState<string | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);

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

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOnBreak ? (
        <button
          onClick={handleBreakIn}
          className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
          title="Break In"
        >
          <Play size={20} fill="currentColor" />
        </button>
      ) : (
        <div className="flex items-center gap-2 animate-pulse">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full px-4 py-2 shadow-lg text-white font-semibold text-sm">
            {breakInTime}
          </div>
          <button
            onClick={handleBreakOut}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 hover:from-rose-500 hover:to-rose-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            title="Break Out"
          >
            <Square size={20} fill="currentColor" />
          </button>
        </div>
      )}
    </div>
  );
};
