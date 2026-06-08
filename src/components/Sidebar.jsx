import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  UserCog,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Volunteers",
      path: "/volunteers",
      icon: Users,
    },
    {
      name: "Export Center",
      path: "/exports",
      icon: FileSpreadsheet,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserCog,
    },
  ];

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="
          md:hidden
          fixed
          top-4
          left-4
          z-50
          bg-green-600
          text-white
          p-3
          rounded-lg
          shadow-lg
        "
      >
        <Menu size={22} />
      </button>

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static
          top-0 left-0
          z-40
          w-72
          min-h-screen
          bg-gradient-to-b
          from-slate-950
          via-slate-900
          to-slate-950
          text-white
          flex
          flex-col
          shadow-2xl
          transition-transform
          duration-300
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
          md:translate-x-0
        `}
      >
        {/* CLOSE BUTTON MOBILE */}
        <button
          onClick={() => setOpen(false)}
          className="
            md:hidden
            absolute
            top-4
            right-4
            text-white
          "
        >
          <X size={24} />
        </button>

        {/* HEADER */}
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="EX-IGP"
              className="
                w-14
                h-14
                rounded-full
                object-cover
                border-2
                border-green-500
              "
            />

            <div>
              <h1 className="font-bold text-xl">
                EX-IGP
              </h1>

              <p className="text-xs text-slate-400">
                Volunteer Management
              </p>
            </div>
          </div>
        </div>

        {/* ADMIN CARD */}
        <div className="p-5">
          <div
            className="
              bg-slate-800
              rounded-2xl
              p-4
              border
              border-slate-700
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-green-600
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-lg
                "
              >
                A
              </div>

              <div>
                <h3 className="font-semibold">
                  Administrator
                </h3>

                <p className="text-xs text-slate-400">
                  System Admin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 px-4">
          <p
            className="
              text-xs
              uppercase
              text-slate-500
              mb-3
              px-3
            "
          >
            Main Navigation
          </p>

          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const active =
                location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`
                    flex
                    items-center
                    justify-between
                    px-4
                    py-3
                    rounded-xl
                    transition-all
                    duration-200
                    ${
                      active
                        ? `
                          bg-green-600
                          text-white
                          shadow-lg
                        `
                        : `
                          text-slate-300
                          hover:bg-slate-800
                        `
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </div>

                  {active && (
                    <ChevronRight size={16} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="
            border-t
            border-slate-800
            p-4
          "
        >
          <button
            onClick={handleLogout}
            className="
              flex
              items-center
              gap-3
              w-full
              px-4
              py-3
              rounded-xl
              text-red-400
              hover:bg-red-600
              hover:text-white
              transition
            "
          >
            <LogOut size={20} />
            Logout
          </button>

          <div
            className="
              mt-4
              text-center
              text-xs
              text-slate-500
            "
          >
            EX-IGP Admin Panel
            <br />
            Version 1.0.0
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            bg-black/50
            z-30
            md:hidden
          "
        />
      )}
    </>
  );
}