import Sidebar from "../components/SideBar";
import Navbar from "../components/NavBar";

import {
  FileSpreadsheet,
  FileText,
  Download,
  Database,
  Users,
} from "lucide-react";

export default function Exports() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar />

        <div className="p-8">

          {/* Header */}

          <div className="mb-8">

            <h1 className="text-4xl font-bold text-slate-900">
              Export Center
            </h1>

            <p className="text-slate-500 mt-2">
              Download volunteer records and reports.
            </p>

          </div>

          {/* Statistics */}

          <div className="grid md:grid-cols-3 gap-6 mb-8">

            <div className="bg-white p-6 rounded-2xl shadow">

              <div className="flex items-center gap-4">

                <Users
                  size={40}
                  className="text-green-600"
                />

                <div>

                  <p className="text-slate-500">
                    Volunteers
                  </p>

                  <h2 className="text-3xl font-bold">
                    All Records
                  </h2>

                </div>

              </div>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow">

              <div className="flex items-center gap-4">

                <Database
                  size={40}
                  className="text-blue-600"
                />

                <div>

                  <p className="text-slate-500">
                    Database
                  </p>

                  <h2 className="text-3xl font-bold">
                    Export Ready
                  </h2>

                </div>

              </div>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow">

              <div className="flex items-center gap-4">

                <Download
                  size={40}
                  className="text-orange-600"
                />

                <div>

                  <p className="text-slate-500">
                    Reports
                  </p>

                  <h2 className="text-3xl font-bold">
                    Available
                  </h2>

                </div>

              </div>

            </div>

          </div>

          {/* Export Cards */}

          <div className="grid lg:grid-cols-2 gap-8">

            {/* Excel */}

            <div className="bg-white rounded-3xl shadow p-8">

              <div className="flex items-center gap-4 mb-6">

                <FileSpreadsheet
                  size={60}
                  className="text-green-600"
                />

                <div>

                  <h2 className="text-2xl font-bold">
                    Excel Export
                  </h2>

                  <p className="text-slate-500">
                    Download all volunteers in
                    Microsoft Excel format.
                  </p>

                </div>

              </div>

              <ul className="space-y-2 text-slate-600 mb-6">

                <li>✓ Registration Number</li>
                <li>✓ Name</li>
                <li>✓ Phone Number</li>
                <li>✓ Gender</li>
                <li>✓ LGA</li>
                <li>✓ Ward</li>
                <li>✓ Qualification</li>

              </ul>

              <a
                href="http://127.0.0.1:8000/api/volunteers/export/excel"
                target="_blank"
                rel="noreferrer"
                className="
                inline-flex
                items-center
                gap-2
                bg-green-600
                hover:bg-green-700
                text-white
                px-6
                py-3
                rounded-xl
                "
              >
                <Download size={18} />
                Export Excel
              </a>

            </div>

            {/* PDF */}

            <div className="bg-white rounded-3xl shadow p-8">

              <div className="flex items-center gap-4 mb-6">

                <FileText
                  size={60}
                  className="text-red-600"
                />

                <div>

                  <h2 className="text-2xl font-bold">
                    PDF Report
                  </h2>

                  <p className="text-slate-500">
                    Download printable volunteer
                    report in PDF format.
                  </p>

                </div>

              </div>

              <ul className="space-y-2 text-slate-600 mb-6">

                <li>✓ Official Report</li>
                <li>✓ Registration Summary</li>
                <li>✓ Volunteer List</li>
                <li>✓ Print Ready</li>

              </ul>

              <a
                href="http://127.0.0.1:8000/api/volunteers/export/pdf"
                target="_blank"
                rel="noreferrer"
                className="
                inline-flex
                items-center
                gap-2
                bg-red-600
                hover:bg-red-700
                text-white
                px-6
                py-3
                rounded-xl
                "
              >
                <Download size={18} />
                Export PDF
              </a>

            </div>

          </div>

          {/* Advanced Export */}

          <div className="bg-white rounded-3xl shadow p-8 mt-8">

            <h2 className="text-2xl font-bold mb-4">
              Future Export Options
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

              <div className="border rounded-xl p-4">
                Export By LGA
              </div>

              <div className="border rounded-xl p-4">
                Export By Ward
              </div>

              <div className="border rounded-xl p-4">
                Export By Gender
              </div>

              <div className="border rounded-xl p-4">
                Export By Employment
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}