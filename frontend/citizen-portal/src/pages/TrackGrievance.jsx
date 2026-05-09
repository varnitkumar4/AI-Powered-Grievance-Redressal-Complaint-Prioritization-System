import { useState, useEffect } from "react";

const API = "http://localhost:5000";

export default function TrackGrievance() {
  const [inputId, setInputId] = useState("");
  const [grievance, setGrievance] = useState(null);
  const [error, setError] = useState("");

  const [myGrievances, setMyGrievances] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("citizen");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        if (userData.phone) {
          fetchUserGrievances(userData.phone);
        }
      } catch (e) {
        console.error("Auth error", e);
      }
    }
  }, []);

  const fetchUserGrievances = async (mobile) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/api/grievance/user/${mobile}`);
      const data = await res.json();
      if (res.ok) {
        setMyGrievances(data.grievanceList || []);
      }
    } catch {
      console.error("Failed to fetch history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSearch = async () => {
    setError("");
    setGrievance(null);

    try {
      const response = await fetch(`${API}/api/grievance/track/${inputId}`);
      const data = await response.json();

      if (response.ok) {
        setGrievance(data);
      } else {
        setError(data.error || "Grievance not found");
      }
    } catch {
      setError("An error occurred while fetching the grievance");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 mt-10 mb-24 space-y-12">

      {/* 🔍 TRACK SECTION */}
      <div className="rounded-2xl p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-lg">
        <h2 className="text-3xl font-extrabold text-center text-gray-800">
          🔎 Track Your Grievance
        </h2>
        <p className="text-center text-gray-600 mt-2 text-sm">
          Enter your tracking ID to check the latest status
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            placeholder="GRV-XXXXXX"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow"
          >
            Track Now
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-center">
            ❌ {error}
          </div>
        )}

        {grievance && (
          <div className="mt-8 bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
              <span className="font-mono font-bold text-gray-600">
                #{grievance.trackingId}
              </span>
              <span
                className={`px-4 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                  grievance.status
                )}`}
              >
                {grievance.status}
              </span>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase">Department</p>
                <p className="font-semibold">{grievance.department}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">Submitted On</p>
                <p>{new Date(grievance.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 uppercase">Message</p>
                <p className="mt-1 bg-gray-50 border rounded-lg p-3 text-gray-700">
                  {grievance.message}
                </p>
              </div>

              {grievance.name && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Citizen Name</p>
                  <p>{grievance.name}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🧾 HISTORY SECTION */}
      {user ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-2xl font-bold">📂 My Grievance History</h3>
              <p className="text-sm text-gray-500">Mobile: +91-{user.phone}</p>
            </div>

            <button
              onClick={() => fetchUserGrievances(user.phone)}
              className="text-sm text-blue-600 hover:underline"
            >
              🔄 Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div className="text-center py-10 text-gray-500">
              ⏳ Fetching your grievances...
            </div>
          ) : myGrievances.length ? (
            <div className="space-y-4">
              {myGrievances.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold">{item.department}</p>
                    <p className="text-xs text-gray-500 font-mono">
                      {item.trackingId}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                    <button
                      onClick={() => {
                        setInputId(item.trackingId);
                        handleSearch();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 border border-dashed rounded-2xl bg-gray-50">
              <p className="text-gray-600">No grievances found yet 📝</p>
              <a href="/submit" className="text-blue-600 font-medium hover:underline">
                Submit your first grievance
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 rounded-2xl bg-blue-50 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">
            🔐 Log in to view your grievance history
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            All complaints linked to your mobile number in one place
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Login Now
          </a>
        </div>
      )}
    </div>
  );
}
