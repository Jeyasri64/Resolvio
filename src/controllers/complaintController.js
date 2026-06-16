const ApiError = require('../utils/apiError');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

function getImageUrl(req, image) {
  if (!image) return undefined;
  if (/^https?:\/\//i.test(image)) return image;
  return `${req.protocol}://${req.get('host')}${image}`;
}

function complaintView(complaint, req) {
  return {
    complaintId: complaint._id,
    title: complaint.complaintTitle,
    complaintTitle: complaint.complaintTitle,
    category: complaint.category,
    roomNumber: complaint.roomNumber,
    description: complaint.description,
    image: complaint.image,
    imageUrl: getImageUrl(req, complaint.image),
    status: complaint.status,
    adminRemark: complaint.adminRemark,
    assignedTo: complaint.assignedTo,
    student: complaint.student,
    date: complaint.createdAt,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt
  };
}

const createComplaint = asyncHandler(async (req, res) => {
  if (req.body.image && !req.file && !/^https?:\/\//i.test(req.body.image)) {
    throw new ApiError(400, 'Upload image as a file using form-data field name "image"');
  }

  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image || undefined;
  const complaint = await Complaint.create({
    student: req.user._id,
    complaintTitle: req.body.complaintTitle,
    category: req.body.category,
    roomNumber: req.body.roomNumber,
    description: req.body.description,
    image
  });

  res.status(201).json(complaintView(complaint, req));
});

const myComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ student: req.user._id }).sort({ createdAt: -1 });
  res.json(complaints.map((complaint) => complaintView(complaint, req)));
});

const getMyComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, student: req.user._id });
  if (!complaint) throw new ApiError(404, 'Complaint not found');
  res.json(complaintView(complaint, req));
});

const listComplaints = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;

  const complaints = await Complaint.find(filter)
    .populate('student', 'fullName rollNumber roomNumber email')
    .sort({ createdAt: -1 });

  res.json(complaints.map((complaint) => complaintView(complaint, req)));
});

const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('student', 'fullName rollNumber roomNumber email');

  if (!complaint) throw new ApiError(404, 'Complaint not found');
  res.json(complaintView(complaint, req));
});

const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, 'Complaint not found');

  const allowed = ['status', 'adminRemark', 'assignedTo'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) complaint[field] = req.body[field];
  });

  // allow updating student contact details through the complaint record if included
  if (req.body.student) {
    const studentUpdates = {};
    if (req.body.student.fullName !== undefined) studentUpdates.fullName = String(req.body.student.fullName).trim();
    if (req.body.student.rollNumber !== undefined) studentUpdates.rollNumber = String(req.body.student.rollNumber).trim();
    if (req.body.student.roomNumber !== undefined && req.body.student.roomNumber !== '') {
      const parsedRoom = Number(req.body.student.roomNumber);
      if (!Number.isNaN(parsedRoom)) studentUpdates.roomNumber = parsedRoom;
    }
    if (req.body.student.email !== undefined) studentUpdates.email = String(req.body.student.email).trim().toLowerCase();

    if (Object.keys(studentUpdates).length > 0) {
      await User.findByIdAndUpdate(complaint.student, studentUpdates, { runValidators: true });
    }
  }

  await complaint.save();

  await Notification.create({
    user: complaint.student,
    message: `Your complaint "${complaint.complaintTitle}" is now ${complaint.status}.`
  });

  const updatedComplaint = await Complaint.findById(req.params.id).populate('student', 'fullName rollNumber roomNumber email');
  res.json(complaintView(updatedComplaint, req));
});

module.exports = {
  createComplaint,
  myComplaints,
  getMyComplaint,
  listComplaints,
  getComplaint,
  updateComplaint
};
