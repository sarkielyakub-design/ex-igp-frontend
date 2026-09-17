import { useEffect, useState } from "react";
import api from "../services/Api";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    age: "",
    lga_code: "",
    ward_code: "",
    polling_unit_id: "",
    highest_qualification: "",
    employment_status: "",
  });

  const [passport, setPassport] = useState(null);

  const [lgas, setLgas] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingUnits, setPollingUnits] = useState([]);

  const [loadingLGAs, setLoadingLGAs] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingPollingUnits, setLoadingPollingUnits] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [selectedPollingUnit, setSelectedPollingUnit] =
    useState(null);

  /*
   * ============================================================
   * LOAD LGAs
   * ============================================================
   */

  useEffect(() => {
    loadLGAs();
  }, []);

  const loadLGAs = async () => {
    try {
      setLoadingLGAs(true);

      const res = await api.get(
        "/api/polling-units/lgas"
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setLgas(data);
    } catch (error) {
      console.error(
        "Failed to load LGAs:",
        error?.response?.data || error
      );

      setLgas([]);
    } finally {
      setLoadingLGAs(false);
    }
  };

  /*
   * ============================================================
   * LOAD WARDS
   * ============================================================
   */

  const loadWards = async (lgaCode) => {
    if (!lgaCode) {
      setWards([]);
      return;
    }

    try {
      setLoadingWards(true);

      const res = await api.get(
        "/api/polling-units/wards",
        {
          params: {
            lga_code: lgaCode,
          },
        }
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setWards(data);
    } catch (error) {
      console.error(
        "Failed to load wards:",
        error?.response?.data || error
      );

      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  /*
   * ============================================================
   * LOAD POLLING UNITS
   * ============================================================
   */

  const loadPollingUnits = async (
    lgaCode,
    wardCode
  ) => {
    if (!lgaCode || !wardCode) {
      setPollingUnits([]);
      return;
    }

    try {
      setLoadingPollingUnits(true);

      const res = await api.get(
        "/api/polling-units",
        {
          params: {
            lga_code: lgaCode,
            ward_code: wardCode,
          },
        }
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setPollingUnits(data);
    } catch (error) {
      console.error(
        "Failed to load polling units:",
        error?.response?.data || error
      );

      setPollingUnits([]);
    } finally {
      setLoadingPollingUnits(false);
    }
  };

  /*
   * ============================================================
   * GENERAL INPUT HANDLER
   * ============================================================
   */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * ============================================================
   * LGA CHANGE
   * ============================================================
   */

  const handleLGAChange = async (e) => {
    const lgaCode = e.target.value;

    setFormData((prev) => ({
      ...prev,
      lga_code: lgaCode,
      ward_code: "",
      polling_unit_id: "",
    }));

    setWards([]);
    setPollingUnits([]);
    setSelectedPollingUnit(null);

    if (lgaCode) {
      await loadWards(lgaCode);
    }
  };

  /*
   * ============================================================
   * WARD CHANGE
   * ============================================================
   */

  const handleWardChange = async (e) => {
    const wardCode = e.target.value;

    setFormData((prev) => ({
      ...prev,
      ward_code: wardCode,
      polling_unit_id: "",
    }));

    setPollingUnits([]);
    setSelectedPollingUnit(null);

    if (
      formData.lga_code &&
      wardCode
    ) {
      await loadPollingUnits(
        formData.lga_code,
        wardCode
      );
    }
  };

  /*
   * ============================================================
   * POLLING UNIT CHANGE
   * ============================================================
   */

  const handlePollingUnitChange = (e) => {
    const pollingUnitId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      polling_unit_id: pollingUnitId,
    }));

    const selected = pollingUnits.find(
      (pu) =>
        String(pu.id) ===
        String(pollingUnitId)
    );

    setSelectedPollingUnit(
      selected || null
    );
  };

  /*
   * ============================================================
   * SUBMIT REGISTRATION
   * ============================================================
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!formData.gender) {
      alert("Please select your gender.");
      return;
    }

    if (!formData.age) {
      alert("Please enter your age.");
      return;
    }

    if (!formData.lga_code) {
      alert("Please select your LGA.");
      return;
    }

    if (!formData.ward_code) {
      alert("Please select your Registration Area / Ward.");
      return;
    }

    if (!formData.polling_unit_id) {
      alert("Please select your polling unit.");
      return;
    }

    if (!passport) {
      alert("Please upload your passport photograph.");
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();

      /*
       * Personal information
       */

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "phone",
        formData.phone.trim()
      );

      data.append(
        "gender",
        formData.gender
      );

      data.append(
        "age",
        formData.age
      );

      /*
       * IMPORTANT:
       *
       * The backend should use polling_unit_id
       * to determine the actual:
       *
       * LGA
       * Ward
       * Polling Unit
       *
       * We do not submit arbitrary location text.
       */

      data.append(
        "polling_unit_id",
        formData.polling_unit_id
      );

      /*
       * Other registration information
       */

      data.append(
        "highest_qualification",
        formData.highest_qualification
      );

      data.append(
        "employment_status",
        formData.employment_status
      );

      /*
       * Passport
       */

      data.append(
        "passport",
        passport
      );

      const res = await api.post(
        "/api/volunteers/register",
        data
      );

      /*
       * Success
       */

      const registrationNo =
        res.data?.registration_no ||
        res.data?.data?.registration_no ||
        "";

      alert(
        `Registration Successful\n${
          registrationNo ||
          "Registration completed successfully."
        }`
      );

      /*
       * Reset form
       */

      setFormData({
        name: "",
        phone: "",
        gender: "",
        age: "",
        lga_code: "",
        ward_code: "",
        polling_unit_id: "",
        highest_qualification: "",
        employment_status: "",
      });

      setPassport(null);
      setWards([]);
      setPollingUnits([]);
      setSelectedPollingUnit(null);

      /*
       * Reset file input
       */

      const fileInput =
        document.getElementById(
          "passport"
        );

      if (fileInput) {
        fileInput.value = "";
      }

    } catch (err) {
      console.error(
        "Registration error:",
        err?.response?.data || err
      );

      const detail =
        err?.response?.data?.detail;

      if (
        err?.response?.status === 409
      ) {
        alert(
          detail ||
            "This polling unit is already full. Please select another polling unit."
        );
      } else if (
        err?.response?.status === 400
      ) {
        alert(
          detail ||
            "Please check your registration information."
        );
      } else {
        alert(
          detail ||
            "Registration failed. Please try again."
        );
      }

    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ============================================================
   * SELECTED POLLING UNIT STATUS
   * ============================================================
   */

  const pollingUnitIsFull =
    selectedPollingUnit &&
    (
      String(
        selectedPollingUnit.status
      ).toUpperCase() === "FULL" ||
      Number(
        selectedPollingUnit.registered_count
      ) >=
        Number(
          selectedPollingUnit.registration_target
        )
    );

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">

      <div className="max-w-3xl mx-auto">

        {/* Header */}

        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

          <h1 className="text-3xl font-bold text-gray-900">
            Ex-IGP Volunteer Registration
          </h1>

          <p className="text-gray-500 mt-2">
            Complete the registration form and select
            your official LGA, Registration Area / Ward
            and Polling Unit.
          </p>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border p-6 space-y-6"
        >

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <div>

            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Personal Information
            </h2>

            <div className="space-y-4">

              {/* Name */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  placeholder="Enter your full name"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Phone */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  placeholder="Enter your phone number"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Gender + Age */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select Gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>

                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    min="1"
                    max="120"
                    placeholder="Age"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              LOCATION
          ================================================== */}

          <div className="border-t pt-6">

            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Registration Location
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              Select your location from the official
              polling-unit database.
            </p>

            <div className="space-y-4">

              {/* LGA */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local Government Area
                </label>

                <select
                  name="lga_code"
                  value={formData.lga_code}
                  onChange={handleLGAChange}
                  disabled={loadingLGAs}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                  required
                >

                  <option value="">
                    {loadingLGAs
                      ? "Loading LGAs..."
                      : "Select LGA"}
                  </option>

                  {lgas.map((lga) => (

                    <option
                      key={
                        lga.lga_code ||
                        lga.code
                      }
                      value={
                        lga.lga_code ||
                        lga.code
                      }
                    >
                      {lga.lga_name ||
                        lga.name}
                    </option>

                  ))}

                </select>

              </div>

              {/* Ward */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Area / Ward
                </label>

                <select
                  name="ward_code"
                  value={formData.ward_code}
                  onChange={handleWardChange}
                  disabled={
                    !formData.lga_code ||
                    loadingWards
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                  required
                >

                  <option value="">
                    {!formData.lga_code
                      ? "Select LGA first"
                      : loadingWards
                      ? "Loading wards..."
                      : "Select Registration Area / Ward"}
                  </option>

                  {wards.map((ward) => (

                    <option
                      key={
                        ward.ward_code ||
                        ward.code
                      }
                      value={
                        ward.ward_code ||
                        ward.code
                      }
                    >
                      {ward.ward_name ||
                        ward.name}
                    </option>

                  ))}

                </select>

              </div>

              {/* Polling Unit */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Polling Unit
                </label>

                <select
                  name="polling_unit_id"
                  value={
                    formData.polling_unit_id
                  }
                  onChange={
                    handlePollingUnitChange
                  }
                  disabled={
                    !formData.ward_code ||
                    loadingPollingUnits
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                  required
                >

                  <option value="">
                    {!formData.ward_code
                      ? "Select Ward first"
                      : loadingPollingUnits
                      ? "Loading polling units..."
                      : "Select Polling Unit"}
                  </option>

                  {pollingUnits.map(
                    (pu) => {

                      const registered =
                        Number(
                          pu.registered_count
                        ) || 0;

                      const target =
                        Number(
                          pu.registration_target
                        ) || 0;

                      const full =
                        String(
                          pu.status || ""
                        ).toUpperCase() ===
                          "FULL" ||
                        (
                          target > 0 &&
                          registered >=
                            target
                        );

                      return (
                        <option
                          key={pu.id}
                          value={pu.id}
                          disabled={full}
                        >
                          {pu.pu_code
                            ? `${pu.pu_code} - `
                            : ""}
                          {pu.pu_name}
                          {full
                            ? " - FULL"
                            : ` - ${Math.max(
                                target -
                                  registered,
                                0
                              )} slots available`}
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

              {/* Selected PU Information */}

              {selectedPollingUnit && (

                <div
                  className={`rounded-xl p-4 border ${
                    pollingUnitIsFull
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >

                  <div className="flex justify-between items-start gap-4">

                    <div>

                      <p className="font-bold text-gray-800">
                        {selectedPollingUnit.pu_name}
                      </p>

                      {selectedPollingUnit.pu_code && (

                        <p className="text-sm text-gray-500 mt-1">
                          Code:{" "}
                          {
                            selectedPollingUnit.pu_code
                          }
                        </p>

                      )}

                      {selectedPollingUnit.pu_location && (

                        <p className="text-sm text-gray-500 mt-1">
                          Location:{" "}
                          {
                            selectedPollingUnit.pu_location
                          }
                        </p>

                      )}

                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        pollingUnitIsFull
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {pollingUnitIsFull
                        ? "FULL"
                        : "OPEN"}
                    </span>

                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">

                    <div>

                      <p className="text-xs text-gray-500">
                        Target
                      </p>

                      <p className="font-bold text-gray-800">
                        {
                          selectedPollingUnit.registration_target ??
                            30
                        }
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Registered
                      </p>

                      <p className="font-bold text-gray-800">
                        {
                          selectedPollingUnit.registered_count ??
                            0
                        }
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Remaining
                      </p>

                      <p className="font-bold text-green-700">
                        {Math.max(
                          (
                            Number(
                              selectedPollingUnit.registration_target
                            ) || 0
                          ) -
                            (
                              Number(
                                selectedPollingUnit.registered_count
                              ) || 0
                            ),
                          0
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* ==================================================
              QUALIFICATION / EMPLOYMENT
          ================================================== */}

          <div className="border-t pt-6">

            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Additional Information
            </h2>

            <div className="space-y-4">

              {/* Qualification */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highest Qualification
                </label>

                <select
                  name="highest_qualification"
                  value={
                    formData.highest_qualification
                  }
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                >

                  <option value="">
                    Select Qualification
                  </option>

                  <option value="Primary">
                    Primary
                  </option>

                  <option value="Secondary">
                    Secondary
                  </option>

                  <option value="OND">
                    OND
                  </option>

                  <option value="NCE">
                    NCE
                  </option>

                  <option value="HND">
                    HND
                  </option>

                  <option value="Bachelor">
                    Bachelor's Degree
                  </option>

                  <option value="Master">
                    Master's Degree
                  </option>

                  <option value="PhD">
                    PhD
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* Employment */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Status
                </label>

                <select
                  name="employment_status"
                  value={
                    formData.employment_status
                  }
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                >

                  <option value="">
                    Select Employment Status
                  </option>

                  <option value="Employed">
                    Employed
                  </option>

                  <option value="Self Employed">
                    Self Employed
                  </option>

                  <option value="Unemployed">
                    Unemployed
                  </option>

                  <option value="Student">
                    Student
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* ==================================================
              PASSPORT
          ================================================== */}

          <div className="border-t pt-6">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passport Photograph
            </label>

            <input
              id="passport"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="w-full border border-gray-300 rounded-lg p-3 bg-white"
              onChange={(e) =>
                setPassport(
                  e.target.files?.[0] ||
                    null
                )
              }
              required
            />

            {passport && (

              <p className="text-sm text-green-700 mt-2">
                Selected: {passport.name}
              </p>

            )}

          </div>

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <div className="border-t pt-6">

            <button
              type="submit"
              disabled={
                submitting ||
                pollingUnitIsFull
              }
              className="w-full bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >

              {submitting
                ? "Registering..."
                : pollingUnitIsFull
                ? "Polling Unit Full"
                : "Register"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}