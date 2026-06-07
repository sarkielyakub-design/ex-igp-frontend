import { useState } from "react";
import { Loader2, Upload, CheckCircle, Download, Printer } from "lucide-react";
import { registerVolunteer } from "../services/volunteerapi";

export default function RegisterVolunteer() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    age: "",
    lga: "",
    ward: "",
    unit: "",
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

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handlePassport = (e) => {
    const file = e.target.files[0];
    setPassport(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => data.append(key, form[key]));
      data.append("passport", passport);
      const res = await registerVolunteer(data);
      setResult(res);
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Success View ---
  if (result) {
    const membershipCardUrl = `http://localhost:8000/uploads/cards/${result.id_card.split("/").pop()}`;

    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-50 p-4">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center border border-white/50">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="w-20 h-20 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800">Registration Successful</h1>
          <p className="mt-4 text-gray-600">Your unique registration number:</p>
          <h2 className="text-2xl font-bold text-green-700 mt-2 bg-green-50 py-3 px-6 rounded-xl inline-block">
            {result.registration_no}
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={membershipCardUrl}
              download
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg"
            >
              <Download className="w-5 h-5" /> Download Membership Card
            </a>
            <button
              onClick={() => window.open(membershipCardUrl, "_blank")}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg"
            >
              <Printer className="w-5 h-5" /> Print Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Form View ---
  const inputClasses =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition placeholder:text-gray-400 text-gray-700";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";
  const sectionHeaderClasses =
    "text-xl font-bold text-green-900 border-b-2 border-green-200 pb-2 mb-6 flex items-center gap-2";

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed py-10"
      style={{ backgroundImage: "url('/ex-igp-bg.jpg')" }}
    >
      {/* Dark overlay */}
      <div className="bg-black/60 min-h-screen backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Main card */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/30">
            {/* Header */}
            <div className="bg-linear-to-r from-green-900 via-green-700 to-green-900 text-white text-center p-10 relative">
              <img src="/logo.png" alt="Logo" className="h-20 mx-auto mb-4 drop-shadow-md" />
              <h1 className="text-4xl font-black tracking-tight">EX-IGP ADAMU</h1>
              <h2 className="text-yellow-400 text-2xl font-bold mt-2">YOUTH VOLUNTEERS</h2>
              <p className="mt-3 text-white/80 text-lg">Volunteer Registration Portal</p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
              {/* Personal Information */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>👤</span> Personal Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Full Name</label>
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
                    <label className={labelClasses}>Phone Number</label>
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
                    <label className={labelClasses}>Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    >
                      <option value="" disabled>Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Age</label>
                    <input
                      type="number"
                      name="age"
                      placeholder="Enter age"
                      value={form.age}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Location Information */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>📍</span> Location Information
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClasses}>LGA</label>
                    <input
                      name="lga"
                      placeholder="Local Government Area"
                      value={form.lga}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Ward</label>
                    <input
                      name="ward"
                      placeholder="Ward"
                      value={form.ward}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Unit</label>
                    <input
                      name="unit"
                      placeholder="Unit"
                      value={form.unit}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Educational Information */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>🎓</span> Educational Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Highest Qualification</label>
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
                    <label className={labelClasses}>Additional Qualification</label>
                    <input
                      name="additional_qualification"
                      placeholder="Optional"
                      value={form.additional_qualification}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Area of Specialization</label>
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

              {/* Employment Information */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>💼</span> Employment Information
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {["Employed", "Unemployed", "Self Employed"].map((status) => (
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
                        checked={form.employment_status === status}
                        onChange={handleChange}
                        className="accent-green-600"
                      />
                      <span className="font-medium text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Additional Information */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>ℹ️</span> Additional Information
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className={labelClasses}>Physically Challenged?</label>
                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={form.physically_challenged === true}
                          onChange={() => setForm({ ...form, physically_challenged: true })}
                          className="accent-green-600"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={form.physically_challenged === false}
                          onChange={() => setForm({ ...form, physically_challenged: false })}
                          className="accent-green-600"
                        />
                        No
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}>Youth Organization Member?</label>
                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={form.youth_org_member === true}
                          onChange={() => setForm({ ...form, youth_org_member: true })}
                          className="accent-green-600"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={form.youth_org_member === false}
                          onChange={() => setForm({ ...form, youth_org_member: false })}
                          className="accent-green-600"
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                {form.youth_org_member && (
                  <div className="mt-6 bg-green-50/80 border border-green-200 rounded-xl p-5">
                    <h3 className="font-semibold text-green-800 mb-4">Youth Organization Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClasses}>Organization Name</label>
                        <input
                          name="organization_name"
                          placeholder="Name of organization"
                          value={form.organization_name}
                          onChange={handleChange}
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className={labelClasses}>Position Held</label>
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

              {/* Expectations */}
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

              {/* Passport Upload */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <span>📸</span> Passport Photograph
                </h2>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <label className="relative cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 hover:border-green-400 rounded-xl p-6 flex flex-col items-center justify-center transition flex-1">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload</span>
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

              {/* Footer & Submit */}
              <div className="border-t pt-8 space-y-6">
                <p className="text-center text-sm text-gray-500">
                  For inquiries:{" "}
                  <a
                    href="mailto:exigpadamuyouthvolunteers@gmail.com"
                    className="text-green-600 hover:underline font-semibold"
                  >
                    exigpadamuyouthvolunteers@gmail.com
                  </a>
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Registering...
                    </>
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