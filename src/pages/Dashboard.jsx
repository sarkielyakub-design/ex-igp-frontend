import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserRound,
  Briefcase,
  UserX,
  ShieldCheck,
  Calendar,
  MapPin,
  ArrowUpRight,
  Loader2,
  Building2,
  LocateFixed,
  RefreshCw,
  Database,
  Target,
  CheckCircle2,
  AlertCircle,
  Layers3,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import api from "../services/Api";
import exIgpBg from "../assets/ex-igp-bg.jpg";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [recentVolunteers, setRecentVolunteers] = useState([]);
  const [registrationByLGA, setRegistrationByLGA] = useState([]);

  /*
   * ============================================================
   * POLLING UNIT STATISTICS
   * ============================================================
   */

  const [pollingStats, setPollingStats] = useState({
    total_lgas: 0,
    total_wards: 0,
    total_polling_units: 0,
    total_capacity: 0,
    total_registered: 0,
    remaining_capacity: 0,
    open_polling_units: 0,
    full_polling_units: 0,
  });

  const [pollingUnits, setPollingUnits] = useState([]);

  /*
   * ============================================================
   * LOAD DASHBOARD
   * ============================================================
   */

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      /*
       * Existing endpoints
       */
      const requests = [
        api.get("/api/admin/dashboard"),
        api.get("/api/admin/volunteers/recent"),
        api.get("/api/admin/analytics/lga"),
      ];

      /*
       * Polling-unit endpoints are attempted separately so
       * an unavailable optional endpoint does not destroy
       * the main dashboard.
       */

      const [
        statsRes,
        recentRes,
        lgaRes,
      ] = await Promise.all(requests);

      setStats(statsRes.data || {});

      setRecentVolunteers(
        Array.isArray(recentRes.data)
          ? recentRes.data
          : recentRes.data?.data || []
      );

      setRegistrationByLGA(
        Array.isArray(lgaRes.data)
          ? lgaRes.data
          : lgaRes.data?.data || []
      );

      /*
       * Try polling-unit statistics.
       *
       * This supports:
       *
       * GET /api/admin/polling-units/stats
       */

      try {
        const pollingStatsRes = await api.get(
          "/api/admin/polling-units/stats"
        );

        setPollingStats(
          pollingStatsRes.data || {}
        );
      } catch (error) {
        console.warn(
          "Polling unit stats endpoint unavailable:",
          error?.response?.data || error
        );

        /*
         * Fallback: try public polling-unit list.
         */
        try {
          const pollingRes = await api.get(
            "/api/polling-units"
          );

          const data = Array.isArray(
            pollingRes.data
          )
            ? pollingRes.data
            : pollingRes.data?.data || [];

          setPollingUnits(data);

          calculatePollingStats(data);
        } catch (pollingError) {
          console.warn(
            "Polling unit endpoint unavailable:",
            pollingError?.response?.data ||
              pollingError
          );
        }
      }

    } catch (error) {
      console.error(
        "Dashboard fetch error:",
        error?.response?.data || error
      );

      /*
       * No mock data is inserted.
       */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * ============================================================
   * FALLBACK POLLING UNIT CALCULATION
   * ============================================================
   */

  const calculatePollingStats = (data) => {
    if (!Array.isArray(data)) return;

    const lgaSet = new Set();

    /*
     * Ward codes can repeat between LGAs.
     *
     * Therefore the ward key MUST include LGA code.
     */

    const wardSet = new Set();

    let totalCapacity = 0;
    let totalRegistered = 0;
    let openUnits = 0;
    let fullUnits = 0;

    data.forEach((pu) => {
      if (pu.lga_code || pu.lga_name) {
        lgaSet.add(
          `${pu.lga_code || ""}-${pu.lga_name || ""}`
        );
      }

      if (
        pu.lga_code ||
        pu.lga_name ||
        pu.ward_code ||
        pu.ward_name
      ) {
        wardSet.add(
          `${pu.lga_code || pu.lga_name || ""}-${
            pu.ward_code || pu.ward_name || ""
          }`
        );
      }

      const target =
        Number(
          pu.registration_target
        ) || 0;

      const registered =
        Number(
          pu.registered_count
        ) || 0;

      totalCapacity += target;
      totalRegistered += registered;

      if (
        String(pu.status || "").toUpperCase() ===
        "FULL"
      ) {
        fullUnits++;
      } else {
        openUnits++;
      }
    });

    setPollingStats({
      total_lgas: lgaSet.size,
      total_wards: wardSet.size,
      total_polling_units: data.length,
      total_capacity: totalCapacity,
      total_registered: totalRegistered,
      remaining_capacity: Math.max(
        totalCapacity - totalRegistered,
        0
      ),
      open_polling_units: openUnits,
      full_polling_units: fullUnits,
    });
  };

  /*
   * ============================================================
   * NORMALIZED VALUES
   * ============================================================
   */

  const total =
    Number(stats.total_volunteers) || 0;

  const male =
    Number(stats.male) || 0;

  const female =
    Number(stats.female) || 0;

  const employed =
    Number(stats.employed) || 0;

  const unemployed =
    Number(stats.unemployed) || 0;

  const youthMembers =
    Number(
      stats.youth_members ??
        stats.youth_org_members
    ) || 0;

  /*
   * ============================================================
   * POLLING UNIT VALUES
   * ============================================================
   */

  const totalLGAs =
    Number(
      pollingStats.total_lgas
    ) || 0;

  const totalWards =
    Number(
      pollingStats.total_wards
    ) || 0;

  const totalPollingUnits =
    Number(
      pollingStats.total_polling_units
    ) || 0;

  const totalCapacity =
    Number(
      pollingStats.total_capacity
    ) || 0;

  const totalRegistered =
    Number(
      pollingStats.total_registered
    ) || total;

  const remainingCapacity =
    Number(
      pollingStats.remaining_capacity
    ) ||
    Math.max(
      totalCapacity -
        totalRegistered,
      0
    );

  const openPollingUnits =
    Number(
      pollingStats.open_polling_units
    ) || 0;

  const fullPollingUnits =
    Number(
      pollingStats.full_polling_units
    ) || 0;

  /*
   * ============================================================
   * CAPACITY PERCENTAGE
   * ============================================================
   */

  const capacityPercentage =
    totalCapacity > 0
      ? Math.min(
          Math.round(
            (totalRegistered /
              totalCapacity) *
              100
          ),
          100
        )
      : 0;

  /*
   * ============================================================
   * GENDER DATA
   * ============================================================
   */

  const genderData = [
    {
      name: "Male",
      value: male,
    },
    {
      name: "Female",
      value: female,
    },
  ];

  const COLORS = [
    "#16a34a",
    "#ec4899",
  ];

  /*
   * ============================================================
   * POLLING UNIT CHART DATA
   * ============================================================
   */

  const pollingUnitChartData = useMemo(() => {
    if (!Array.isArray(pollingUnits)) {
      return [];
    }

    return pollingUnits
      .slice(0, 15)
      .map((pu) => ({
        name:
          pu.pu_code ||
          `PU ${pu.id}`,

        registered:
          Number(
            pu.registered_count
          ) || 0,

        remaining:
          Math.max(
            (
              Number(
                pu.registration_target
              ) || 0
            ) -
              (
                Number(
                  pu.registered_count
                ) || 0
              ),
            0
          ),
      }));
  }, [pollingUnits]);

  /*
   * ============================================================
   * IMAGE URL
   * ============================================================
   */

  const getImageUrl = (path) => {
    if (!path) return "";

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `https://ex-igp-adamu-backend-production.up.railway.app/${String(
      path
    ).replace(/^\/+/, "")}`;
  };

  /*
   * ============================================================
   * POLLING UNIT HELPERS
   * ============================================================
   */

  const getLga = (v) =>
    v?.polling_unit?.lga_name ||
    v?.lga ||
    "—";

  const getWard = (v) =>
    v?.polling_unit?.ward_name ||
    v?.ward ||
    "—";

  const getPollingUnit = (v) =>
    v?.polling_unit?.pu_name ||
    v?.unit ||
    "—";

  const getPollingUnitCode = (v) =>
    v?.polling_unit?.pu_code ||
    v?.pu_code ||
    "";

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-screen">

        <Sidebar />

        <div className="flex-1 flex items-center justify-center bg-gray-50">

          <div className="text-center">

            <Loader2 className="animate-spin h-12 w-12 text-green-700 mx-auto" />

            <p className="mt-4 text-lg text-gray-600">
              Loading dashboard...
            </p>

          </div>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * MAIN DASHBOARD
   * ============================================================
   */

  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <div className="flex-1 flex flex-col relative">

        {/* Background */}

        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              `url(${exIgpBg})`,
          }}
        />

        <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-[2px]" />

        {/* Content */}

        <div className="relative z-10 flex flex-col min-h-screen">

          <Navbar />

          <div className="relative z-10 flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">

              <div>

                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  Government Dashboard
                </h1>

                <p className="text-white/70 mt-1">
                  Ex-IGP Adamu Youth Volunteer Management
                </p>

              </div>

              <div className="flex gap-3 mt-4 md:mt-0">

                <button
                  onClick={() =>
                    window.open(
                      "/admin/volunteers",
                      "_self"
                    )
                  }
                  className="bg-white/90 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-lg shadow-sm text-gray-800 hover:bg-white transition"
                >
                  View Volunteers
                </button>

                <button
                  onClick={() =>
                    fetchDashboardData(true)
                  }
                  disabled={refreshing}
                  className="bg-green-700 text-white px-4 py-2 rounded-lg shadow hover:bg-green-800 transition flex items-center gap-2 disabled:opacity-60"
                >

                  <RefreshCw
                    className={`w-4 h-4 ${
                      refreshing
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Refresh

                </button>

              </div>

            </div>

            {/* ==================================================
                VOLUNTEER STATS
            ================================================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              <StatsCard
                title="Total Volunteers"
                value={total}
                icon={Users}
                color="bg-blue-600"
              />

              <StatsCard
                title="Male"
                value={male}
                icon={UserCheck}
                color="bg-green-600"
              />

              <StatsCard
                title="Female"
                value={female}
                icon={UserRound}
                color="bg-pink-600"
              />

              <StatsCard
                title="Employed"
                value={employed}
                icon={Briefcase}
                color="bg-purple-600"
              />

              <StatsCard
                title="Unemployed"
                value={unemployed}
                icon={UserX}
                color="bg-red-600"
              />

              <StatsCard
                title="Youth Members"
                value={youthMembers}
                icon={ShieldCheck}
                color="bg-orange-600"
              />

            </div>

            {/* ==================================================
                NASARAWA HIERARCHY
            ================================================== */}

            <div>

              <div className="flex items-center gap-2 mb-4">

                <Database className="w-5 h-5 text-yellow-400" />

                <h2 className="text-xl font-bold text-white">
                  Nasarawa Registration Structure
                </h2>

              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* LGAs */}

                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/30">

                  <div className="flex items-center justify-between">

                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Building2 className="w-6 h-6 text-blue-700" />
                    </div>

                    <span className="text-xs font-semibold text-gray-400 uppercase">
                      LGAs
                    </span>

                  </div>

                  <div className="mt-4">

                    <div className="text-3xl font-black text-gray-800">
                      {totalLGAs}
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      Local Government Areas
                    </p>

                  </div>

                </div>

                {/* Wards */}

                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/30">

                  <div className="flex items-center justify-between">

                    <div className="bg-green-100 p-3 rounded-xl">
                      <MapPin className="w-6 h-6 text-green-700" />
                    </div>

                    <span className="text-xs font-semibold text-gray-400 uppercase">
                      Wards
                    </span>

                  </div>

                  <div className="mt-4">

                    <div className="text-3xl font-black text-gray-800">
                      {totalWards}
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      Registration Areas
                    </p>

                  </div>

                </div>

                {/* Polling Units */}

                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/30">

                  <div className="flex items-center justify-between">

                    <div className="bg-purple-100 p-3 rounded-xl">
                      <LocateFixed className="w-6 h-6 text-purple-700" />
                    </div>

                    <span className="text-xs font-semibold text-gray-400 uppercase">
                      Units
                    </span>

                  </div>

                  <div className="mt-4">

                    <div className="text-3xl font-black text-gray-800">
                      {totalPollingUnits}
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      Polling Units
                    </p>

                  </div>

                </div>

                {/* Capacity */}

                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/30">

                  <div className="flex items-center justify-between">

                    <div className="bg-orange-100 p-3 rounded-xl">
                      <Target className="w-6 h-6 text-orange-700" />
                    </div>

                    <span className="text-xs font-semibold text-gray-400 uppercase">
                      Capacity
                    </span>

                  </div>

                  <div className="mt-4">

                    <div className="text-3xl font-black text-gray-800">
                      {totalCapacity.toLocaleString()}
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      Registration Capacity
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ==================================================
                CAPACITY OVERVIEW
            ================================================== */}

            <div className="grid lg:grid-cols-3 gap-6">

              {/* Registration Capacity */}

              <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-gray-800">
                      Registration Capacity
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Polling unit target utilization
                    </p>

                  </div>

                  <div className="text-right">

                    <div className="text-3xl font-black text-green-700">
                      {capacityPercentage}%
                    </div>

                    <div className="text-xs text-gray-500">
                      Capacity Used
                    </div>

                  </div>

                </div>

                {/* Progress */}

                <div className="mt-6">

                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-green-600 rounded-full transition-all duration-700"
                      style={{
                        width: `${capacityPercentage}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">

                  <div>

                    <p className="text-xs uppercase text-gray-400">
                      Registered
                    </p>

                    <p className="text-xl font-bold text-gray-800">
                      {totalRegistered.toLocaleString()}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase text-gray-400">
                      Remaining
                    </p>

                    <p className="text-xl font-bold text-gray-800">
                      {remainingCapacity.toLocaleString()}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase text-gray-400">
                      Target
                    </p>

                    <p className="text-xl font-bold text-gray-800">
                      {totalCapacity.toLocaleString()}
                    </p>

                  </div>

                </div>

              </div>

              {/* Unit Status */}

              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30">

                <h2 className="text-lg font-bold text-gray-800">
                  Polling Unit Status
                </h2>

                <div className="mt-6 space-y-5">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-700" />
                      </div>

                      <div>

                        <p className="font-semibold text-gray-700">
                          Open
                        </p>

                        <p className="text-xs text-gray-400">
                          Accepting registrations
                        </p>

                      </div>

                    </div>

                    <span className="text-2xl font-black text-green-700">
                      {openPollingUnits}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="bg-red-100 p-2 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-700" />
                      </div>

                      <div>

                        <p className="font-semibold text-gray-700">
                          Full
                        </p>

                        <p className="text-xs text-gray-400">
                          Target reached
                        </p>

                      </div>

                    </div>

                    <span className="text-2xl font-black text-red-700">
                      {fullPollingUnits}
                    </span>

                  </div>

                  <div className="pt-4 border-t">

                    <div className="flex items-center gap-2 text-sm text-gray-500">

                      <Layers3 className="w-4 h-4" />

                      <span>
                        Total polling units
                      </span>

                    </div>

                    <p className="text-2xl font-black text-gray-800 mt-1">
                      {totalPollingUnits}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ==================================================
                CHARTS
            ================================================== */}

            <div className="grid lg:grid-cols-2 gap-8">

              {/* LGA BAR CHART */}

              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30">

                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">

                  <MapPin className="w-5 h-5 text-green-700" />

                  Registration by LGA

                </h2>

                {registrationByLGA.length === 0 ? (

                  <div className="flex items-center justify-center h-60 text-gray-500">
                    No registration data available
                  </div>

                ) : (

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <BarChart
                      data={registrationByLGA}
                      margin={{
                        top: 5,
                        right: 20,
                        left: 0,
                        bottom: 5,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="lga"
                        tick={{
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        fill="#16a34a"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                        barSize={40}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                )}

              </div>

              {/* GENDER PIE */}

              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30">

                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">

                  <Users className="w-5 h-5 text-green-700" />

                  Gender Distribution

                </h2>

                {total === 0 ? (

                  <div className="flex items-center justify-center h-60 text-gray-500">
                    No volunteers yet
                  </div>

                ) : (

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <PieChart>

                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({
                          name,
                          percent,
                        }) =>
                          `${name} ${(
                            percent * 100
                          ).toFixed(0)}%`
                        }
                      >

                        {genderData.map(
                          (
                            entry,
                            index
                          ) => (

                            <Cell
                              key={`cell-${index}`}
                              fill={
                                COLORS[
                                  index %
                                    COLORS.length
                                ]
                              }
                            />

                          )
                        )}

                      </Pie>

                      <Tooltip />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                )}

              </div>

            </div>

            {/* ==================================================
                POLLING UNIT CHART
            ================================================== */}

            {pollingUnitChartData.length > 0 && (

              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30">

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">

                      <LocateFixed className="w-5 h-5 text-green-700" />

                      Polling Unit Registration

                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Polling units returned by the API
                    </p>

                  </div>

                </div>

                <ResponsiveContainer
                  width="100%"
                  height={350}
                >

                  <BarChart
                    data={pollingUnitChartData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 50,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      height={70}
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                    />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="registered"
                      name="Registered"
                      fill="#16a34a"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />

                    <Bar
                      dataKey="remaining"
                      name="Remaining"
                      fill="#d1d5db"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            )}

            {/* ==================================================
                RECENT REGISTRATIONS
            ================================================== */}

            <div className="grid lg:grid-cols-3 gap-8">

              {/* Recent Volunteers */}

              <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30">

                <div className="flex items-center justify-between mb-4">

                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">

                    <Calendar className="w-5 h-5 text-green-700" />

                    Recent Registrations

                  </h2>

                  <a
                    href="/admin/volunteers"
                    className="text-sm text-green-700 hover:underline flex items-center"
                  >

                    View All

                    <ArrowUpRight className="w-4 h-4 ml-1" />

                  </a>

                </div>

                {recentVolunteers.length === 0 ? (

                  <div className="py-10 text-center text-gray-500">
                    No recent registrations
                  </div>

                ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                      <thead className="bg-gray-50/80 text-gray-600">

                        <tr>

                          <th className="p-3 text-left">
                            Photo
                          </th>

                          <th className="p-3 text-left">
                            Reg No
                          </th>

                          <th className="p-3 text-left">
                            Name
                          </th>

                          <th className="p-3 text-left">
                            Phone
                          </th>

                          <th className="p-3 text-left">
                            LGA
                          </th>

                          <th className="p-3 text-left">
                            Ward
                          </th>

                          <th className="p-3 text-left">
                            Polling Unit
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-gray-200">

                        {recentVolunteers.map(
                          (v) => (

                            <tr
                              key={v.id}
                              className="hover:bg-white/60 transition"
                            >

                              <td className="p-3">

                                <img
                                  src={getImageUrl(
                                    v.passport
                                  )}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                />

                              </td>

                              <td className="p-3 font-medium text-gray-800">

                                {v.registration_no ||
                                  "—"}

                              </td>

                              <td className="p-3">

                                {v.name || "—"}

                              </td>

                              <td className="p-3 text-gray-500">

                                {v.phone || "—"}

                              </td>

                              <td className="p-3 text-gray-500">

                                {getLga(v)}

                              </td>

                              <td className="p-3 text-gray-500">

                                {getWard(v)}

                              </td>

                              <td className="p-3 text-gray-500">

                                <div>

                                  <div className="font-medium text-gray-700">
                                    {getPollingUnit(v)}
                                  </div>

                                  {getPollingUnitCode(
                                    v
                                  ) && (

                                    <div className="text-xs text-green-700">
                                      {getPollingUnitCode(
                                        v
                                      )}
                                    </div>

                                  )}

                                </div>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

              {/* ==================================================
                  GROWTH / SYSTEM CARD
              ================================================== */}

              <div className="bg-gradient-to-br from-green-800 to-green-600 rounded-2xl p-6 text-white shadow-lg">

                <h2 className="text-xl font-bold">
                  Volunteer Overview
                </h2>

                <div className="mt-6">

                  <span className="text-5xl font-black">
                    {total}
                  </span>

                  <p className="text-green-100 mt-2">
                    Registered volunteers
                  </p>

                </div>

                <div className="mt-8 space-y-4">

                  <div className="flex justify-between text-sm">

                    <span>
                      Self Employed
                    </span>

                    <span className="font-bold">
                      {stats.self_employed ||
                        0}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span>
                      Unemployed
                    </span>

                    <span className="font-bold">
                      {unemployed}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span>
                      Employed
                    </span>

                    <span className="font-bold">
                      {employed}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span>
                      Youth Members
                    </span>

                    <span className="font-bold">
                      {youthMembers}
                    </span>

                  </div>

                </div>

                <div className="mt-8 pt-6 border-t border-green-500">

                  <p className="text-green-100 text-sm">
                    Polling Unit Capacity
                  </p>

                  <p className="font-bold text-lg">
                    {capacityPercentage}% Used
                  </p>

                  <div className="mt-3 h-2 bg-green-900/40 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-white rounded-full"
                      style={{
                        width: `${capacityPercentage}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="mt-8 pt-6 border-t border-green-500">

                  <p className="text-green-100 text-sm">
                    System Status
                  </p>

                  <div className="flex items-center gap-2 mt-1">

                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />

                    <p className="font-bold text-lg">
                      Online
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}