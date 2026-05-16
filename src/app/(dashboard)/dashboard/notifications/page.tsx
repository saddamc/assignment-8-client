"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/proxy?path=/notifications", { credentials: "include" });
      const data = await res.json();
      if (data.success) setNotifications(data.data?.notifications || []);
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/proxy?path=/notifications/read-all", { method: "PATCH", credentials: "include" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* empty */ }
  };

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/proxy?path=/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* empty */ }
  };

  useEffect(() => {
    const load = async () => { await fetchNotifications(); };
    load();
  }, []);

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">My Account</p>
          <h1 className="text-3xl font-serif font-bold">Notifications</h1>
          {unread > 0 && <p className="text-sm text-indigo-600 font-semibold mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 border border-zinc-200 rounded-xl hover:bg-zinc-50"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-zinc-100 rounded-2xl animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <Bell className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No notifications</h3>
          <p className="text-zinc-400 text-sm">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markRead(notif.id)}
              className={`bg-white rounded-2xl border shadow-sm p-5 cursor-pointer transition-colors ${notif.isRead ? "border-zinc-100" : "border-indigo-200 bg-indigo-50/30"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`font-semibold text-sm ${!notif.isRead ? "text-indigo-900" : ""}`}>{notif.title}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-zinc-400 mt-2">{new Date(notif.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                </div>
                {!notif.isRead && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
