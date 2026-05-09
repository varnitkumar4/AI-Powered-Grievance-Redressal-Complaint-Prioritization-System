import { Schema, model } from 'mongoose';

const grievanceSchema = new Schema({
  name: String,
  code: String,
  email: String,
  mobile: String, // Added mobile to match frontend
  message: String,
  department: {
  type: String,
  required: true
},
  address: String,
  
  // NEW: Store array of image file paths/URLs
  images: [String], 
  
  // NEW: Store location coordinates
  location: {
    latitude: Number,
    longitude: Number
  },

  trackingId: { type: String, unique: true, required: true },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Processing", "Resolved", "Rejected"]
  },

   aiSummary:  {
    type: String,
    default: "No summary available",
  },
  aiPriority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: 'Low',
  },
  createdAt: { type: Date, default: Date.now },
});

export default model('Grievance', grievanceSchema);