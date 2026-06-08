import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Settings,
  UserCircle,
  CalendarDays,
} from "lucide-react";
import api from "../services/Api";

export default function Navbar() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/admin/notifications");
      const data = res.data || [];
      setNotifications(data.slice(0, 5)); // latest 5
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/admin/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
      {/* LEFT */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          EX-IGP Volunteer System
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <CalendarDays size={15} className="text-slate-400" />
          <span className="text-sm text-slate-500">{today}</span>
        </div>
      </div>

      {/* CENTER SEARCH */}
      <div className="hidden lg:block">
        <div className="relative w-105">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search volunteers..."
            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Notification Bell – real data */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative bg-slate-100 hover:bg-slate-200 p-3 rounded-xl transition"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
              <div className="p-3 border-b">
                <p className="text-sm font-semibold text-gray-700">Recent Notifications</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer ${
                        !notif.read ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <p className="text-sm text-gray-800">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t">
                <button
                  onClick={() => {
                    setShowNotifDropdown(false);
                    navigate("/notifications"); // or your dedicated notifications page
                  }}
                  className="w-full text-center text-sm text-green-700 hover:underline"
                >
                  See all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings – links to Profile page */}
        <button
          onClick={() => navigate("/profile")}
          className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl transition"
        >
          <Settings size={20} />
        </button>

        {/* Admin Profile – also links to Profile page */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl hover:bg-slate-200 transition"
        >
          <div className="w-11 h-11 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
            A
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900">Administrator</h3>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
        </button>
      </div>
    </div>
  );
}