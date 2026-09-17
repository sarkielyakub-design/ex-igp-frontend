import { useEffect, useState } from "react";
import {
  Loader2,
  Upload,
  CheckCircle,
  Download,
  Printer,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { registerVolunteer } from "../services/VolunteerApi";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://ex-igp-adamu-backend-production.up.railway.app";

export default function RegisterVolunteer() {
  const [loading, setLoading] = useState(false);

  // Location loading states
  const [loadingLGAs, setLoadingLGAs] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingPollingUnits, setLoadingPollingUnits] = useState(false);

  // Official Nasarawa location data
  const [lgas, setLgas] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingUnits, setPollingUnits] = useState([]);

  const [selectedLga, setSelectedLga] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedPollingUnit, setSelectedPollingUnit] = useState("");

  const [selectedPollingUnitData, setSelectedPollingUnitData] =
    useState(null);

  const [locationError, setLocationError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    age: "",

    highest_qualification: "",
    additional_qualification: "",
    specialization: "",

    employment_status: "",

    physically_challenged: false,
    youth_org_member: false,
    organization_name: "",
    position: "",
    expectation: "",
  });

  const [passport, setPassport] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  /*
   * ---------------------------------------------------------
   * Generic API helper
   * ---------------------------------------------------------
   */
  const fetchAPI = async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  };

  /*
   * ---------------------------------------------------------
   * Load LGAs
   * ---------------------------------------------------------
   */
  const loadLGAs = async () => {
    setLoadingLGAs(true);
    setLocationError("");

    try {
      const data = await fetchAPI("/api/polling-units/lgas");

      /*
       * Supports either:
       *
       * [
       *   { lga_code, lga_name }
       * ]
       *
       * or:
       *
       * {
       *   lgas: [...]
       * }
       */
      const lgaList = Array.isArray(data) ? data : data?.lgas || [];

      setLgas(lgaList);
    } catch (error) {
      console.error("Failed to load LGAs:", error);
      setLocationError(
        "Unable to load LGAs. Please check your internet connection and try again."
      );
    } finally {
      setLoadingLGAs(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Load wards after LGA selection
   * ---------------------------------------------------------
   */
  const loadWards = async (lgaCode) => {
    if (!lgaCode) {
      setWards([]);
      return;
    }

    setLoadingWards(true);
    setLocationError("");

    try {
      const data = await fetchAPI(
        `/api/polling-units/wards?lga_code=${encodeURIComponent(lgaCode)}`
      );

      /*
       * Supports either:
       *
       * [
       *   { ward_code, ward_name }
       * ]
       *
       * or:
       *
       * {
       *   wards: [...]
       * }
       */
      const wardList = Array.isArray(data) ? data : data?.wards || [];

      setWards(wardList);
    } catch (error) {
      console.error("Failed to load wards:", error);
      setWards([]);
      setLocationError(
        "Unable to load wards for the selected LGA. Please try again."
      );
    } finally {
      setLoadingWards(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Load polling units after Ward selection
   * ---------------------------------------------------------
   */
  const loadPollingUnits = async (lgaCode, wardCode) => {
    if (!lgaCode || !wardCode) {
      setPollingUnits([]);
      return;
    }

    setLoadingPollingUnits(true);
    setLocationError("");

    try {
      const data = await fetchAPI(
        `/api/polling-units?lga_code=${encodeURIComponent(
          lgaCode
        )}&ward_code=${encodeURIComponent(wardCode)}`
      );

      /*
       * Supports either:
       *
       * [
       *   {...}
       * ]
       *
       * or:
       *
       * {
       *   polling_units: [...]
       * }
       *
       * or:
       *
       * {
       *   items: [...]
       * }
       */
      const unitList = Array.isArray(data)
        ? data
        : data?.polling_units || data?.items || [];

      setPollingUnits(unitList);
    } catch (error) {
      console.error("Failed to load polling units:", error);
      setPollingUnits([]);
      setLocationError(
        "Unable to load polling units for the selected ward. Please try again."
      );
    } finally {
      setLoadingPollingUnits(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Initial location load
   * ---------------------------------------------------------
   */
  useEffect(() => {
    loadLGAs();
  }, []);

  /*
   * ---------------------------------------------------------
   * LGA change
   * ---------------------------------------------------------
   */
  const handleLgaChange = async (e) => {
    const lgaCode = e.target.value;

    setSelectedLga(lgaCode);

    // Reset children
    setSelectedWard("");
    setSelectedPollingUnit("");
    setWards([]);
    setPollingUnits([]);
    setSelectedPollingUnitData(null);

    if (lgaCode) {
      await loadWards(lgaCode);
    }
  };

  /*
   * ---------------------------------------------------------
   * Ward change
   * ---------------------------------------------------------
   */
  const handleWardChange = async (e) => {
    const wardCode = e.target.value;

    setSelectedWard(wardCode);

    // Reset polling unit
    setSelectedPollingUnit("");
    setPollingUnits([]);
    setSelectedPollingUnitData(null);

    if (wardCode && selectedLga) {
      await loadPollingUnits(selectedLga, wardCode);
    }
  };

  /*
   * ---------------------------------------------------------
   * Polling Unit change
   * ---------------------------------------------------------
   */
  const handlePollingUnitChange = (e) => {
    const pollingUnitId = e.target.value;

    setSelectedPollingUnit(pollingUnitId);

    const unit = pollingUnits.find(
      (item) => String(item.id) === String(pollingUnitId)
    );

    setSelectedPollingUnitData(unit || null);
  };

  /*
   * ---------------------------------------------------------
   * Form changes
   * ---------------------------------------------------------
   */
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /*
   * ---------------------------------------------------------
   * Passport
   * ---------------------------------------------------------
   */
  const handlePassport = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setPassport(null);
      setPreview(null);
      return;
    }

    setPassport(file);
    setPreview(URL.createObjectURL(file));
  };

  /*
   * ---------------------------------------------------------
   * Submit
   * ---------------------------------------------------------
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLga) {
      alert("Please select an LGA.");
      return;
    }

    if (!selectedWard) {
      alert("Please select a Ward.");
      return;
    }

    if (!selectedPollingUnit) {
      alert("Please select a Polling Unit.");
      return;
    }

    if (!passport) {
      alert("Please upload your passport photograph.");
      return;
    }

    if (
      selectedPollingUnitData &&
      String(selectedPollingUnitData.status).toUpperCase() === "FULL"
    ) {
      alert(
        "This polling unit has reached its registration capacity. Please select another polling unit."
      );
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      /*
       * Personal information
       */
      data.append("name", form.name);
      data.append("phone", form.phone);
      data.append("gender", form.gender);
      data.append("age", form.age);

      /*
       * IMPORTANT:
       *
       * We DO NOT submit:
       *
       * lga
       * ward
       * unit
       *
       * anymore.
       *
       * The backend derives these values from polling_unit_id.
       */
      data.append("polling_unit_id", selectedPollingUnit);

      /*
       * Education
       */
      data.append(
        "highest_qualification",
        form.highest_qualification
      );
      data.append(
        "additional_qualification",
        form.additional_qualification
      );
      data.append("specialization", form.specialization);

      /*
       * Employment
       */
      data.append("employment_status", form.employment_status);

      /*
       * Additional information
       */
      data.append(
        "physically_challenged",
        String(form.physically_challenged)
      );

      data.append(
        "youth_org_member",
        String(form.youth_org_member)
      );

      data.append("organization_name", form.organization_name);
      data.append("position", form.position);
      data.append("expectation", form.expectation);

      /*
       * Passport
       */
      data.append("passport", passport);

      const res = await registerVolunteer(data);

      setResult(res);

      // Scroll to top so success screen is immediately visible.
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Registration failed:", error);

      /*
       * Try to extract a useful backend error.
       */
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Refresh locations
   * ---------------------------------------------------------
   */
  const handleRefreshLocations = async () => {
    setSelectedLga("");
    setSelectedWard("");
    setSelectedPollingUnit("");

    setWards([]);
    setPollingUnits([]);
    setSelectedPollingUnitData(null);

    await loadLGAs();
  };

  /*
   * ---------------------------------------------------------
   * Success View
   * ---------------------------------------------------------
   */
  if (result) {
    const membershipCardUrl = result?.id_card
      ? `https://ex-igp-adamu-backend-production.up.railway.app/uploads/cards/${result.id_card
          .split("/")
          .pop()}`
      : "";

    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-50 p-4">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center border border-white/50">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="w-20 h-20 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-green-800">
            Registration Successful
          </h1>

          <p className="mt-4 text-gray-600">
            Your unique registration number:
          </p>

          <h2 className="text-2xl font-bold text-green-700 mt-2 bg-green-50 py-3 px-6 rounded-xl inline-block">
            {result.registration_no}
          </h2>

          {result?.location && (
            <div className="mt-6 bg-gray-50 rounded-xl p-5 text-left">
              <div className="flex items-center gap-2 text-green-800 font-semibold mb-3">
                <MapPin className="w-5 h-5" />
                Registration Location
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>LGA:</strong>{" "}
                  {result.location.lga_name || "-"}
                </p>

                <p>
                  <strong>Ward:</strong>{" "}
                  {result.location.ward_name || "-"}
                </p>

                <p>
                  <strong>Polling Unit:</strong>{" "}
                  {result.location.pu_name || "-"}
                </p>

                {result.location.pu_code && (
                  <p>
                    <strong>PU Code:</strong>{" "}
                    {result.location.pu_code}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {membershipCardUrl && (
              <>
                <a
                  href={membershipCardUrl}
                  download
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download Membership Card
                </a>

                <button
                  type="button"
                  onClick={() =>
                    window.open(membershipCardUrl, "_blank")
                  }
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg"
                >
                  <Printer className="w-5 h-5" />
                  Print Card
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Classes
   * ---------------------------------------------------------
   */
  const inputClasses =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition placeholder:text-gray-400 text-gray-700";

  const labelClasses =
    "block text-sm font-medium text-gray-700 mb-1.5";

  const sectionHeaderClasses =
    "text-xl font-bold text-green-900 border-b-2 border-green-200 pb-2 mb-6 flex items-center gap-2";

  const selectedIsFull =
    selectedPollingUnitData &&
    String(selectedPollingUnitData.status).toUpperCase() === "FULL";

  /*
   * ---------------------------------------------------------
   * Form View
   * ---------------------------------------------------------
   */
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed py-10"
      style={{
        backgroundImage: "url('/ex-igp-bg.jpg')",
      }}
    >
      {/* Dark overlay */}
      <div className="bg-black/60 min-h-screen backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Main card */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/30">
            {/* Header */}
            <div className="bg-linear-to-r from-green-900 via-green-700 to-green-900 text-white text-center p-10 relative">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-20 mx-auto mb-4 drop-shadow-md"
              />

              <h1 className="text-4xl font-black tracking-tight">
                EX-IGP ADAMU
              </h1>

              <h2 className="text-yellow-400 text-2xl font-bold mt-2">
                YOUTH VOLUNTEERS
              </h2>

              <p className="mt-3 text-white/80 text-lg">
                Volunteer Registration Portal
              </p>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleSubmit}
              className="p-8 md:p-10 space-y-10"
            >
              {/* =====================================================
                  PERSONAL INFORMATION
              ====================================================== */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>👤</span> Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>
                      Full Name
                    </label>

                    <input
                      name="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>
                      Phone Number
                    </label>

                    <input
                      name="phone"
                      placeholder="Enter phone number"
                      value={form.phone}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>
                      Gender
                    </label>

                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    >
                      <option value="" disabled>
                        Select gender
                      </option>

                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClasses}>
                      Age
                    </label>

                    <input
                      type="number"
                      name="age"
                      placeholder="Enter age"
                      value={form.age}
                      onChange={handleChange}
                      className={inputClasses}
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* =====================================================
                  LOCATION INFORMATION
              ====================================================== */}
              <section>
                <div className="flex items-center justify-between border-b-2 border-green-200 pb-2 mb-6">
                  <h2
                    className={`${sectionHeaderClasses} border-0 pb-0 mb-0`}
                  >
                    <MapPin className="w-5 h-5" />
                    Location Information
                  </h2>

                  <button
                    type="button"
                    onClick={handleRefreshLocations}
                    disabled={loadingLGAs}
                    className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 font-semibold disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        loadingLGAs ? "animate-spin" : ""
                      }`}
                    />

                    Refresh
                  </button>
                </div>

                {locationError && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {locationError}
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                  {/* LGA */}
                  <div>
                    <label className={labelClasses}>
                      Local Government Area
                    </label>

                    <select
                      value={selectedLga}
                      onChange={handleLgaChange}
                      className={inputClasses}
                      required
                      disabled={loadingLGAs}
                    >
                      <option value="">
                        {loadingLGAs
                          ? "Loading LGAs..."
                          : "Select LGA"}
                      </option>

                      {lgas.map((lga) => (
                        <option
                          key={lga.lga_code}
                          value={lga.lga_code}
                        >
                          {lga.lga_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ward */}
                  <div>
                    <label className={labelClasses}>
                      Registration Area / Ward
                    </label>

                    <select
                      value={selectedWard}
                      onChange={handleWardChange}
                      className={inputClasses}
                      required
                      disabled={!selectedLga || loadingWards}
                    >
                      <option value="">
                        {!selectedLga
                          ? "Select LGA first"
                          : loadingWards
                          ? "Loading wards..."
                          : "Select Ward"}
                      </option>

                      {wards.map((ward) => (
                        <option
                          key={ward.ward_code}
                          value={ward.ward_code}
                        >
                          {ward.ward_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Polling Unit */}
                  <div>
                    <label className={labelClasses}>
                      Polling Unit
                    </label>

                    <select
                      value={selectedPollingUnit}
                      onChange={handlePollingUnitChange}
                      className={inputClasses}
                      required
                      disabled={!selectedWard || loadingPollingUnits}
                    >
                      <option value="">
                        {!selectedWard
                          ? "Select Ward first"
                          : loadingPollingUnits
                          ? "Loading polling units..."
                          : pollingUnits.length === 0
                          ? "No polling units found"
                          : "Select Polling Unit"}
                      </option>

                      {pollingUnits.map((unit) => {
                        const isFull =
                          String(unit.status).toUpperCase() ===
                          "FULL";

                        return (
                          <option
                            key={unit.id}
                            value={unit.id}
                            disabled={isFull}
                          >
                            {unit.pu_name}
                            {unit.pu_code
                              ? ` — ${unit.pu_code}`
                              : ""}
                            {isFull ? " — FULL" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Polling Unit Capacity */}
                {selectedPollingUnitData && (
                  <div
                    className={`mt-6 rounded-2xl border p-5 ${
                      selectedIsFull
                        ? "bg-red-50 border-red-200"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Selected Polling Unit
                        </p>

                        <h3 className="text-lg font-bold text-gray-800">
                          {selectedPollingUnitData.pu_name}
                        </h3>

                        {selectedPollingUnitData.pu_code && (
                          <p className="text-sm text-gray-500 mt-1">
                            Code:{" "}
                            {selectedPollingUnitData.pu_code}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                          <p className="text-xs text-gray-500">
                            Target
                          </p>

                          <p className="text-lg font-bold text-gray-800">
                            {selectedPollingUnitData.registration_target ??
                              30}
                          </p>
                        </div>

                        <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                          <p className="text-xs text-gray-500">
                            Registered
                          </p>

                          <p className="text-lg font-bold text-gray-800">
                            {selectedPollingUnitData.registered_count ??
                              0}
                          </p>
                        </div>

                        <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                          <p className="text-xs text-gray-500">
                            Remaining
                          </p>

                          <p
                            className={`text-lg font-bold ${
                              selectedIsFull
                                ? "text-red-600"
                                : "text-green-700"
                            }`}
                          >
                            {selectedPollingUnitData.remaining ??
                              Math.max(
                                0,
                                (selectedPollingUnitData.registration_target ??
                                  30) -
                                  (selectedPollingUnitData.registered_count ??
                                    0)
                              )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          selectedIsFull
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {selectedIsFull ? "FULL" : "OPEN"}
                      </span>
                    </div>

                    {selectedIsFull && (
                      <p className="mt-3 text-sm font-medium text-red-700">
                        This polling unit has reached its registration
                        capacity. Please select another polling unit.
                      </p>
                    )}
                  </div>
                )}
              </section>

              {/* =====================================================
                  EDUCATIONAL INFORMATION
              ====================================================== */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>🎓</span> Educational Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>
                      Highest Qualification
                    </label>

                    <input
                      name="highest_qualification"
                      placeholder="e.g. B.Sc, HND, SSCE"
                      value={form.highest_qualification}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>
                      Additional Qualification
                    </label>

                    <input
                      name="additional_qualification"
                      placeholder="Optional"
                      value={form.additional_qualification}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClasses}>
                      Area of Specialization
                    </label>

                    <input
                      name="specialization"
                      placeholder="e.g. IT, Health, Education"
                      value={form.specialization}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </section>

              {/* =====================================================
                  EMPLOYMENT INFORMATION
              ====================================================== */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>💼</span> Employment Information
                </h2>

                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    "Employed",
                    "Unemployed",
                    "Self Employed",
                  ].map((status) => (
                    <label
                      key={status}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                        form.employment_status === status
                          ? "border-green-500 bg-green-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="employment_status"
                        value={status}
                        checked={
                          form.employment_status === status
                        }
                        onChange={handleChange}
                        className="accent-green-600"
                        required
                      />

                      <span className="font-medium text-gray-700">
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* =====================================================
                  ADDITIONAL INFORMATION
              ====================================================== */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>ℹ️</span> Additional Information
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Physically Challenged */}
                  <div>
                    <label className={labelClasses}>
                      Are You Physically Challenged?
                    </label>

                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={
                            form.physically_challenged === true
                          }
                          onChange={() =>
                            setForm((previous) => ({
                              ...previous,
                              physically_challenged: true,
                            }))
                          }
                          className="accent-green-600"
                        />

                        Yes
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={
                            form.physically_challenged === false
                          }
                          onChange={() =>
                            setForm((previous) => ({
                              ...previous,
                              physically_challenged: false,
                            }))
                          }
                          className="accent-green-600"
                        />

                        No
                      </label>
                    </div>
                  </div>

                  {/* Youth Organization */}
                  <div>
                    <label className={labelClasses}>
                      Are You a Member of any Youth Organization?
                    </label>

                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={
                            form.youth_org_member === true
                          }
                          onChange={() =>
                            setForm((previous) => ({
                              ...previous,
                              youth_org_member: true,
                            }))
                          }
                          className="accent-green-600"
                        />

                        Yes
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={
                            form.youth_org_member === false
                          }
                          onChange={() =>
                            setForm((previous) => ({
                              ...previous,
                              youth_org_member: false,
                            }))
                          }
                          className="accent-green-600"
                        />

                        No
                      </label>
                    </div>
                  </div>
                </div>

                {form.youth_org_member && (
                  <div className="mt-6 bg-green-50/80 border border-green-200 rounded-xl p-5">
                    <h3 className="font-semibold text-green-800 mb-4">
                      Youth Organization Details
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClasses}>
                          Organization Name
                        </label>

                        <input
                          name="organization_name"
                          placeholder="Name of organization"
                          value={form.organization_name}
                          onChange={handleChange}
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label className={labelClasses}>
                          Position Held
                        </label>

                        <input
                          name="position"
                          placeholder="e.g. Member, Secretary"
                          value={form.position}
                          onChange={handleChange}
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* =====================================================
                  EXPECTATIONS
              ====================================================== */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>💬</span> Expectations
                </h2>

                <textarea
                  name="expectation"
                  rows="4"
                  placeholder="Tell us your expectations..."
                  value={form.expectation}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </section>

              {/* =====================================================
                  PASSPORT
              ====================================================== */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>📸</span> Passport Photograph
                </h2>

                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <label className="relative cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 hover:border-green-400 rounded-xl p-6 flex flex-col items-center justify-center transition flex-1">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />

                    <span className="text-sm text-gray-500">
                      Click to upload
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handlePassport}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>

                  {preview && (
                    <img
                      src={preview}
                      alt="Passport preview"
                      className="w-32 h-32 rounded-xl object-cover border-2 border-green-200 shadow-md"
                    />
                  )}
                </div>
              </section>

              {/* =====================================================
                  FOOTER / SUBMIT
              ====================================================== */}
              <div className="border-t pt-8 space-y-6">
                <p className="text-center text-sm text-gray-500">
                  For inquiries:{" "}
                  <a
                    href="mailto:exigpadamuyouthvolunteers@gmail.com"
                    className="text-green-600 hover:underline font-semibold"
                  >
                    exigpadamuyouthvolunteers@gmail.com
                  </a>
                  <br />
                  08038830497&nbsp;&nbsp;
                  08023000799&nbsp;&nbsp;
                  08061913134
                </p>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    loadingLGAs ||
                    loadingWards ||
                    loadingPollingUnits ||
                    selectedIsFull
                  }
                  className="w-full py-4 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Registering...
                    </>
                  ) : selectedIsFull ? (
                    "Select Another Polling Unit"
                  ) : (
                    "Submit Registration"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}