import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ResolutionTimeline from './ResolutionTimeline';

const GrievanceDetails = ({ grievance, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);

  useEffect(() => {
    // Animation trigger
    setIsVisible(true);
    
    // Handle ESC key press
    const handleEsc = (e) => {
      if (e.key === 'Esc' || e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!grievance) return null;

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 z-50 flex justify-center items-start p-4 sm:p-10 ${
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative transform transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-3xl transition-colors"
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold text-white">Grievance Details</h2>
          <p className="text-blue-100 text-sm mt-1">Tracking ID: {grievance.trackingId}</p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Status Badge */}
          <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(grievance.status)}`}>
              {grievance.status || 'Pending'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(grievance.aiPriority)}`}>
              ⚡ Priority: {grievance.aiPriority || 'Not set'}
            </span>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
              <p className="text-gray-900 font-medium">{grievance.name}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-gray-900 font-medium">{grievance.email}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Department</p>
              <p className="text-gray-900 font-medium">{grievance.department}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Created At</p>
              <p className="text-gray-900 font-medium">{new Date(grievance.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Message Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{grievance.message}</p>
            </div>
          </div>

          {/* Address Section */}
          {grievance.address && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">{grievance.address}</p>
              </div>
            </div>
          )}

          {/* AI Insights Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">🧠 AI Insights</label>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-gray-800">
                {showFullSummary || grievance.aiSummary?.length <= 200 
                  ? grievance.aiSummary 
                  : `${grievance.aiSummary.substring(0, 200)}...`}
                {grievance.aiSummary?.length > 200 && (
                  <button 
                    onClick={() => setShowFullSummary(!showFullSummary)}
                    className="text-blue-600 hover:text-blue-800 ml-2 text-sm font-medium"
                  >
                    {showFullSummary ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            </div>
          </div>

          {/* Resolution Timeline (if available) */}
          {grievance.resolutionSteps && grievance.resolutionSteps.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Resolution Timeline</label>
              <ResolutionTimeline steps={grievance.resolutionSteps} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(grievance.trackingId);
                // You could add a toast notification here
              }}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              📋 Copy Tracking ID
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrievanceDetails;