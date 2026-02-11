import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Bell, Clock, User, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dummy notification data
const dummyNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Lead Converted',
    message: 'John Doe has been successfully converted to a client.',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'New Lead Assigned',
    message: 'Sarah Johnson has been assigned to you.',
    time: '15 minutes ago',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Proposal Due Soon',
    message: 'Proposal for TechCorp Inc. is due in 2 days.',
    time: '1 hour ago',
    read: true,
  },
  {
    id: '4',
    type: 'error',
    title: 'Payment Failed',
    message: 'Monthly subscription payment could not be processed.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'New Team Member',
    message: 'Mike Chen has joined the Digital Marketing team.',
    time: '1 day ago',
    read: true,
  },
];

const NotificationModal = ({ isOpen, onOpenChange }: NotificationModalProps) => {
  const unreadCount = dummyNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Info size={16} className="text-blue-600" />;
    }
  };

  const getNotificationStyle = (type: Notification['type'], read: boolean) => {
    const baseClasses = "p-4 border-l-4 transition-all hover:bg-slate-50/50 cursor-pointer";
    const readClasses = read ? "bg-slate-25 border-slate-200" : "bg-white border-slate-300";

    switch (type) {
      case 'success':
        return `${baseClasses} ${readClasses} border-green-500`;
      case 'warning':
        return `${baseClasses} ${readClasses} border-yellow-500`;
      case 'error':
        return `${baseClasses} ${readClasses} border-red-500`;
      default:
        return `${baseClasses} ${readClasses} border-blue-500`;
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[110] font-sans max-h-[80vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <Dialog.Title className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell size={20} className="text-blue-600" />
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {dummyNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
                <p className="text-slate-400 text-xs mt-1">We'll notify you when there's something new</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {dummyNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={getNotificationStyle(notification.type, notification.read)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-semibold ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed mb-2 ${notification.read ? 'text-slate-500' : 'text-slate-700'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock size={10} />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {dummyNotifications.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <button className="text-xs text-slate-500 hover:text-slate-700 font-medium">
                  Mark all as read
                </button>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NotificationModal;