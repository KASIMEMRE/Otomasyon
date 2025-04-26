import Record from '../models/recordModel.js';

// @desc    Create a new record
// @route   POST /api/records
// @access  Private
const createRecord = async (req, res) => {
  try {
    const { title, description, category, date } = req.body;

    const record = new Record({
      user: req.user._id,
      title,
      description,
      category,
      date: date || Date.now(),
    });

    const createdRecord = await record.save();
    res.status(201).json(createdRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all records for a user
// @route   GET /api/records
// @access  Private
const getRecords = async (req, res) => {
  try {
    // Query parameters for filtering
    const { category, status, startDate, endDate } = req.query;
    
    // Build query object
    const query = { user: req.user._id };
    
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const records = await Record.find(query).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get record by ID
// @route   GET /api/records/:id
// @access  Private
const getRecordById = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);

    // Check if record exists
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Make sure the logged in user is the owner of the record
    if (record.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a record
// @route   PUT /api/records/:id
// @access  Private
const updateRecord = async (req, res) => {
  try {
    const { title, description, category, status, date } = req.body;
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Check if user is record owner or admin
    if (record.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update fields
    record.title = title || record.title;
    record.description = description || record.description;
    record.category = category || record.category;
    
    // Only admins can update status
    if (req.user.isAdmin && status) {
      record.status = status;
    }
    
    record.date = date || record.date;

    const updatedRecord = await record.save();
    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a record
// @route   DELETE /api/records/:id
// @access  Private
const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Check if user is record owner or admin
    if (record.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Record.deleteOne({ _id: req.params.id });
    res.json({ message: 'Record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };