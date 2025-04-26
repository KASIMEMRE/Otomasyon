import User from '../models/userModel.js';
import Record from '../models/recordModel.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Don't allow admin to delete themselves
      if (user._id.equals(req.user._id)) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      await User.deleteOne({ _id: req.params.id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all records (admin)
// @route   GET /api/admin/records
// @access  Private/Admin
const getAllRecords = async (req, res) => {
  try {
    const { userId, category, status, startDate, endDate } = req.query;
    
    // Build query object
    const query = {};
    
    if (userId) query.user = userId;
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const records = await Record.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ date: -1 });
      
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update record status (admin)
// @route   PUT /api/admin/records/:id/status
// @access  Private/Admin
const updateRecordStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    record.status = status;
    const updatedRecord = await record.save();
    
    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments({});
    
    // Get total records
    const totalRecords = await Record.countDocuments({});
    
    // Get records by status
    const pendingRecords = await Record.countDocuments({ status: 'Pending' });
    const processingRecords = await Record.countDocuments({ status: 'Processing' });
    const completedRecords = await Record.countDocuments({ status: 'Completed' });
    const rejectedRecords = await Record.countDocuments({ status: 'Rejected' });
    
    // Get records created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRecords = await Record.countDocuments({
      createdAt: { $gte: today },
    });
    
    // Get records by date (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await Record.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      });
      
      last7Days.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }
    
    res.json({
      totalUsers,
      totalRecords,
      statusCounts: {
        pending: pendingRecords,
        processing: processingRecords,
        completed: completedRecords,
        rejected: rejectedRecords,
      },
      todayRecords,
      last7Days,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllRecords,
  updateRecordStatus,
  getDashboardStats,
};