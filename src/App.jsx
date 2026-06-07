import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Profile from "./pages/profile";
import Exports from "./pages/Exports";
import Login from "./pages/Login";
import RegisterVolunteer from "./pages/RegisterVolunteer";
import Dashboard from "./pages/Dashboard";
import Volunteers from "./pages/Volunteers";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Admin Login */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* Public Volunteer Registration */}
        <Route
          path="/register"
          element={<RegisterVolunteer />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Volunteers List */}
        <Route
          path="/volunteers"
          element={
            <ProtectedRoute>
              <Volunteers />
            </ProtectedRoute>
          }
        />

        {/* Data Exports */}
        <Route
          path="/exports"
          element={
            <ProtectedRoute>
              <Exports />
            </ProtectedRoute>
          }
        />
        

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;