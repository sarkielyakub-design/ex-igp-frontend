import {
  X,
  Phone,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  BadgeCheck,
} from "lucide-react";
export default function VolunteerModal({
  volunteer,
  onClose,
}) {
  if (!volunteer) return null;
  return (
    <div
      className="
      fixed
      inset-0
      bg-black/60
      backdrop-blur-sm
      flex
      justify-center
      items-center
      z-50
    "
    >
      <div
        className="
        bg-white
        rounded-3xl
        shadow-2xl
        w-full
        max-w-5xl
        overflow-hidden
      "
      >
        {/* Header */}
        <div
          className="
          bg-linear-to-r
          from-green-700
          to-green-600
          text-white
          p-6
          flex
          justify-between
          items-center
        "
        >
          <div>
            <h2 className="text-2xl font-bold">
              Volunteer Profile
            </h2>
            <p className="opacity-90">
              Registration Details
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>
        {/* Body */}
        <div className="grid md:grid-cols-3">
          {/* Left Side */}
          <div
            className="
            bg-slate-50
            p-8
            border-r
          "
          >
            <div className="flex flex-col items-center">
              <img
                src={`http://127.0.0.1:8000/${volunteer.passport}`}
                alt={volunteer.name}
                className="
                w-40
                h-40
                rounded-full
                object-cover
                border-4
                border-green-600
                shadow-lg
              "
              />
              <h3 className="mt-4 text-xl font-bold text-center">
                {volunteer.name}
              </h3>
              <p className="text-slate-500">
                Volunteer
              </p>
              <div
                className="
                mt-4
                bg-green-100
                text-green-700
                px-4
                py-2
                rounded-full
                font-semibold
              "
              >
                ACTIVE
              </div>
            </div>
          </div>
          {/* Right Side */}
          <div className="md:col-span-2 p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck
                    size={18}
                    className="text-green-600"
                  />
                  <span className="font-semibold">
                    Registration No
                  </span>
                </div>
                <p>
                  {volunteer.registration_no}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Phone
                    size={18}
                    className="text-green-600"
                  />
                  <span className="font-semibold">
                    Phone
                  </span>
                </div>
                <p>{volunteer.phone}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <User
                    size={18}
                    className="text-green-600"
                  />
                  <span className="font-semibold">
                    Gender
                  </span>
                </div>
                <p>{volunteer.gender}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <User
                    size={18}
                    className="text-green-600"
                  />
                  <span className="font-semibold">
                    Age
                  </span>
                </div>
                <p>{volunteer.age}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin
                    size={18}
                    className="text-green-600"
                  />
                  <span className="font-semibold">
                    LGA
                  </span>
                </div>
                <p>{volunteer.lga}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin
                    size={18}
                    className="text-green-600"
                  />
                  <span className="font-semibold">
                    Ward
                  </span>
                </div>
                <p>{volunteer.ward}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin
                    size={18}
                    className="text-green-600"
                  />
                  <span className="font-semibold">
                    Unit
                  </span>
                </div>
                <p>{volunteer.unit}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase
                    size={18}
                    className="text-green-600"
                  />
                  <span className="font-semibold">
                    Employment
                  </span>
                </div>
                <p>
                  {volunteer.employment_status}
                </p>
              </div>
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap
                    size={18}
                    className="text-green-600"
                  />
                  <span className="font-semibold">
                    Qualification
                  </span>
                </div>
                <p>
                  {volunteer.highest_qualification}
                </p>
              </div>
            </div>
            {/* Footer Buttons */}
            <div className="mt-8 flex gap-4">
              <a
                href={`http://127.0.0.1:8000/api/volunteers/id-card/${volunteer.registration_no}`}
                target="_blank"
                rel="noreferrer"
                className="
                bg-green-600
                hover:bg-green-700
                text-white
                px-6
                py-3
                rounded-xl
                font-medium
              "
              >
                Download ID Card
              </a>
              <button
                onClick={onClose}
                className="
                bg-slate-200
                hover:bg-slate-300
                px-6
                py-3
                rounded-xl
                font-medium
              "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}