// routes/departmentRoutes.js
import express from "express";
import Grievance from "../models/Grievance.js";
import { verifyToken } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(allowRoles(['department', 'admin'])); // Department users can access

// Helper function to get department from authenticated user
const getDepartmentFromUser = (req) => {
  // Assuming user object is attached to req after verifyToken
  // and contains department information
  return req.user?.department || req.query.department;
};

// Get department-specific statistics
router.get("/stats", async (req, res) => {
  try {
    const department = getDepartmentFromUser(req);
    
    if (!department) {
      return res.status(400).json({ error: "Department information not found" });
    }

    const total = await Grievance.countDocuments({ department });
    const resolved = await Grievance.countDocuments({ 
      department, 
      status: "Resolved" 
    });
    const pending = await Grievance.countDocuments({ 
      department, 
      status: { $in: ["Pending", "Processing"] } 
    });
    const critical = await Grievance.countDocuments({
      department,
      $or: [
        { priority: "High" },
        { message: { $regex: /(urgent|emergency|critical|flood|accident|fire)/i } }
      ]
    });

    res.json({ 
      total, 
      resolved, 
      pending, 
      critical 
    });
  } catch (err) {
    console.error("Error fetching department stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get department-specific alerts
router.get("/alerts", async (req, res) => {
  try {
    const department = getDepartmentFromUser(req);
    
    if (!department) {
      return res.status(400).json({ error: "Department information not found" });
    }

    const alerts = await Grievance.find({
      department,
      $or: [
        { priority: "High" },
        { status: "Pending" },
        { message: { $regex: /(flood|accident|fire|collapse|urgent|emergency|critical)/i } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const formatted = alerts.map((a) => ({
      title: `⚠️ ${a.priority === 'High' ? 'High Priority' : 'Urgent'}: ${a.name || 'Anonymous'}`,
      message: a.message?.substring(0, 100) || 'No message',
      time: new Date(a.createdAt).toLocaleString(),
      isNew: (Date.now() - new Date(a.createdAt)) < 24 * 60 * 60 * 1000,
      grievanceId: a._id,
      trackingId: a.trackingId
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching department alerts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get department monthly progress
router.get("/progress/monthly", async (req, res) => {
  try {
    const department = getDepartmentFromUser(req);
    
    if (!department) {
      return res.status(400).json({ error: "Department information not found" });
    }

    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const result = await Grievance.aggregate([
      {
        $match: {
          department: department,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          name: {
            $arrayElemAt: [
              [
                "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
              ],
              "$_id.month"
            ]
          },
          total: 1,
          resolved: 1,
          monthOrder: {
            $add: [
              { $multiply: ["$_id.year", 12] },
              "$_id.month"
            ]
          }
        }
      },
      { $sort: { monthOrder: 1 } }
    ]);

    // Fill in missing months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const filledResult = [];
    const currentDate = new Date(sixMonthsAgo);
    
    for (let i = 0; i < 6; i++) {
      const month = currentDate.getMonth();
      const monthName = monthNames[month];
      const existing = result.find(r => r.name === monthName);
      
      filledResult.push({
        name: monthName,
        total: existing ? existing.total : 0,
        resolved: existing ? existing.resolved : 0
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json(filledResult);
  } catch (err) {
    console.error("Error fetching department monthly stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get department tasks
router.get("/tasks", async (req, res) => {
  try {
    const department = getDepartmentFromUser(req);
    
    if (!department) {
      return res.status(400).json({ error: "Department information not found" });
    }

    // Get pending grievances as tasks
    const pendingGrievances = await Grievance.find({
      department: department,
      status: { $in: ["Pending", "Processing"] }
    })
      .sort({ priority: -1, createdAt: 1 }) // High priority first
      .limit(6);

    const tasks = pendingGrievances.map((g) => {
      // Map priority from your schema (High, Medium, Low)
      let priority = "medium";
      if (g.priority === "High") {
        priority = "high";
      } else if (g.priority === "Medium") {
        priority = "medium";
      } else {
        priority = "low";
      }

      // Calculate deadline (3 days for High, 7 for Medium, 14 for Low)
      const createdDate = new Date(g.createdAt);
      let deadlineDays = g.priority === "High" ? 3 : g.priority === "Medium" ? 7 : 14;
      const deadlineDate = new Date(createdDate);
      deadlineDate.setDate(createdDate.getDate() + deadlineDays);
      
      const today = new Date();
      const isOverdue = deadlineDate < today && g.status !== "Resolved";

      return {
        id: g._id,
        priority: priority,
        title: `Grievance: ${g.name || 'Citizen'} - ${g.trackingId}`,
        deadline: deadlineDate.toLocaleDateString(),
        status: g.status,
        isOverdue: isOverdue,
        grievanceId: g._id,
        trackingId: g.trackingId
      };
    });

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching department tasks:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get department grievances with pagination and filtering
router.get("/grievances", async (req, res) => {
  try {
    const department = getDepartmentFromUser(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;
    const priority = req.query.priority;
    
    if (!department) {
      return res.status(400).json({ error: "Department information not found" });
    }

    let query = { department: department };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { trackingId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const grievances = await Grievance.find(query)
      .sort({ priority: -1, createdAt: -1 }) // High priority first, then newest
      .skip(skip)
      .limit(limit);
      
    const total = await Grievance.countDocuments(query);

    res.json({
      grievances,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGrievances: total
    });
  } catch (err) {
    console.error("Error fetching department grievances:", err);
    res.status(500).json({ error: "Failed to fetch grievances" });
  }
});

// Get single grievance by ID (with department check)
router.get("/grievances/:id", async (req, res) => {
  try {
    const department = getDepartmentFromUser(req);
    
    if (!department) {
      return res.status(400).json({ error: "Department information not found" });
    }

    const grievance = await Grievance.findById(req.params.id);
    
    if (!grievance) {
      return res.status(404).json({ error: "Grievance not found" });
    }
    
    // Verify the grievance belongs to this department
    if (grievance.department !== department) {
      return res.status(403).json({ error: "Access denied: Grievance not in your department" });
    }
    
    res.json(grievance);
  } catch (err) {
    console.error("Error fetching grievance:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update grievance status (with department check)
router.put("/grievances/:id/status", async (req, res) => {
  const { status } = req.body;
  
  try {
    const department = getDepartmentFromUser(req);
    
    if (!department) {
      return res.status(400).json({ error: "Department information not found" });
    }

    // First check if grievance belongs to this department
    const grievance = await Grievance.findById(req.params.id);
    
    if (!grievance) {
      return res.status(404).json({ error: "Grievance not found" });
    }
    
    if (grievance.department !== department) {
      return res.status(403).json({ error: "Access denied: Grievance not in your department" });
    }
    
    // Update status
    grievance.status = status;
    
    // Add resolution note if status is Resolved
    if (status === "Resolved") {
      grievance.resolvedAt = new Date();
    }
    
    await grievance.save();
    
    res.json({ 
      success: true, 
      grievance,
      message: `Grievance status updated to ${status}`
    });
  } catch (err) {
    console.error("Error updating grievance status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Update grievance priority
router.put("/grievances/:id/priority", async (req, res) => {
  const { priority } = req.body;
  
  try {
    const department = getDepartmentFromUser(req);
    
    if (!department) {
      return res.status(400).json({ error: "Department information not found" });
    }

    const grievance = await Grievance.findById(req.params.id);
    
    if (!grievance) {
      return res.status(404).json({ error: "Grievance not found" });
    }
    
    if (grievance.department !== department) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    grievance.priority = priority;
    await grievance.save();
    
    res.json({ success: true, grievance });
  } catch (err) {
    console.error("Error updating priority:", err);
    res.status(500).json({ error: "Failed to update priority" });
  }
});

// Get department statistics for dashboard overview
router.get("/dashboard/overview", async (req, res) => {
  try {
    const department = getDepartmentFromUser(req);
    
    if (!department) {
      return res.status(400).json({ error: "Department information not found" });
    }

    const total = await Grievance.countDocuments({ department });
    const resolved = await Grievance.countDocuments({ department, status: "Resolved" });
    const pending = await Grievance.countDocuments({ department, status: "Pending" });
    const processing = await Grievance.countDocuments({ department, status: "Processing" });
    const rejected = await Grievance.countDocuments({ department, status: "Rejected" });
    const highPriority = await Grievance.countDocuments({ department, priority: "High", status: { $ne: "Resolved" } });
    
    // Calculate resolution rate
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    
    // Get recent grievances for activity feed
    const recentGrievances = await Grievance.find({ department })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name trackingId status priority createdAt');
    
    const recentActivity = recentGrievances.map(g => ({
      id: g._id,
      name: g.name,
      trackingId: g.trackingId,
      status: g.status,
      priority: g.priority,
      createdAt: g.createdAt,
      daysOld: Math.floor((Date.now() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      total,
      resolved,
      pending,
      processing,
      rejected,
      highPriority,
      resolutionRate,
      recentActivity
    });
  } catch (err) {
    console.error("Error fetching dashboard overview:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Bulk update grievance status
router.put("/grievances/bulk/status", async (req, res) => {
  const { grievanceIds, status } = req.body;
  
  try {
    const department = getDepartmentFromUser(req);
    
    if (!department) {
      return res.status(400).json({ error: "Department information not found" });
    }

    const result = await Grievance.updateMany(
      { 
        _id: { $in: grievanceIds },
        department: department 
      },
      { 
        $set: { status: status }
      }
    );
    
    res.json({ 
      success: true, 
      modifiedCount: result.modifiedCount,
      message: `Updated ${result.modifiedCount} grievances to ${status}`
    });
  } catch (err) {
    console.error("Error bulk updating status:", err);
    res.status(500).json({ error: "Failed to update grievances" });
  }
});

export default router;