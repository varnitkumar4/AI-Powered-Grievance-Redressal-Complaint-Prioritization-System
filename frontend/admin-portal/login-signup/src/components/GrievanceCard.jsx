import GrievanceDetails from './GrievanceDetail'; 
import { useState } from 'react';

const GrievanceCard = ({ data, onStatusChange }) => {

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-700 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'text-green-600';
      case 'Rejected':
        return 'text-red-600';
      case 'Processing':
        return 'text-blue-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="bg-white p-5 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl border border-gray-100 hover:border-blue-200">
      
      {/* Top Section */}
      <div className="flex justify-between items-start gap-4 mb-4">
        
        {/* Left Side */}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-lg text-gray-800">
              {data.title}
            </h4>

            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                data.priority
              )}`}
            >
              {data.priority || 'Not Assigned'}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            👤 {data.name}
          </p>

          <p className="text-sm text-gray-500">
            🏢 {data.department}
          </p>
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={data.status}
            onChange={(e) => onStatusChange(data._id, e.target.value)}
            className={`border px-3 py-2 rounded-xl text-sm font-medium bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 ${getStatusColor(data.status)}`}
          >
            <option value="Pending">⏱ Pending</option>
            <option value="Processing">⟳ Processing</option>
            <option value="Resolved">✓ Resolved</option>
            <option value="Rejected">✗ Rejected</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          📍 {data.address}
        </p>
      </div>

      {/* Tracking + Status */}
      <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
        
        <p className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          🆔 {data.trackingId}
        </p>

        <p className={`text-sm font-semibold ${getStatusColor(data.status)}`}>
          {data.status}
        </p>
      </div>

      {/* AI Summary */}
      {data.aiSummary && (
        <div className="mt-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-3">
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-600 text-sm">🧠</span>

            <span className="text-purple-700 font-semibold text-sm">
              AI Analysis
            </span>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            {data.aiSummary.substring(0, 100)}...
          </p>
        </div>
      )}
    </div>
  );
};

export default GrievanceCard;