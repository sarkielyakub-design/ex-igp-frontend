// components/Navbar.jsx
import { useEffect, useState, useRef } from "react";
import { Bell, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";

export default function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const notifRef = useRef(null);
  const settingsRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettingsModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/admin/notifications");
      const data = res.data || [];
      setNotifications(data.slice(0, 5)); // show latest 5
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
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 rounded-lg hover:bg-gray-100 transition relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
              <div className="p-3 border-b">
                <p className="text-sm font-semibold text-gray-700">Notifications</p>
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
                    navigate("/admin/notifications");
                  }}
                  className="w-full text-center text-sm text-green-700 hover:underline"
                >
                  See all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Profile Avatar with link */}
        <button
          onClick={() => navigate("/admin/profile")}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:block">
            Admin
          </span>
        </button>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <h3 className="text-lg font-bold mb-4">System Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="accent-green-700" />
                Enable email notifications
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="accent-green-700" />
                Auto-approve new volunteers
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span>Items per page:</span>
                <select className="border rounded p-1 text-sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save settings logic here
                  setShowSettingsModal(false);
                }}
                className="px-4 py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}