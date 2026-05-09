import GrievanceCard from './GrievanceCard';
import ResolutionTimeline from './ResolutionTimeline';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import GrievanceDetails from './GrievanceDetail';
const API = import.meta.env.VITE_API_URL;

const GrievancesDashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('all');

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/api/admin-dashboard/grievances`);
      console.log("Fetched grievances:", res.data);
      setGrievances(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching grievances:', err);
      setError('Failed to load grievances. Please try again.');
      setGrievances([]);
    } finally {
      setLoading(false);
    }
  }, [API]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/admin-dashboard/stats`);
      setStats(res.data || { total: 0, pending: 0, inProgress: 0, resolved: 0 });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [API]);

  useEffect(() => {
    fetchGrievances();
    fetchStats();
  }, [fetchGrievances, fetchStats]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await axios.put(`${API}/api/admin-dashboard/grievances/${id}/status`, { status: newStatus });
      
      setGrievances(prev =>
        prev.map(g => (g._id === id ? { ...g, status: newStatus } : g))
      );
      
      await fetchStats();
      
      if (selectedGrievance && selectedGrievance._id === id) {
        setSelectedGrievance(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCardClick = (grievance) => {
    setSelectedGrievance(grievance);
  };

  const handleCloseDetails = () => {
    setSelectedGrievance(null);
  };

  const handleRetry = () => {
    fetchGrievances();
    fetchStats();
  };

  const filteredGrievances = selectedPriority === 'all' 
    ? grievances 
    : grievances.filter(grievance => grievance.priority?.toLowerCase() === selectedPriority.toLowerCase());

  const getPriorityCount = (priority) => {
    if (priority === 'all') return grievances.length;
    return grievances.filter(g => g.priority?.toLowerCase() === priority.toLowerCase()).length;
  };

  const statCards = [
    { 
      label: 'Total Grievances', 
      value: stats.total, 
      icon: '📊',
      gradient: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-900'
    },
    { 
      label: 'Pending', 
      value: stats.pending, 
      icon: '⏳',
      gradient: 'from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700'
    },
    { 
      label: 'In Progress', 
      value: stats.inProgress, 
      icon: '🔄',
      gradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    },
    { 
      label: 'Resolved', 
      value: stats.resolved, 
      icon: '✅',
      gradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    }
  ];

  const priorityButtons = [
    { label: 'All', value: 'all', icon: '🎯', color: 'gray', bgGradient: 'from-gray-600 to-gray-700' },
    { label: 'Critical', value: 'critical', icon: '🔴', color: 'red', bgGradient: 'from-red-600 to-red-700' },
    { label: 'High', value: 'high', icon: '🟠', color: 'orange', bgGradient: 'from-orange-600 to-orange-700' },
    { label: 'Medium', value: 'medium', icon: '🟡', color: 'yellow', bgGradient: 'from-yellow-600 to-yellow-700' },
    { label: 'Low', value: 'low', icon: '🔵', color: 'blue', bgGradient: 'from-blue-600 to-blue-700' }
  ];

  const getPriorityButtonClass = (priorityValue) => {
    const baseClass = "relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform ";
    if (selectedPriority === priorityValue) {
      const button = priorityButtons.find(b => b.value === priorityValue);
      return baseClass + `${button.bgGradient}  shadow-lg scale-105`;
    } else {
      switch(priorityValue) {
        case 'critical':
          return baseClass + "bg-red-50 text-red-700 hover:bg-red-100 hover:scale-105 border-2 border-red-200";
        case 'high':
          return baseClass + "bg-orange-50 text-orange-700 hover:bg-orange-100 hover:scale-105 border-2 border-orange-200";
        case 'medium':
          return baseClass + "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:scale-105 border-2 border-yellow-200";
        case 'low':
          return baseClass + "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105 border-2 border-blue-200";
        default:
          return baseClass + "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105 border-2 border-gray-200";
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row p-6 gap-8 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 min-h-screen">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Grievances Dashboard
              </h1>
              <p className="text-gray-500 mt-2">Manage and track all grievances in one place</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-md animate-shake">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid with Improved Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.gradient} border ${stat.borderColor} rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer group`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{stat.icon}</span>
                <div className="w-10 h-10 rounded-full bg-white/50 group-hover:bg-white/80 transition-colors"></div>
              </div>
              <p className={`text-sm font-medium uppercase tracking-wide opacity-70`}>
                {stat.label}
              </p>
              <p className={`text-4xl font-bold ${stat.textColor} mt-2`}>
                {stat.value}
              </p>
              <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${stat.textColor.replace('text-', 'from-').replace('700', '500')} to-${stat.textColor.replace('text-', '')} w-0 group-hover:w-full transition-all duration-500`} 
                     style={{ width: `${(stat.value / stats.total) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Priority Filter Section with Enhanced Design */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Filter by Priority</h2>
              <p className="text-sm text-gray-500 mt-1">Select a priority level to filter grievances</p>
            </div>
            {selectedPriority !== 'all' && (
              <div className="text-sm text-gray-500">
                Showing {filteredGrievances.length} of {getPriorityCount(selectedPriority)} {selectedPriority} grievances
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {priorityButtons.map((button) => (
              <button
                key={button.value}
                onClick={() => setSelectedPriority(button.value)}
                 className={getPriorityButtonClass(button.value)}
              >
                <span className="flex items-center gap-2">
                  <span>{button.icon}</span>
                  <span>{button.label}</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    selectedPriority === button.value 
                      ? 'bg-white/20' 
                      : `bg-${button.color}-100 text-${button.color}-700`
                  }`}>
                    {getPriorityCount(button.value)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State with Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl p-6 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-10 w-24 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State with Animation */}
        {!loading && filteredGrievances.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
            <div className="animate-bounce">
              <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">No grievances found</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              {selectedPriority === 'all' 
                ? 'There are no grievances to display at this time.' 
                : `No ${selectedPriority} priority grievances found. Try selecting a different priority level.`}
            </p>
            {selectedPriority !== 'all' && (
              <button
                onClick={() => setSelectedPriority('all')}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
              >
                View All Grievances
              </button>
            )}
          </div>
        )}

        {/* Grievances Cards with Staggered Animation */}
        {!loading && filteredGrievances.length > 0 && (
          <div className="space-y-4">
            {filteredGrievances.map((grievance, index) => (
              <div
                key={grievance._id}
                onClick={() => handleCardClick(grievance)}
                className="cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GrievanceCard
                  data={grievance}
                  onStatusChange={handleStatusChange}
                  isUpdating={updatingId === grievance._id}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Details Panel with Glass Effect */}
      {selectedGrievance && (
        <div className="lg:w-96 w-full animate-slideInRight">
          <GrievanceDetails
            grievance={selectedGrievance}
            onClose={handleCloseDetails}
            onStatusChange={handleStatusChange}
            isUpdating={updatingId === selectedGrievance._id}
          />
        </div>
      )}

      {/* Add custom CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default GrievancesDashboard;