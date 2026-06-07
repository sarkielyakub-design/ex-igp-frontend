import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Venus,
  Mars
} from "lucide-react";
export default function StatsCard({
  title,
  value
}) {
  const getIcon = () => {
    switch (title) {
      case "Total Volunteers":
        return <Users size={28} />;
      case "Male":
        return <Mars size={28} />;
      case "Female":
        return <Venus size={28} />;
      case "Employed":
        return <Briefcase size={28} />;
      case "Unemployed":
        return <UserX size={28} />;
      case "Youth Members":
        return <UserCheck size={28} />;
      default:
        return <Users size={28} />;
    }
  };
  return (
    <div
      className="
      relative
      overflow-hidden
      rounded-2xl
      p-6
      text-white
      shadow-lg
      bg-linear-to-r
      from-[#0B3D2E]
      to-[#14532D]
      hover:scale-105
      transition-all
      duration-300
      "
    >
      {/* Background Circle */}
      <div
        className="
        absolute
        -right-6
        -top-6
        w-28
        h-28
        bg-white/10
        rounded-full
        "
      />
      <div className="relative z-10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/80 text-sm font-medium">
              {title}
            </p>
            <h2 className="text-4xl font-bold mt-2">
              {value}
            </h2>
          </div>
          <div
            className="
            w-14
            h-14
            rounded-xl
            bg-white/20
            flex
            items-center
            justify-center
            "
          >
            {getIcon()}
          </div>
        </div>
      </div>
    </div>
  );
}