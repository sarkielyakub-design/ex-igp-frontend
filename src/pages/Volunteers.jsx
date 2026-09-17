import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  Download,
  X,
  Users,
  UserCheck,
  Briefcase,
  Accessibility,
  Loader2,
  FileText,
  MapPin,
  Building2,
  LocateFixed,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/Api";
import exIgpBackground from "../assets/ex-igp-bg.jpg";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://ex-igp-adamu-backend-production.up.railway.app";

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  // Location filters
  const [lgaFilter, setLgaFilter] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [pollingUnitFilter, setPollingUnitFilter] = useState("");

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [stats, setStats] = useState({
    total_volunteers: 0,
    male: 0,
    female: 0,
    employed: 0,
    unemployed: 0,
    physically_challenged: 0,
    youth_org_members: 0,
  });

  /*
   * ============================================================
   * DATA HELPERS
   * ============================================================
   *
   * These helpers support both possible backend formats:
   *
   * 1. polling_unit: {
   *      id,
   *      lga_name,
   *      ward_name,
   *      pu_name,
   *      pu_code
   *    }
   *
   * 2. Existing volunteer fields:
   *      lga
   *      ward
   *      unit
   *      polling_unit_id
   */

  const getPollingUnit = (volunteer) => {
    return volunteer?.polling_unit || null;
  };

  const getLgaName = (volunteer) => {
    return (
      volunteer?.polling_unit?.lga_name ||
      volunteer?.lga ||
      "—"
    );
  };

  const getLgaCode = (volunteer) => {
    return (
      volunteer?.polling_unit?.lga_code ||
      volunteer?.lga_code ||
      ""
    );
  };

  const getWardName = (volunteer) => {
    return (
      volunteer?.polling_unit?.ward_name ||
      volunteer?.ward ||
      "—"
    );
  };

  const getWardCode = (volunteer) => {
    return (
      volunteer?.polling_unit?.ward_code ||
      volunteer?.ward_code ||
      ""
    );
  };

  const getPollingUnitName = (volunteer) => {
    return (
      volunteer?.polling_unit?.pu_name ||
      volunteer?.unit ||
      "—"
    );
  };

  const getPollingUnitCode = (volunteer) => {
    return (
      volunteer?.polling_unit?.pu_code ||
      volunteer?.pu_code ||
      ""
    );
  };

  const getPollingUnitId = (volunteer) => {
    return (
      volunteer?.polling_unit?.id ||
      volunteer?.polling_unit_id ||
      null
    );
  };

  const getPollingUnitLocation = (volunteer) => {
    return (
      volunteer?.polling_unit?.pu_location ||
      volunteer?.polling_unit?.location ||
      ""
    );
  };

  const getFullCode = (volunteer) => {
    return (
      volunteer?.polling_unit?.full_code ||
      volunteer?.full_code ||
      ""
    );
  };

  const getRegistrationTarget = (volunteer) => {
    return volunteer?.polling_unit?.registration_target ?? null;
  };

  const getRegisteredCount = (volunteer) => {
    return volunteer?.polling_unit?.registered_count ?? null;
  };

  const getRemainingCount = (volunteer) => {
    if (
      getRegistrationTarget(volunteer) === null ||
      getRegisteredCount(volunteer) === null
    ) {
      return null;
    }

    return Math.max(
      getRegistrationTarget(volunteer) -
        getRegisteredCount(volunteer),
      0
    );
  };

  const getPollingUnitStatus = (volunteer) => {
    return (
      volunteer?.polling_unit?.status ||
      ""
    );
  };

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [volRes, statRes] = await Promise.all([
        api.get("/api/volunteers/"),
        api.get("/api/volunteers/stats/summary"),
      ]);

      console.log("Volunteers:", volRes.data);
      console.log("Stats:", statRes.data);

      const volunteerData = Array.isArray(volRes.data)
        ? volRes.data
        : volRes.data?.data || [];

      setVolunteers(volunteerData);
      setStats(
        statRes.data || {
          total_volunteers: volunteerData.length,
          male: 0,
          female: 0,
          employed: 0,
          unemployed: 0,
          physically_challenged: 0,
          youth_org_members: 0,
        }
      );
    } catch (error) {
      console.error(
        "Failed to load volunteers:",
        error?.response?.data || error
      );

      if (!showRefresh) {
        setVolunteers([]);
      }

      alert(
        error?.response?.data?.detail ||
          "Failed to load volunteers. Please check the backend connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * ============================================================
   * FILTER OPTIONS
   * ============================================================
   */

  const lgaOptions = useMemo(() => {
    const map = new Map();

    volunteers.forEach((v) => {
      const name = getLgaName(v);
      const code = getLgaCode(v);

      if (name && name !== "—") {
        map.set(`${code}-${name}`, {
          code,
          name,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [volunteers]);

  const wardOptions = useMemo(() => {
    const map = new Map();

    volunteers.forEach((v) => {
      const lga = getLgaName(v);
      const ward = getWardName(v);
      const wardCode = getWardCode(v);

      if (!ward || ward === "—") return;

      if (
        lgaFilter &&
        lga.toLowerCase() !== lgaFilter.toLowerCase()
      ) {
        return;
      }

      /*
       * Ward codes can repeat between LGAs.
       * Therefore the key includes the LGA.
       */
      map.set(`${lga}-${wardCode}-${ward}`, {
        code: wardCode,
        name: ward,
        lga,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [volunteers, lgaFilter]);

  const pollingUnitOptions = useMemo(() => {
    const map = new Map();

    volunteers.forEach((v) => {
      const lga = getLgaName(v);
      const ward = getWardName(v);
      const unit = getPollingUnitName(v);
      const puCode = getPollingUnitCode(v);
      const puId = getPollingUnitId(v);

      if (!unit || unit === "—") return;

      if (
        lgaFilter &&
        lga.toLowerCase() !== lgaFilter.toLowerCase()
      ) {
        return;
      }

      if (
        wardFilter &&
        ward.toLowerCase() !== wardFilter.toLowerCase()
      ) {
        return;
      }

      /*
       * Prefer Polling Unit ID as the unique identifier.
       * If unavailable, use code + name.
       */
      const key =
        puId ||
        `${lga}-${ward}-${puCode}-${unit}`;

      map.set(key, {
        id: puId,
        code: puCode,
        name: unit,
        lga,
        ward,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [
    volunteers,
    lgaFilter,
    wardFilter,
  ]);

  /*
   * ============================================================
   * SEARCH + FILTER
   * ============================================================
   */

  const filteredVolunteers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return volunteers.filter((v) => {
      const name = v.name?.toLowerCase() || "";
      const registrationNo =
        v.registration_no?.toLowerCase() || "";
      const phone = v.phone?.toLowerCase() || "";

      const lga = getLgaName(v).toLowerCase();
      const ward = getWardName(v).toLowerCase();
      const pollingUnit =
        getPollingUnitName(v).toLowerCase();

      const lgaCode =
        getLgaCode(v).toLowerCase();

      const wardCode =
        getWardCode(v).toLowerCase();

      const puCode =
        getPollingUnitCode(v).toLowerCase();

      const puId =
        String(getPollingUnitId(v) || "").toLowerCase();

      const fullCode =
        getFullCode(v).toLowerCase();

      const matchesSearch =
        !keyword ||
        name.includes(keyword) ||
        registrationNo.includes(keyword) ||
        phone.includes(keyword) ||
        lga.includes(keyword) ||
        ward.includes(keyword) ||
        pollingUnit.includes(keyword) ||
        lgaCode.includes(keyword) ||
        wardCode.includes(keyword) ||
        puCode.includes(keyword) ||
        puId.includes(keyword) ||
        fullCode.includes(keyword);

      const matchesLga =
        !lgaFilter ||
        lga === lgaFilter.toLowerCase();

      const matchesWard =
        !wardFilter ||
        ward === wardFilter.toLowerCase();

      const selectedPu =
        pollingUnitOptions.find(
          (pu) =>
            String(pu.id || "") ===
              String(pollingUnitFilter) ||
            pu.name === pollingUnitFilter
        );

      const matchesPollingUnit =
        !pollingUnitFilter ||
        (
          selectedPu?.id &&
          String(getPollingUnitId(v)) ===
            String(selectedPu.id)
        ) ||
        (
          !selectedPu?.id &&
          pollingUnit ===
            String(pollingUnitFilter).toLowerCase()
        );

      return (
        matchesSearch &&
        matchesLga &&
        matchesWard &&
        matchesPollingUnit
      );
    });
  }, [
    volunteers,
    search,
    lgaFilter,
    wardFilter,
    pollingUnitFilter,
    pollingUnitOptions,
  ]);

  /*
   * ============================================================
   * FILTER RESET
   * ============================================================
   */

  const clearFilters = () => {
    setSearch("");
    setLgaFilter("");
    setWardFilter("");
    setPollingUnitFilter("");
  };

  /*
   * ============================================================
   * VIEW VOLUNTEER
   * ============================================================
   */

  const viewVolunteer = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowModal(true);
  };

  /*
   * ============================================================
   * DELETE VOLUNTEER
   * ============================================================
   */

  const deleteVolunteer = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this volunteer?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/volunteer/${id}`);

      setVolunteers((prev) =>
        prev.filter((v) => v.id !== id)
      );

      setSelectedVolunteer(null);
      setShowModal(false);

      alert("Volunteer deleted successfully.");
    } catch (error) {
      console.error(
        "Delete error:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Failed to delete volunteer."
      );
    }
  };

  /*
   * ============================================================
   * IMAGE URL
   * ============================================================
   */

  // =========================================================
  // PUBLIC FILE URL HELPER
  // =========================================================
  // Backend file fields can contain either a public URL or a
  // server filesystem path such as:
  //
  //   /app/app/uploads/passports/EIAYV-NS-000001.jpeg
  //   /app/app/uploads/cards/EIAYV-NS-000001-membership-card.pdf
  //
  // The browser must NEVER request /app/app/... directly.
  // Convert every local upload path into the public /uploads/ URL.
  // =========================================================

  const getImageUrl = (path) => {
    if (!path) return "";

    const rawPath = String(path).trim();

    // Already a complete public URL.
    if (
      rawPath.startsWith("http://") ||
      rawPath.startsWith("https://")
    ) {
      return rawPath;
    }

    // Remove any backend filesystem prefix and normalize slashes.
    const normalizedPath = rawPath.replace(/\\/g, "/");

    // If the backend returned a filesystem path containing
    // /uploads/, keep only the public portion.
    const uploadsIndex = normalizedPath.indexOf("/uploads/");

    if (uploadsIndex !== -1) {
      return `${API_BASE_URL}${normalizedPath.substring(
        uploadsIndex
      )}`;
    }

    // If it is already a relative uploads path.
    if (normalizedPath.startsWith("uploads/")) {
      return `${API_BASE_URL}/${normalizedPath}`;
    }

    if (normalizedPath.startsWith("/uploads/")) {
      return `${API_BASE_URL}${normalizedPath}`;
    }

    // Fallback for other relative paths.
    return `${API_BASE_URL}/${normalizedPath.replace(/^\/+/, "")}`;
  };

  // =========================================================
  // MEMBERSHIP CARD URL
  // =========================================================
  // Always expose membership cards through the public static
  // route, regardless of the filesystem path returned by backend.
  // =========================================================

  const getMembershipCardUrl = (path) => {
    if (!path) return "";

    const rawPath = String(path).trim();

    if (
      rawPath.startsWith("http://") ||
      rawPath.startsWith("https://")
    ) {
      return rawPath;
    }

    const normalizedPath = rawPath.replace(/\\/g, "/");
    const filename = normalizedPath.split("/").pop();

    if (!filename) return "";

    return `${API_BASE_URL}/uploads/cards/${encodeURIComponent(
      filename
    )}`;
  };

  /*
   * ============================================================
   * PRINT VOLUNTEER DETAILS
   * ============================================================
   */

  const printVolunteerPDF = (volunteer) => {
    const printWindow = window.open(
      "",
      "_blank"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print volunteer details."
      );
      return;
    }

    const pollingUnitName =
      getPollingUnitName(volunteer);

    const pollingUnitCode =
      getPollingUnitCode(volunteer);

    const pollingUnitId =
      getPollingUnitId(volunteer);

    const pollingUnitLocation =
      getPollingUnitLocation(volunteer);

    const html = `
      <html>
        <head>
          <title>${volunteer.name} Details</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #222;
            }

            h1 {
              color: #166534;
              margin-bottom: 4px;
            }

            h2 {
              margin-top: 30px;
              color: #166534;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
            }

            .info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }

            .item {
              background: #f5f5f5;
              padding: 10px;
              border-radius: 8px;
            }

            .label {
              font-size: 11px;
              color: #777;
              text-transform: uppercase;
              margin-bottom: 3px;
            }

            .value {
              font-weight: 600;
            }

            .location {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
            }

            img {
              max-width: 150px;
              max-height: 150px;
              border-radius: 10px;
              margin-top: 20px;
            }

            @media print {
              body {
                padding: 10px;
              }
            }
          </style>
        </head>

        <body>

          <h1>EX-IGP ADAMU YOUTH VOLUNTEERS</h1>

          <p>
            <strong>Volunteer:</strong>
            ${volunteer.name || "—"}
          </p>

          <p>
            <strong>Registration No:</strong>
            ${volunteer.registration_no || "—"}
          </p>

          <h2>Personal Information</h2>

          <div class="info">

            <div class="item">
              <div class="label">Phone</div>
              <div class="value">
                ${volunteer.phone || "—"}
              </div>
            </div>

            <div class="item">
              <div class="label">Gender</div>
              <div class="value">
                ${volunteer.gender || "—"}
              </div>
            </div>

            <div class="item">
              <div class="label">Age</div>
              <div class="value">
                ${volunteer.age || "—"}
              </div>
            </div>

            <div class="item">
              <div class="label">Employment</div>
              <div class="value">
                ${volunteer.employment_status || "—"}
              </div>
            </div>

          </div>

          <h2>Registration Location</h2>

          <div class="info">

            <div class="item location">
              <div class="label">LGA</div>
              <div class="value">
                ${getLgaName(volunteer)}
              </div>
            </div>

            <div class="item location">
              <div class="label">LGA Code</div>
              <div class="value">
                ${getLgaCode(volunteer) || "—"}
              </div>
            </div>

            <div class="item location">
              <div class="label">Ward / Registration Area</div>
              <div class="value">
                ${getWardName(volunteer)}
              </div>
            </div>

            <div class="item location">
              <div class="label">Ward Code</div>
              <div class="value">
                ${getWardCode(volunteer) || "—"}
              </div>
            </div>

            <div class="item location">
              <div class="label">Polling Unit</div>
              <div class="value">
                ${pollingUnitName}
              </div>
            </div>

            <div class="item location">
              <div class="label">Polling Unit Code</div>
              <div class="value">
                ${pollingUnitCode || "—"}
              </div>
            </div>

            <div class="item location">
              <div class="label">Polling Unit ID</div>
              <div class="value">
                ${pollingUnitId || "—"}
              </div>
            </div>

            <div class="item location">
              <div class="label">Full Code</div>
              <div class="value">
                ${getFullCode(volunteer) || "—"}
              </div>
            </div>

            ${
              pollingUnitLocation
                ? `
                  <div class="item location">
                    <div class="label">
                      Polling Unit Location
                    </div>
                    <div class="value">
                      ${pollingUnitLocation}
                    </div>
                  </div>
                `
                : ""
            }

          </div>

          <h2>Qualification</h2>

          <div class="info">

            <div class="item">
              <div class="label">
                Highest Qualification
              </div>

              <div class="value">
                ${volunteer.highest_qualification || "—"}
              </div>
            </div>

            <div class="item">
              <div class="label">
                Additional Qualification
              </div>

              <div class="value">
                ${volunteer.additional_qualification || "—"}
              </div>
            </div>

            <div class="item">
              <div class="label">
                Specialization
              </div>

              <div class="value">
                ${volunteer.specialization || "—"}
              </div>
            </div>

          </div>

          ${
            volunteer.organization_name ||
            volunteer.position
              ? `
                <h2>Youth Organization</h2>

                <div class="info">

                  <div class="item">
                    <div class="label">
                      Organization
                    </div>

                    <div class="value">
                      ${volunteer.organization_name || "—"}
                    </div>
                  </div>

                  <div class="item">
                    <div class="label">
                      Position
                    </div>

                    <div class="value">
                      ${volunteer.position || "—"}
                    </div>
                  </div>

                </div>
              `
              : ""
          }

          ${
            volunteer.expectation
              ? `
                <h2>Expectations</h2>

                <div class="item">
                  ${volunteer.expectation}
                </div>
              `
              : ""
          }

          ${
            volunteer.physically_challenged
              ? `
                <p>
                  <strong>
                    Physically Challenged:
                  </strong>
                  Yes
                </p>
              `
              : ""
          }

          <div>
            <img
              src="${getImageUrl(
                volunteer.passport
              )}"
              alt="Volunteer Passport"
            />
          </div>

        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  /*
   * ============================================================
   * STAT CARDS
   * ============================================================
   */

  const statCards = [
    {
      label: "Total",
      value: stats.total_volunteers,
      icon: Users,
      color:
        "from-emerald-600 to-emerald-400",
    },

    {
      label: "Male",
      value: stats.male,
      icon: UserCheck,
      color:
        "from-blue-600 to-blue-400",
    },

    {
      label: "Female",
      value: stats.female,
      icon: UserCheck,
      color:
        "from-pink-600 to-pink-400",
    },

    {
      label: "Employed",
      value: stats.employed,
      icon: Briefcase,
      color:
        "from-amber-600 to-amber-400",
    },

    {
      label: "Youth Orgs",
      value: stats.youth_org_members,
      icon: Users,
      color:
        "from-purple-600 to-purple-400",
    },

    {
      label: "Challenged",
      value: stats.physically_challenged,
      icon: Accessibility,
      color:
        "from-rose-600 to-rose-400",
    },
  ];

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-green-700 mx-auto" />

          <p className="mt-4 text-lg text-gray-600">
            Loading volunteers...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * MAIN UI
   * ============================================================
   */

  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <div className="flex-1 relative overflow-hidden">

        {/* Background */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              `url(${exIgpBackground})`,
          }}
        />

        <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-[2px]" />

        <div className="relative z-10 flex flex-col min-h-screen">

          <Navbar />

          <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">

            {/* ==================================================
                HERO
            ================================================== */}

            <div className="relative bg-white/20 backdrop-blur-lg rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-white/30">

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">

                <div>

                  <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                    EX-IGP ADAMU
                  </h1>

                  <h2 className="text-yellow-400 text-xl md:text-2xl font-bold mt-1">
                    YOUTH VOLUNTEERS
                  </h2>

                  <p className="text-white/80 mt-2 max-w-xl">
                    Manage all registered volunteers.
                    View details, download membership
                    cards, and keep your database organised.
                  </p>

                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/20">

                  <Users className="h-8 w-8 text-yellow-400" />

                  <div>

                    <div className="text-3xl font-bold">
                      {stats.total_volunteers}
                    </div>

                    <div className="text-sm text-white/70">
                      Registered
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ==================================================
                STATS
            ================================================== */}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

              {statCards.map((card, idx) => (

                <div
                  key={idx}
                  className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 text-white shadow-lg border border-white/30 flex flex-col items-center md:items-start hover:scale-105 transition-transform duration-300"
                >

                  <div className="flex items-center gap-2 mb-2">

                    <card.icon className="h-5 w-5 text-white/80" />

                    <span className="text-sm font-medium text-white/80">
                      {card.label}
                    </span>

                  </div>

                  <span className="text-2xl md:text-3xl font-bold">
                    {card.value ?? 0}
                  </span>

                </div>

              ))}

            </div>

            {/* ==================================================
                VOLUNTEERS
            ================================================== */}

            <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">

              {/* SEARCH + FILTERS */}

              <div className="p-4 md:p-6 border-b border-white/20 space-y-4">

                {/* Search */}

                <div className="flex flex-col md:flex-row gap-3">

                  <div className="relative flex-1">

                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />

                    <input
                      type="text"
                      placeholder="Search name, registration no, phone, LGA, ward or polling unit..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 backdrop-blur-sm"
                    />

                  </div>

                  {/* Refresh */}

                  <button
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >

                    <RefreshCw
                      className={`h-5 w-5 ${
                        refreshing
                          ? "animate-spin"
                          : ""
                      }`}
                    />

                    <span className="hidden sm:inline">
                      Refresh
                    </span>

                  </button>

                </div>

                {/* Filters */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  {/* LGA */}

                  <div className="relative">

                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />

                    <select
                      value={lgaFilter}
                      onChange={(e) => {
                        setLgaFilter(
                          e.target.value
                        );
                        setWardFilter("");
                        setPollingUnitFilter("");
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                    >

                      <option
                        value=""
                        className="text-gray-900"
                      >
                        All LGAs
                      </option>

                      {lgaOptions.map(
                        (lga) => (
                          <option
                            key={`${lga.code}-${lga.name}`}
                            value={lga.name}
                            className="text-gray-900"
                          >
                            {lga.name}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* WARD */}

                  <div className="relative">

                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />

                    <select
                      value={wardFilter}
                      onChange={(e) => {
                        setWardFilter(
                          e.target.value
                        );
                        setPollingUnitFilter("");
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                    >

                      <option
                        value=""
                        className="text-gray-900"
                      >
                        All Wards
                      </option>

                      {wardOptions.map(
                        (ward) => (
                          <option
                            key={`${ward.lga}-${ward.code}-${ward.name}`}
                            value={ward.name}
                            className="text-gray-900"
                          >
                            {ward.name}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* POLLING UNIT */}

                  <div className="relative">

                    <LocateFixed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />

                    <select
                      value={pollingUnitFilter}
                      onChange={(e) =>
                        setPollingUnitFilter(
                          e.target.value
                        )
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                    >

                      <option
                        value=""
                        className="text-gray-900"
                      >
                        All Polling Units
                      </option>

                      {pollingUnitOptions.map(
                        (unit) => (
                          <option
                            key={
                              unit.id ||
                              `${unit.lga}-${unit.ward}-${unit.code}-${unit.name}`
                            }
                            value={
                              unit.id
                                ? String(unit.id)
                                : unit.name
                            }
                            className="text-gray-900"
                          >
                            {unit.code
                              ? `${unit.code} — ${unit.name}`
                              : unit.name}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

                {/* FILTER SUMMARY */}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

                  <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">

                    <span>
                      Showing{" "}
                      <strong className="text-white">
                        {filteredVolunteers.length}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-white">
                        {volunteers.length}
                      </strong>{" "}
                      volunteers
                    </span>

                    {lgaFilter && (
                      <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/20">
                        LGA: {lgaFilter}
                      </span>
                    )}

                    {wardFilter && (
                      <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/20">
                        Ward: {wardFilter}
                      </span>
                    )}

                    {pollingUnitFilter && (
                      <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/20">
                        Polling Unit selected
                      </span>
                    )}

                  </div>

                  {(search ||
                    lgaFilter ||
                    wardFilter ||
                    pollingUnitFilter) && (

                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm border border-white/20 transition"
                    >
                      Clear Filters
                    </button>

                  )}

                </div>

              </div>

              {/* ==================================================
                  DESKTOP TABLE
              ================================================== */}

              <div className="hidden md:block overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>

                    <tr className="bg-white/10 text-white/90 text-left">

                      <th className="p-4 font-semibold">
                        Photo
                      </th>

                      <th className="p-4 font-semibold">
                        Reg No
                      </th>

                      <th className="p-4 font-semibold">
                        Name
                      </th>

                      <th className="p-4 font-semibold">
                        Phone
                      </th>

                      <th className="p-4 font-semibold">
                        LGA
                      </th>

                      <th className="p-4 font-semibold">
                        Ward
                      </th>

                      <th className="p-4 font-semibold">
                        Polling Unit
                      </th>

                      <th className="p-4 font-semibold">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredVolunteers.length === 0 ? (

                      <tr>

                        <td
                          colSpan={8}
                          className="p-10 text-center text-white/70"
                        >

                          <div className="flex flex-col items-center">

                            <Users className="h-12 w-12 text-white/30 mb-3" />

                            <p className="text-lg">
                              No volunteers found.
                            </p>

                            {(search ||
                              lgaFilter ||
                              wardFilter ||
                              pollingUnitFilter) && (

                              <button
                                onClick={clearFilters}
                                className="mt-3 text-yellow-400 hover:text-yellow-300"
                              >
                                Clear filters
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    ) : (

                      filteredVolunteers.map(
                        (v) => (

                          <tr
                            key={v.id}
                            className="border-b border-white/10 hover:bg-white/10 transition-colors"
                          >

                            {/* Photo */}

                            <td className="p-4">

                              <img
                                src={getImageUrl(
                                  v.passport
                                )}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                              />

                            </td>

                            {/* Registration */}

                            <td className="p-4 font-medium text-white">

                              {v.registration_no ||
                                "—"}

                            </td>

                            {/* Name */}

                            <td className="p-4 text-white">

                              {v.name || "—"}

                            </td>

                            {/* Phone */}

                            <td className="p-4 text-white/80">

                              {v.phone || "—"}

                            </td>

                            {/* LGA */}

                            <td className="p-4 text-white/80">

                              <div>
                                <div>
                                  {getLgaName(v)}
                                </div>

                                {getLgaCode(v) && (
                                  <div className="text-xs text-white/40">
                                    Code:{" "}
                                    {getLgaCode(v)}
                                  </div>
                                )}
                              </div>

                            </td>

                            {/* Ward */}

                            <td className="p-4 text-white/80">

                              <div>
                                <div>
                                  {getWardName(v)}
                                </div>

                                {getWardCode(v) && (
                                  <div className="text-xs text-white/40">
                                    Code:{" "}
                                    {getWardCode(v)}
                                  </div>
                                )}
                              </div>

                            </td>

                            {/* Polling Unit */}

                            <td className="p-4 text-white/80">

                              <div className="min-w-[180px]">

                                <div className="font-medium text-white">

                                  {getPollingUnitName(
                                    v
                                  )}

                                </div>

                                {getPollingUnitCode(
                                  v
                                ) && (

                                  <div className="text-xs text-yellow-300/80 mt-1">

                                    {getPollingUnitCode(
                                      v
                                    )}

                                  </div>

                                )}

                                {getPollingUnitId(
                                  v
                                ) && (

                                  <div className="text-xs text-white/40">

                                    ID:{" "}
                                    {getPollingUnitId(
                                      v
                                    )}

                                  </div>

                                )}

                              </div>

                            </td>

                            {/* Actions */}

                            <td className="p-4">

                              <div className="flex gap-2">

                                <button
                                  onClick={() =>
                                    viewVolunteer(v)
                                  }
                                  className="p-2 rounded-lg bg-blue-600/80 hover:bg-blue-700 text-white transition"
                                  title="View details"
                                >

                                  <Eye className="h-4 w-4" />

                                </button>

                                <a
                                  href={getMembershipCardUrl(
                                    v.id_card
                                  )}
                                  download
                                  className="p-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-700 text-white transition"
                                  title="Download membership card"
                                >

                                  <Download className="h-4 w-4" />

                                </a>

                                <button
                                  onClick={() =>
                                    deleteVolunteer(
                                      v.id
                                    )
                                  }
                                  className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white transition"
                                  title="Delete volunteer"
                                >

                                  <Trash2 className="h-4 w-4" />

                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

              {/* ==================================================
                  MOBILE CARDS
              ================================================== */}

              <div className="md:hidden p-4 space-y-4">

                {filteredVolunteers.length === 0 ? (

                  <div className="text-center text-white/70 py-10">

                    <Users className="h-12 w-12 text-white/30 mx-auto mb-3" />

                    <p>
                      No volunteers found.
                    </p>

                  </div>

                ) : (

                  filteredVolunteers.map(
                    (v) => (

                      <div
                        key={v.id}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                      >

                        <div className="flex gap-4 items-start">

                          <img
                            src={getImageUrl(
                              v.passport
                            )}
                            alt=""
                            className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
                          />

                          <div className="flex-1 min-w-0">

                            <h3 className="font-bold text-white truncate">
                              {v.name || "—"}
                            </h3>

                            <p className="text-sm text-white/80">
                              {v.registration_no ||
                                "—"}
                            </p>

                            <p className="text-sm text-white/70">
                              {v.phone || "—"}
                            </p>

                          </div>

                        </div>

                        {/* Location */}

                        <div className="mt-4 bg-black/10 rounded-xl p-3 space-y-2">

                          <div className="flex items-start gap-2">

                            <Building2 className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />

                            <div>

                              <p className="text-[10px] uppercase text-white/40">
                                LGA
                              </p>

                              <p className="text-sm text-white">
                                {getLgaName(v)}
                              </p>

                            </div>

                          </div>

                          <div className="flex items-start gap-2">

                            <MapPin className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />

                            <div>

                              <p className="text-[10px] uppercase text-white/40">
                                Ward
                              </p>

                              <p className="text-sm text-white">
                                {getWardName(v)}
                              </p>

                              {getWardCode(v) && (
                                <p className="text-xs text-white/40">
                                  Code:{" "}
                                  {getWardCode(v)}
                                </p>
                              )}

                            </div>

                          </div>

                          <div className="flex items-start gap-2">

                            <LocateFixed className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />

                            <div>

                              <p className="text-[10px] uppercase text-white/40">
                                Polling Unit
                              </p>

                              <p className="text-sm text-white">
                                {getPollingUnitName(
                                  v
                                )}
                              </p>

                              {getPollingUnitCode(
                                v
                              ) && (

                                <p className="text-xs text-yellow-300/70">
                                  {getPollingUnitCode(
                                    v
                                  )}
                                </p>

                              )}

                            </div>

                          </div>

                        </div>

                        {/* Actions */}

                        <div className="flex gap-2 mt-4">

                          <button
                            onClick={() =>
                              viewVolunteer(v)
                            }
                            className="flex-1 bg-blue-600/80 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition"
                          >

                            <Eye className="inline h-4 w-4 mr-1" />

                            View

                          </button>

                          <a
                            href={getMembershipCardUrl(
                              v.id_card
                            )}
                            download
                            className="flex-1 bg-emerald-600/80 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm text-center transition"
                          >

                            <Download className="inline h-4 w-4 mr-1" />

                            Card

                          </a>

                          <button
                            onClick={() =>
                              deleteVolunteer(
                                v.id
                              )
                            }
                            className="flex-1 bg-rose-600/80 hover:bg-rose-700 text-white py-2 rounded-lg text-sm transition"
                          >

                            <Trash2 className="inline h-4 w-4 mr-1" />

                            Delete

                          </button>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          </div>

        </div>

        {/* ======================================================
            VOLUNTEER DETAIL MODAL
        ====================================================== */}

        {showModal &&
          selectedVolunteer && (

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">

              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-5xl p-6 md:p-8 relative border border-white/30 overflow-y-auto max-h-[90vh]">

                {/* Close */}

                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 bg-white/80 rounded-full p-1"
                >

                  <X className="h-6 w-6" />

                </button>

                <div className="flex flex-col md:flex-row gap-8">

                  {/* ==================================================
                      PHOTO + QR
                  ================================================== */}

                  <div className="shrink-0 flex flex-col items-center">

                    <img
                      src={getImageUrl(
                        selectedVolunteer.passport
                      )}
                      alt=""
                      className="w-40 h-40 md:w-52 md:h-52 rounded-3xl object-cover border-4 border-green-200 shadow-lg"
                    />

                    {selectedVolunteer.qr_code && (

                      <div className="mt-4 p-2 bg-white rounded-xl shadow">

                        <img
                          src={getImageUrl(
                            selectedVolunteer.qr_code
                          )}
                          alt="QR"
                          className="w-24 h-24"
                        />

                        <p className="text-xs text-center mt-1 text-gray-500">
                          Scan QR
                        </p>

                      </div>

                    )}

                  </div>

                  {/* ==================================================
                      DETAILS
                  ================================================== */}

                  <div className="flex-1">

                    <h2 className="text-3xl font-bold text-gray-800 mb-1">
                      {selectedVolunteer.name}
                    </h2>

                    <p className="text-green-700 font-semibold text-lg mb-6">
                      {selectedVolunteer.registration_no}
                    </p>

                    {/* Personal */}

                    <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-3">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <DetailItem
                        label="Phone"
                        value={
                          selectedVolunteer.phone
                        }
                      />

                      <DetailItem
                        label="Gender"
                        value={
                          selectedVolunteer.gender
                        }
                      />

                      <DetailItem
                        label="Age"
                        value={
                          selectedVolunteer.age
                        }
                      />

                      <DetailItem
                        label="Employment"
                        value={
                          selectedVolunteer.employment_status
                        }
                      />

                    </div>

                    {/* ==================================================
                        LOCATION
                    ================================================== */}

                    <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mt-7 mb-3">
                      Registration Location
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <DetailItem
                        label="LGA"
                        value={getLgaName(
                          selectedVolunteer
                        )}
                      />

                      <DetailItem
                        label="LGA Code"
                        value={getLgaCode(
                          selectedVolunteer
                        )}
                      />

                      <DetailItem
                        label="Ward / Registration Area"
                        value={getWardName(
                          selectedVolunteer
                        )}
                      />

                      <DetailItem
                        label="Ward Code"
                        value={getWardCode(
                          selectedVolunteer
                        )}
                      />

                      <DetailItem
                        label="Polling Unit"
                        value={getPollingUnitName(
                          selectedVolunteer
                        )}
                      />

                      <DetailItem
                        label="Polling Unit Code"
                        value={getPollingUnitCode(
                          selectedVolunteer
                        )}
                      />

                      <DetailItem
                        label="Polling Unit ID"
                        value={getPollingUnitId(
                          selectedVolunteer
                        )}
                      />

                      <DetailItem
                        label="Full Code"
                        value={getFullCode(
                          selectedVolunteer
                        )}
                      />

                      {getPollingUnitLocation(
                        selectedVolunteer
                      ) && (

                        <DetailItem
                          label="Polling Unit Location"
                          value={getPollingUnitLocation(
                            selectedVolunteer
                          )}
                        />

                      )}

                      {getPollingUnitStatus(
                        selectedVolunteer
                      ) && (

                        <DetailItem
                          label="Polling Unit Status"
                          value={getPollingUnitStatus(
                            selectedVolunteer
                          )}
                        />

                      )}

                      {getRegistrationTarget(
                        selectedVolunteer
                      ) !== null && (

                        <DetailItem
                          label="Registration Target"
                          value={getRegistrationTarget(
                            selectedVolunteer
                          )}
                        />

                      )}

                      {getRegisteredCount(
                        selectedVolunteer
                      ) !== null && (

                        <DetailItem
                          label="Registered at Polling Unit"
                          value={getRegisteredCount(
                            selectedVolunteer
                          )}
                        />

                      )}

                      {getRemainingCount(
                        selectedVolunteer
                      ) !== null && (

                        <DetailItem
                          label="Remaining Capacity"
                          value={getRemainingCount(
                            selectedVolunteer
                          )}
                        />

                      )}

                    </div>

                    {/* ==================================================
                        QUALIFICATION
                    ================================================== */}

                    <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mt-7 mb-3">
                      Qualification & Employment
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <DetailItem
                        label="Highest Qualification"
                        value={
                          selectedVolunteer.highest_qualification
                        }
                      />

                      <DetailItem
                        label="Additional Qualification"
                        value={
                          selectedVolunteer.additional_qualification
                        }
                      />

                      <DetailItem
                        label="Specialization"
                        value={
                          selectedVolunteer.specialization
                        }
                      />

                    </div>

                    {/* Challenged */}

                    {selectedVolunteer.physically_challenged && (

                      <div className="mt-4">

                        <DetailItem
                          label="Physically Challenged"
                          value="Yes"
                        />

                      </div>

                    )}

                    {/* ==================================================
                        YOUTH ORGANIZATION
                    ================================================== */}

                    {selectedVolunteer.youth_org_member && (

                      <>

                        <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mt-7 mb-3">
                          Youth Organization
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          <DetailItem
                            label="Organization"
                            value={
                              selectedVolunteer.organization_name ||
                              "Yes"
                            }
                          />

                          <DetailItem
                            label="Position"
                            value={
                              selectedVolunteer.position
                            }
                          />

                        </div>

                      </>

                    )}

                    {/* ==================================================
                        EXPECTATIONS
                    ================================================== */}

                    {selectedVolunteer.expectation && (

                      <div className="mt-6">

                        <h3 className="font-semibold text-gray-700 mb-1">
                          Expectations
                        </h3>

                        <p className="text-gray-600 bg-gray-100 p-3 rounded-xl">
                          {
                            selectedVolunteer.expectation
                          }
                        </p>

                      </div>

                    )}

                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="mt-8 flex flex-wrap gap-3">

                      {/* Download card */}

                      {selectedVolunteer.id_card && (

                        <a
                          href={getMembershipCardUrl(
                            selectedVolunteer.id_card
                          )}
                          download
                          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl transition shadow-md"
                        >

                          <Download className="h-5 w-5" />

                          Download Membership Card

                        </a>

                      )}

                      {/* View card */}

                      {selectedVolunteer.id_card && (

                        <button
                          onClick={() =>
                            window.open(
                              getMembershipCardUrl(
                                selectedVolunteer.id_card
                              ),
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl transition shadow-md"
                        >

                          <Eye className="h-5 w-5" />

                          View Card

                        </button>

                      )}

                      {/* PDF */}

                      <button
                        onClick={() =>
                          printVolunteerPDF(
                            selectedVolunteer
                          )
                        }
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition shadow-md"
                      >

                        <FileText className="h-5 w-5" />

                        Download Details PDF

                      </button>

                      {/* Delete */}

                      <button
                        onClick={() =>
                          deleteVolunteer(
                            selectedVolunteer.id
                          )
                        }
                        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl transition shadow-md"
                      >

                        <Trash2 className="h-5 w-5" />

                        Delete Volunteer

                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          )}

      </div>

    </div>
  );
}

/*
 * ============================================================
 * DETAIL ITEM
 * ============================================================
 */

function DetailItem({ label, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl">

      <p className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </p>

      <p className="font-medium text-gray-800 break-words">
        {value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
          ? value
          : "—"}
      </p>

    </div>
  );
}