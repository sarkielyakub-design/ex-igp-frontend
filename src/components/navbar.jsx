import {
  Bell,
  Search,
  Settings,
  UserCircle,
  CalendarDays,
} from "lucide-react";
export default function Navbar() {
  const today = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  return (
    <div
      className="
      bg-white
      border-b
      border-slate-200
      px-8
      py-4
      flex
      items-center
      justify-between
      sticky
      top-0
      z-30
    "
    >
      {/* LEFT */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          EX-IGP Volunteer System
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <CalendarDays
            size={15}
            className="text-slate-400"
          />
          <span className="text-sm text-slate-500">
            {today}
          </span>
        </div>
      </div>
      {/* CENTER SEARCH */}
      <div className="hidden lg:block">
        <div className="relative w-[420px]">
          <Search
            size={18}
            className="
            absolute
            left-4
            top-3.5
            text-slate-400
          "
          />
          <input
            type="text"
            placeholder="Search volunteers..."
            className="
            w-full
            bg-slate-100
            border
            border-slate-200
            rounded-xl
            pl-11
            pr-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-green-500
            focus:border-green-500
          "
          />
        </div>
      </div>
      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="
          relative
          bg-slate-100
          hover:bg-slate-200
          p-3
          rounded-xl
          transition
        "
        >
          <Bell size={20} />
          <span
            className="
            absolute
            -top-1
            -right-1
            w-5
            h-5
            rounded-full
            bg-red-500
            text-white
            text-xs
            flex
            items-center
            justify-center
          "
          >
            3
          </span>
        </button>
        {/* Settings */}
        <button
          className="
          bg-slate-100
          hover:bg-slate-200
          p-3
          rounded-xl
          transition
        "
        >
          <Settings size={20} />
        </button>
        {/* Admin Profile */}
        <div
          className="
          flex
          items-center
          gap-3
          bg-slate-100
          px-4
          py-2
          rounded-2xl
        "
        >
          <div
            className="
            w-11
            h-11
            rounded-full
            bg-green-600
            text-white
            flex
            items-center
            justify-center
            font-bold
          "
          >
            A
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              Administrator
            </h3>
            <p className="text-xs text-slate-500">
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}