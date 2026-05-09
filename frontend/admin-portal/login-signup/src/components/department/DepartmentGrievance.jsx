import GrievanceCard from '../GrievanceCard';
import ResolutionTimeline from '../ResolutionTimeline';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import GrievanceDetails from '../GrievanceDetail'; 

const API = import.meta.env.VITE_API_URL;

// Department mapping rules
const departmentMapping = {
  // Health department handles: water supply, agriculture, health
  'water supply': 'health',
  'water': 'health',
  'agriculture': 'health',
  'health': 'health',
  
  // Transport department handles: transport, road and transport, road
  'transport': 'transport',
  'road and transport': 'transport',
  'road': 'transport',
  
  // General department handles: sanitation, electricity, and everything else
  'sanitation': 'general',
  'electricity': 'general'
};

// Function to determine which department should handle this grievance
const getAssignedDepartment = (grievanceDepartment) => {
  const deptLower = grievanceDepartment?.toLowerCase().trim() || '';
  
  // Direct mapping check
  if (departmentMapping[deptLower]) {
    return departmentMapping[deptLower];
  }
  
  // Check for partial matches (for cases like "road and transport")
  for (const [originalDept, mappedDept] of Object.entries(departmentMapping)) {
    if (deptLower.includes(originalDept)) {
      return mappedDept;
    }
  }
  
  // Default: send to general department if no mapping found
  return 'general';
};

const GrievancesDashboard = ({ userRole, userDepartment }) => {
  const [grievances, setGrievances] = useState([]);
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get effective role and department from props or localStorage
  const getEffectiveRole = useCallback(() => {
    if (userRole) return userRole;
    
    // Try to get from user object
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role || "department_officer";
      } catch (err) {
        console.error("Error parsing user object:", err);
      }
    }
    
    // Fallback to direct keys
    return localStorage.getItem("userRole") || 
           localStorage.getItem("role") || 
           "department_officer";
  }, [userRole]);
  
  const getEffectiveDepartment = useCallback(() => {
    if (userDepartment) return userDepartment;
    
    // Try to get from user object
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.department || "general";
      } catch (err) {
        console.error("Error parsing user object:", err);
      }
    }
    
    // Fallback to direct keys
    return localStorage.getItem("userDepartment") || 
           localStorage.getItem("department") || 
           "general";
  }, [userDepartment]);
  
  const effectiveRole = getEffectiveRole();
  const effectiveDepartment = getEffectiveDepartment();
  
  // Filter grievances based on department officer/head
  const filterGrievancesByDepartment = useCallback((allGrievances, role, department) => {
    if (!allGrievances || !allGrievances.length) {
      setFilteredGrievances([]);
      setStats({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
      return;
    }
    
    let filtered = [];
    
    console.log(`Filtering - Role: ${role}, Department: ${department}`);
    console.log(`Total grievances available: ${allGrievances.length}`);
    
    // Check if user is department head or officer
    if (role === 'department_head' || role === 'department_officer' || role === 'head' || role === 'officer') {
      // For department heads and officers, show complaints mapped to their department
      filtered = allGrievances.filter(grievance => {
        const assignedDept = getAssignedDepartment(grievance.department);
        const isMatch = assignedDept?.toLowerCase() === department?.toLowerCase();
        
        // Debug log to see what's happening
        if (isMatch) {
          console.log(`✓ Match: "${grievance.department}" → Assigned to: ${assignedDept} | User Dept: ${department}`);
        } else {
          console.log(`✗ No Match: "${grievance.department}" → Assigned to: ${assignedDept} | User Dept: ${department}`);
        }
        
        return isMatch;
      });
      
      console.log(`Showing ${filtered.length} grievances for ${role} of ${department} department`);
    } 
    else if (role === 'admin') {
      // Admin sees all grievances
      filtered = allGrievances;
      console.log("Admin sees all grievances:", filtered.length);
    } 
    else {
      // Default: show only general department grievances
      console.log(`Unknown role "${role}", defaulting to general department`);
      filtered = allGrievances.filter(grievance => {
        const assignedDept = getAssignedDepartment(grievance.department);
        return assignedDept?.toLowerCase() === 'general';
      });
    }
    
    setFilteredGrievances(filtered);
    
    // Update stats based on filtered grievances
    const total = filtered.length;
    const pending = filtered.filter(g => g.status === 'Pending').length;
    const inProgress = filtered.filter(g => g.status === 'Processing').length;
    const resolved = filtered.filter(g => g.status === 'Resolved').length;
    
    setStats({ total, pending, inProgress, resolved });
  }, []);

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin-dashboard/grievances`);
      console.log("Fetched grievances:", res.data); 
      console.log("Current User - Role:", effectiveRole, "Department:", effectiveDepartment);
      
      setGrievances(res.data);
      
      // Filter grievances based on user's role and department
      filterGrievancesByDepartment(res.data, effectiveRole, effectiveDepartment);
    } catch (err) {
      console.error('Error fetching grievances:', err);
    } finally {
      setLoading(false);
    }
  }, [effectiveRole, effectiveDepartment, filterGrievancesByDepartment]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API}/api/admin-dashboard/grievances/${id}/status`, { status: newStatus });
      
      // Update both original and filtered grievances
      const updatedGrievances = grievances.map((g) => 
        (g._id === id ? { ...g, status: newStatus } : g)
      );
      setGrievances(updatedGrievances);
      
      // Re-filter to update the displayed list
      filterGrievancesByDepartment(updatedGrievances, effectiveRole, effectiveDepartment);
      
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grievances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row p-6 gap-6 bg-gray-100 min-h-screen">
    
      <div className="flex-1 space-y-6">
        
        {/* Department Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-700 font-semibold">
                Logged in as: <span className="uppercase">{effectiveRole?.replace('_', ' ')}</span>
              </p>
              <p className="text-sm text-blue-700">
                Department: <span className="uppercase font-bold">{effectiveDepartment}</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                You can view and manage grievances assigned to your department only
              </p>
            </div>
            <div className="text-xs text-gray-600">
              Showing {filteredGrievances.length} complaint(s)
            </div>
          </div>
        </div>

        {/* Department Responsibilities Info */}
        <div className="bg-white p-4 rounded shadow text-sm">
          <h4 className="font-semibold text-gray-700 mb-2">Your Department Responsibilities:</h4>
          {effectiveDepartment === 'health' && (
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Water Supply grievances</li>
              <li>Agriculture grievances</li>
              <li>Health-related grievances</li>
            </ul>
          )}
          {effectiveDepartment === 'transport' && (
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Transport grievances</li>
              <li>Road and Transport grievances</li>
              <li>Road-related grievances</li>
            </ul>
          )}
          {effectiveDepartment === 'general' && (
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Sanitation grievances</li>
              <li>Electricity grievances</li>
              <li>Other miscellaneous grievances</li>
            </ul>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 shadow rounded text-center">
            <h4 className="text-gray-700 font-semibold">Total (Your Dept)</h4>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-yellow-100 p-4 shadow rounded text-center">
            <h4 className="text-gray-700 font-semibold">Pending</h4>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-blue-100 p-4 shadow rounded text-center">
            <h4 className="text-gray-700 font-semibold">In Progress</h4>
            <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
          </div>
          <div className="bg-green-100 p-4 shadow rounded text-center">
            <h4 className="text-gray-700 font-semibold">Resolved</h4>
            <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
          </div>
        </div>

        {/* Grievances List */}
        {filteredGrievances.length === 0 ? (
          <div className="bg-white p-8 shadow rounded text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 mt-2">No grievances assigned to your department</p>
            <p className="text-xs text-gray-400 mt-1">
              Note: Your department ({effectiveDepartment}) handles specific types of grievances based on department rules
            </p>
          </div>
        ) : (
          filteredGrievances.map((g) => (
            <div onClick={() => setSelectedGrievance(g)} key={g._id} className="cursor-pointer transition-transform hover:scale-[1.01]">
              {/* Show original department mapping */}
              <div className="text-xs text-gray-400 mb-1 ml-2 flex justify-between">
                <span>Original Category: {g.department}</span>
                <span className="font-semibold">→ Assigned to: {getAssignedDepartment(g.department)}</span>
              </div>
              <GrievanceCard 
                data={{
                  ...g,
                  department: getAssignedDepartment(g.department) // Show assigned department
                }} 
                onStatusChange={handleStatusChange} 
              />
            </div>
          ))
        )}
      </div>
      
      {/* Grievance Details Sidebar */}
      {selectedGrievance && (
        <GrievanceDetails
          grievance={{
            ...selectedGrievance,
            assignedDepartment: getAssignedDepartment(selectedGrievance.department),
            originalDepartment: selectedGrievance.department
          }}
          onClose={() => setSelectedGrievance(null)}
        />
      )}
    </div>
  );
};

export default GrievancesDashboard;