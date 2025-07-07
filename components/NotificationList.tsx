"use client";
import React from "react";

// Composant AnimatedList inspiré de https://21st.dev/dillionverma/animated-list/default
const AnimatedList: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col gap-3">
      {React.Children.map(children, (child, i) => (
        <div
          style={{
            animation: `fadeInUp 0.4s cubic-bezier(.25,.8,.25,1) both`,
            animationDelay: `${i * 0.07}s`,
          }}
        >
          {child}
        </div>
      ))}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read?: boolean;
};

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick?: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, onNotificationClick }) => {
  return (
    <div className="min-w-[300px] max-w-[400px]">
      <AnimatedList>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`transition-all duration-200 shadow-md rounded-xl px-5 py-4 border flex flex-col ${
              notif.read
                ? "bg-white border-gray-200"
                : "bg-blue-50 border-blue-400"
            } ${onNotificationClick ? "cursor-pointer hover:shadow-lg" : ""}`}
            onClick={() => onNotificationClick && onNotificationClick(notif.id)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-base font-semibold ${notif.read ? "text-gray-800" : "text-blue-700"}`}>{notif.title}</span>
              <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{notif.date}</span>
            </div>
            <div className="text-sm text-gray-600">{notif.message}</div>
          </div>
        ))}
      </AnimatedList>
    </div>
  );
};

export default NotificationList; 