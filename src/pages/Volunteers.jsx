import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  Download,
  X,
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Accessibility,
  Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/Api";
import exIgpBackground from "../assets/ex-igp-bg.jpg"; // adjust path if needed

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [volRes, statRes] = await Promise.all([
        api.get("/api/volunteers"),
        api.get("/api/volunteers/stats/summary"),
      ]);
      const volData = volRes.data.data || [];
      setVolunteers(volData);
      setFilteredVolunteers(volData);
      if (statRes.data) setStats(statRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    const keyword = value.toLowerCase();
    const filtered = volunteers.filter(
      (v) =>
        v.name?.toLowerCase().includes(keyword) ||
        v.registration_no?.toLowerCase().includes(keyword) ||
        v.phone?.includes(value) ||
        v.lga?.toLowerCase().includes(keyword)
    );
    setFilteredVolunteers(filtered);
  };

  const viewVolunteer = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowModal(true);
  };

  const deleteVolunteer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this volunteer?"))
      return;
    try {
      await api.delete(`/volunteers/${id}`);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Delete failed. Please try again.");
    }
  };

  // Helper to get full image URL
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `https://ex-igp-adamu-backend.onrender.com/${path}`;
  };


  const statCards = [
    { label: "Total", value: stats.total_volunteers, icon: Users, color: "from-emerald-600 to-emerald-400" },
    { label: "Male", value: stats.male, icon: UserCheck, color: "from-blue-600 to-blue-400" },
    { label: "Female", value: stats.female, icon: UserCheck, color: "from-pink-600 to-pink-400" },
    { label: "Employed", value: stats.employed, icon: Briefcase, color: "from-amber-600 to-amber-400" },
    { label: "Youth Orgs", value: stats.youth_org_members, icon: Users, color: "from-purple-600 to-purple-400" },
    { label: "Challenged", value: stats.physically_challenged, icon: Accessibility, color: "from-rose-600 to-rose-400" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-green-700 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading volunteers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 relative overflow-hidden">
        {/* Fullscreen background with overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${exIgpBackground})` }}
        />
        <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-[2px]" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
            {/* Hero / Branding */}
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
                    Manage all registered volunteers. View details, download
                    membership cards, and keep your database organised.
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/20">
                  <Users className="h-8 w-8 text-yellow-400" />
                  <div>
                    <div className="text-3xl font-bold">
                      {stats.total_volunteers}
                    </div>
                    <div className="text-sm text-white/70">Registered</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
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
                    {card.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Search and Table */}
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
              {/* Search bar */}
              <div className="p-4 md:p-6 border-b border-white/20">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by name, reg no, phone..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/10 text-white/90 text-left">
                      <th className="p-4 font-semibold">Photo</th>
                      <th className="p-4 font-semibold">Reg No</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Phone</th>
                      <th className="p-4 font-semibold">LGA</th>
                      <th className="p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVolunteers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-white/70">
                          No volunteers found.
                        </td>
                      </tr>
                    ) : (
                      filteredVolunteers.map((v) => (
                        <tr
                          key={v.id}
                          className="border-b border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <td className="p-4">
                            <img
                              src={getImageUrl(v.passport_photo)}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                            />
                          </td>
                          <td className="p-4 font-medium text-white">
                            {v.registration_no}
                          </td>
                          <td className="p-4 text-white">{v.name}</td>
                          <td className="p-4 text-white/80">{v.phone}</td>
                          <td className="p-4 text-white/80">{v.lga}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => viewVolunteer(v)}
                                className="p-2 rounded-lg bg-blue-600/80 hover:bg-blue-700 text-white transition"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <a
                                href={getImageUrl(v.id_card)}
                                download
                                className="p-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-700 text-white transition"
                                title="Download membership card"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => deleteVolunteer(v.id)}
                                className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white transition"
                                title="Delete volunteer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-4">
                {filteredVolunteers.length === 0 ? (
                  <p className="text-center text-white/70 py-8">
                    No volunteers found.
                  </p>
                ) : (
                  filteredVolunteers.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                    >
                      <div className="flex gap-4 items-center">
                        <img
                          src={getImageUrl(v.passport_photo)}
                          alt=""
                          className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
                        />
                        <div>
                          <h3 className="font-bold text-white">{v.name}</h3>
                          <p className="text-sm text-white/80">{v.registration_no}</p>
                          <p className="text-sm text-white/70">{v.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => viewVolunteer(v)}
                          className="flex-1 bg-blue-600/80 text-white py-2 rounded-lg text-sm"
                        >
                          <Eye className="inline h-4 w-4 mr-1" /> View
                        </button>
                        <a
                          href={getImageUrl(v.id_card)}
                          download
                          className="flex-1 bg-emerald-600/80 text-white py-2 rounded-lg text-sm text-center"
                        >
                          <Download className="inline h-4 w-4 mr-1" /> Card
                        </a>
                        <button
                          onClick={() => deleteVolunteer(v.id)}
                          className="flex-1 bg-rose-600/80 text-white py-2 rounded-lg text-sm"
                        >
                          <Trash2 className="inline h-4 w-4 mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Volunteer Detail Modal */}
        {showModal && selectedVolunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-5xl p-6 md:p-8 relative border border-white/30">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 bg-white/80 rounded-full p-1"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Photo + QR */}
                <div className="shrink-0 flex flex-col items-center">
                  <img
                    src={getImageUrl(selectedVolunteer.passport_photo)}
                    alt=""
                    className="w-40 h-40 md:w-52 md:h-52 rounded-3xl object-cover border-4 border-green-200 shadow-lg"
                  />
                  {selectedVolunteer.qr_code && (
                    <div className="mt-4 p-2 bg-white rounded-xl shadow">
                      <img
                        src={getImageUrl(selectedVolunteer.qr_code)}
                        alt="QR"
                        className="w-24 h-24"
                      />
                      <p className="text-xs text-center mt-1 text-gray-500">
                        Scan QR
                      </p>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">
                    {selectedVolunteer.name}
                  </h2>
                  <p className="text-green-700 font-semibold text-lg mb-6">
                    {selectedVolunteer.registration_no}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Phone" value={selectedVolunteer.phone} />
                    <DetailItem label="Gender" value={selectedVolunteer.gender} />
                    <DetailItem label="Age" value={selectedVolunteer.age} />
                    <DetailItem label="LGA" value={selectedVolunteer.lga} />
                    <DetailItem label="Ward" value={selectedVolunteer.ward} />
                    <DetailItem label="Unit" value={selectedVolunteer.unit} />
                    <DetailItem
                      label="Highest Qualification"
                      value={selectedVolunteer.highest_qualification}
                    />
                    <DetailItem
                      label="Employment"
                      value={selectedVolunteer.employment_status}
                    />
                    {selectedVolunteer.physically_challenged && (
                      <DetailItem label="Physically Challenged" value="Yes" />
                    )}
                    {selectedVolunteer.youth_org_member && (
                      <>
                        <DetailItem
                          label="Youth Org"
                          value={selectedVolunteer.organization_name || "Yes"}
                        />
                        <DetailItem
                          label="Position"
                          value={selectedVolunteer.position}
                        />
                      </>
                    )}
                  </div>

                  {selectedVolunteer.expectation && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-700 mb-1">
                        Expectations
                      </h3>
                      <p className="text-gray-600 bg-gray-100 p-3 rounded-xl">
                        {selectedVolunteer.expectation}
                      </p>
                    </div>
                  )}

                  <div className="mt-8 flex gap-3">
                    <a
                      href={getImageUrl(selectedVolunteer.id_card)}
                      download
                      className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl transition shadow-md"
                    >
                      <Download className="h-5 w-5" /> Download Membership Card
                    </a>
                    <button
                      onClick={() => window.open(getImageUrl(selectedVolunteer.id_card), "_blank")}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl transition shadow-md"
                    >
                      <Eye className="h-5 w-5" /> View Card
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

// Reusable detail component
function DetailItem({ label, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}