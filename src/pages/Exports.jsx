import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Database,
  Users,
  MapPin,
  Target,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://ex-igp-adamu-backend-production.up.railway.app";

export default function Exports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const excelUrl =
    `${API_BASE_URL}/api/volunteers/export/excel`;

  const pdfUrl =
    `${API_BASE_URL}/api/volunteers/export/pdf`;

  /*
   * ---------------------------------------------------------
   * Load real statistics from backend
   * ---------------------------------------------------------
   */
  const loadStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/volunteers/stats/summary`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load statistics (${response.status})`
        );
      }

      const data = await response.json();

      setStats(data);
    } catch (err) {
      console.error("Export statistics error:", err);

      setError(
        err?.message ||
          "Unable to load export statistics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Initial load
   * ---------------------------------------------------------
   */
  useEffect(() => {
    loadStats();
  }, []);

  /*
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */
  const number = (value) =>
    Number(value || 0).toLocaleString();

  const totalVolunteers =
    stats?.total_volunteers ??
    stats?.total ??
    0;

  const totalPollingUnits =
    stats?.total_polling_units ??
    0;

  const totalTarget =
    stats?.total_target ??
    stats?.total_registration_target ??
    stats?.total_capacity ??
    0;

  const totalRegistered =
    stats?.total_registered ??
    totalVolunteers;

  const totalRemaining =
    stats?.total_remaining ??
    stats?.remaining_capacity ??
    Math.max(0, totalTarget - totalRegistered);

  const openPollingUnits =
    stats?.open_polling_units ??
    0;

  const fullPollingUnits =
    stats?.full_polling_units ??
    0;

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="p-4 md:p-6 lg:p-8">
          {/* =====================================================
              HEADER
          ====================================================== */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Export Center
                </h1>

                <p className="text-slate-500 mt-2">
                  Download volunteer records and official
                  registration reports.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadStats(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-semibold shadow-sm transition disabled:opacity-60"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* =====================================================
              ERROR
          ====================================================== */}
          {error && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              <AlertCircle
                size={22}
                className="shrink-0 mt-0.5"
              />

              <div>
                <p className="font-semibold">
                  Unable to load statistics
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => loadStats()}
                  className="mt-3 text-sm font-semibold underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* =====================================================
              STATISTICS
          ====================================================== */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Volunteers */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                  <Users
                    size={30}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Registered Volunteers
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 mt-1">
                    {loading
                      ? "..."
                      : number(totalVolunteers)}
                  </h2>
                </div>
              </div>
            </div>

            {/* Polling Units */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <MapPin
                    size={30}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Polling Units
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 mt-1">
                    {loading
                      ? "..."
                      : number(totalPollingUnits)}
                  </h2>
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                  <Target
                    size={30}
                    className="text-orange-600"
                  />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Registration Capacity
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 mt-1">
                    {loading
                      ? "..."
                      : number(totalTarget)}
                  </h2>
                </div>
              </div>
            </div>

            {/* Database */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <Database
                    size={30}
                    className="text-purple-600"
                  />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Database
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    Export Ready
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              CAPACITY SUMMARY
          ====================================================== */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Registration Capacity
                </h2>

                <p className="text-slate-500 mt-1">
                  Current registration and polling-unit
                  capacity from the database.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle
                  size={20}
                  className="text-green-600"
                />

                <span className="text-sm font-semibold text-green-700">
                  Live Database Data
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-600">
                  Registered
                </span>

                <span className="font-bold text-slate-800">
                  {number(totalRegistered)} /{" "}
                  {number(totalTarget)}
                </span>
              </div>

              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full transition-all duration-500"
                  style={{
                    width:
                      totalTarget > 0
                        ? `${Math.min(
                            100,
                            (totalRegistered /
                              totalTarget) *
                              100
                          )}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            {/* Capacity cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Registered
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {number(totalRegistered)}
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-sm text-green-700">
                  Remaining Capacity
                </p>

                <p className="text-2xl font-bold text-green-800 mt-1">
                  {number(totalRemaining)}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-sm text-blue-700">
                  Total Capacity
                </p>

                <p className="text-2xl font-bold text-blue-800 mt-1">
                  {number(totalTarget)}
                </p>
              </div>
            </div>

            {/* Polling unit status */}
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">
                      Open Polling Units
                    </p>

                    <p className="text-2xl font-bold text-green-800 mt-1">
                      {number(openPollingUnits)}
                    </p>
                  </div>

                  <CheckCircle
                    size={30}
                    className="text-green-600"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700">
                      Full Polling Units
                    </p>

                    <p className="text-2xl font-bold text-red-800 mt-1">
                      {number(fullPollingUnits)}
                    </p>
                  </div>

                  <AlertCircle
                    size={30}
                    className="text-red-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              EXPORT CARDS
          ====================================================== */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* =================================================
                EXCEL
            ================================================== */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
                  <FileSpreadsheet
                    size={38}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Excel Export
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Download volunteer records in Microsoft
                    Excel format.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Included information
                </p>

                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>✓ Registration Number</li>
                  <li>✓ Volunteer Name</li>
                  <li>✓ Phone Number</li>
                  <li>✓ Gender</li>
                  <li>✓ LGA</li>
                  <li>✓ Ward / Registration Area</li>
                  <li>✓ Polling Unit</li>
                  <li>✓ Polling Unit Code</li>
                  <li>✓ Qualification</li>
                  <li>✓ Employment Status</li>
                </ul>
              </div>

              <a
                href={excelUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-sm"
              >
                <Download size={18} />
                Export Excel
              </a>
            </div>

            {/* =================================================
                PDF
            ================================================== */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                  <FileText
                    size={38}
                    className="text-red-600"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    PDF Report
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Download a printable volunteer registration
                    report.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Report contents
                </p>

                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>✓ Official Volunteer Report</li>
                  <li>✓ Registration Summary</li>
                  <li>✓ Volunteer List</li>
                  <li>✓ LGA Information</li>
                  <li>✓ Ward Information</li>
                  <li>✓ Polling Unit Information</li>
                  <li>✓ Registration Numbers</li>
                  <li>✓ Print Ready</li>
                </ul>
              </div>

              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-sm"
              >
                <Download size={18} />
                Export PDF
              </a>
            </div>
          </div>

          {/* =====================================================
              EXPORT INFORMATION
          ====================================================== */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mt-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Database
                  size={24}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Export Information
                </h2>

                <p className="text-slate-500 mt-2 leading-6">
                  Export files are generated directly from the
                  registration database. The exported records
                  include the official polling-unit information
                  associated with each volunteer registration.
                </p>

                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="border border-slate-200 rounded-xl p-4">
                    <p className="text-xs text-slate-500">
                      Volunteers
                    </p>

                    <p className="font-bold text-slate-800 mt-1">
                      {number(totalVolunteers)}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <p className="text-xs text-slate-500">
                      Polling Units
                    </p>

                    <p className="font-bold text-slate-800 mt-1">
                      {number(totalPollingUnits)}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <p className="text-xs text-slate-500">
                      Registered
                    </p>

                    <p className="font-bold text-slate-800 mt-1">
                      {number(totalRegistered)}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <p className="text-xs text-slate-500">
                      Remaining
                    </p>

                    <p className="font-bold text-green-700 mt-1">
                      {number(totalRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}