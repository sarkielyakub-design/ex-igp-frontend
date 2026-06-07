import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  Lock,
  Save,
} from "lucide-react";

import Sidebar from "../components/SideBar";
import Navbar from "../components/NavBar";
import api from "../services/api";

export default function Profile() {

  const [profile, setProfile] = useState({
    username: "",
    role: "",
  });

  const [password, setPassword] =
    useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get(
        "/auth/me"
      );

      setProfile(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  const updatePassword = async () => {
    try {

      await api.put(
        "/auth/change-password",
        {
          password,
        }
      );

      alert(
        "Password updated successfully"
      );

      setPassword("");

    } catch (err) {
      console.error(err);

      alert(
        "Failed to update password"
      );
    }
  };

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar />

        <div className="p-8">

          <h1 className="text-4xl font-bold mb-8">
            Admin Profile
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Profile Card */}

            <div className="bg-white rounded-3xl shadow p-8">

              <div className="text-center">

                <div
                  className="
                  w-32
                  h-32
                  rounded-full
                  bg-green-600
                  text-white
                  flex
                  items-center
                  justify-center
                  mx-auto
                  text-5xl
                  font-bold
                  "
                >
                  A
                </div>

                <h2 className="text-2xl font-bold mt-4">
                  Administrator
                </h2>

                <p className="text-slate-500">
                  EX-IGP System Admin
                </p>

              </div>

            </div>

            {/* Details */}

            <div className="lg:col-span-2 bg-white rounded-3xl shadow p-8">

              <h2 className="text-2xl font-bold mb-6">
                Account Information
              </h2>

              <div className="space-y-5">

                <div>

                  <label className="font-medium">
                    Username
                  </label>

                  <div className="relative mt-2">

                    <User
                      className="
                      absolute
                      left-3
                      top-3
                      text-slate-400
                      "
                    />

                    <input
                      value={profile.username}
                      disabled
                      className="
                      w-full
                      border
                      rounded-xl
                      py-3
                      pl-10
                      bg-slate-50
                      "
                    />

                  </div>

                </div>

                <div>

                  <label className="font-medium">
                    Email
                  </label>

                  <div className="relative mt-2">

                    <Mail
                      className="
                      absolute
                      left-3
                      top-3
                      text-slate-400
                      "
                    />

                    <input
                      value="exigpadamuyouthvolunteers@gmail.com"
                      disabled
                      className="
                      w-full
                      border
                      rounded-xl
                      py-3
                      pl-10
                      bg-slate-50
                      "
                    />

                  </div>

                </div>

                <div>

                  <label className="font-medium">
                    Role
                  </label>

                  <div className="relative mt-2">

                    <Shield
                      className="
                      absolute
                      left-3
                      top-3
                      text-slate-400
                      "
                    />

                    <input
                      value={profile.role}
                      disabled
                      className="
                      w-full
                      border
                      rounded-xl
                      py-3
                      pl-10
                      bg-slate-50
                      "
                    />

                  </div>

                </div>

                <div>

                  <label className="font-medium">
                    New Password
                  </label>

                  <div className="relative mt-2">

                    <Lock
                      className="
                      absolute
                      left-3
                      top-3
                      text-slate-400
                      "
                    />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      className="
                      w-full
                      border
                      rounded-xl
                      py-3
                      pl-10
                      "
                    />

                  </div>

                </div>

                <button
                  onClick={updatePassword}
                  className="
                  bg-green-600
                  hover:bg-green-700
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  flex
                  items-center
                  gap-2
                  "
                >
                  <Save size={18} />
                  Update Password
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}