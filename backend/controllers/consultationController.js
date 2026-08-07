const ConsultationRequest = require('../models/ConsultationRequest');
const Appointment = require('../models/Appointment');
const ConsultationRecord = require('../models/ConsultationRecord');
const Expert = require('../models/Expert');
const Notification = require('../models/Notification');

const notify = (userId, message, link) => Notification.create({ userId, message, link });

// POST /api/consultations/requests
// Farmer submits a consultation request to an expert.
const createRequest = async (req, res) => {
  try {
    const { expertId, title, cropType, subject, description, consultationType, preferredDate } = req.body;

    if (!expertId || !title || !consultationType) {
      return res.status(400).json({ message: 'Expert, title, and consultation mode are required' });
    }

    const request = await ConsultationRequest.create({
      farmerId: req.user._id,
      expertId,
      title,
      cropType,
      subject,
      description,
      consultationType,
      preferredDate: preferredDate || undefined,
      attachment: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    const expert = await Expert.findById(expertId);
    if (expert?.userId) {
      await notify(expert.userId, `New consultation request: ${title}`, '/consultations/pending');
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// GET /api/consultations/requests/mine
// Farmer's own requests.
const getMyRequests = async (req, res) => {
  try {
    const requests = await ConsultationRequest.find({ farmerId: req.user._id })
      .populate('expertId', 'fullName specialization phone email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// GET /api/consultations/requests/pending
// The logged-in expert's pending requests.
const getPendingRequests = async (req, res) => {
  try {
    const expert = await Expert.findOne({ userId: req.user._id });
    if (!expert) {
      return res.json([]);
    }

    const requests = await ConsultationRequest.find({ expertId: expert._id, status: 'pending' })
      .populate('farmerId', 'name phone email district upazila')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// PUT /api/consultations/requests/:id/approve
// Expert approves a request and schedules the appointment in the same step.
const approveRequest = async (req, res) => {
  try {
    const request = await ConsultationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const expert = await Expert.findOne({ userId: req.user._id });
    if (!expert || request.expertId.toString() !== expert._id.toString()) {
      return res.status(403).json({ message: 'You can only approve your own requests' });
    }

    const { date, time, meetingLink, location } = req.body;

    request.status = 'approved';
    await request.save();

    const appointment = await Appointment.create({
      consultationRequestId: request._id,
      farmerId: request.farmerId,
      expertId: request.expertId,
      title: request.title,
      date,
      time,
      consultationType: request.consultationType,
      meetingLink,
      location,
    });

    await notify(request.farmerId, `Your consultation request "${request.title}" was approved and scheduled`, '/consultations');

    res.json({ request, appointment });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// PUT /api/consultations/requests/:id/reject
const rejectRequest = async (req, res) => {
  try {
    const request = await ConsultationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const expert = await Expert.findOne({ userId: req.user._id });
    if (!expert || request.expertId.toString() !== expert._id.toString()) {
      return res.status(403).json({ message: 'You can only reject your own requests' });
    }

    request.status = 'rejected';
    await request.save();

    await notify(request.farmerId, `Your consultation request "${request.title}" was rejected`, '/consultations');

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// PUT /api/consultations/requests/:id/reschedule
// Expert suggests a different date/time instead of approving/rejecting outright.
const rescheduleRequest = async (req, res) => {
  try {
    const request = await ConsultationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const expert = await Expert.findOne({ userId: req.user._id });
    if (!expert || request.expertId.toString() !== expert._id.toString()) {
      return res.status(403).json({ message: 'You can only reschedule your own requests' });
    }

    const { preferredDate } = req.body;

    request.status = 'rescheduled';
    request.preferredDate = preferredDate;
    await request.save();

    await notify(request.farmerId, `A new time was suggested for "${request.title}"`, '/consultations');

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// PUT /api/consultations/requests/:id/accept-reschedule
// Farmer accepts the expert's suggested time; this schedules the appointment.
const acceptReschedule = async (req, res) => {
  try {
    const request = await ConsultationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only respond to your own requests' });
    }

    const { date, time } = req.body;

    request.status = 'approved';
    await request.save();

    const appointment = await Appointment.create({
      consultationRequestId: request._id,
      farmerId: request.farmerId,
      expertId: request.expertId,
      title: request.title,
      date,
      time,
      consultationType: request.consultationType,
    });

    const expert = await Expert.findById(request.expertId);
    if (expert?.userId) {
      await notify(expert.userId, `${req.user.name} accepted the new time for "${request.title}"`, '/consultations/records');
    }

    res.json({ request, appointment });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// GET /api/consultations/appointments/mine
// Role-aware: a farmer sees their own appointments, an expert sees the ones
// they are giving. Each appointment includes its consultation record, if any.
const getMyAppointments = async (req, res) => {
  try {
    let filter;

    if (req.user.role === 'expert') {
      const expert = await Expert.findOne({ userId: req.user._id });
      filter = { expertId: expert ? expert._id : null };
    } else {
      filter = { farmerId: req.user._id };
    }

    const appointments = await Appointment.find(filter)
      .populate('farmerId', 'name phone email')
      .populate('expertId', 'fullName phone email')
      .sort({ date: -1 });

    const records = await ConsultationRecord.find({
      appointmentId: { $in: appointments.map((a) => a._id) },
    });

    const result = appointments.map((appointment) => ({
      ...appointment.toObject(),
      record: records.find((r) => r.appointmentId.toString() === appointment._id.toString()) || null,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// PUT /api/consultations/appointments/:id/complete
// Expert marks an appointment completed and saves the consultation record.
const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const expert = await Expert.findOne({ userId: req.user._id });
    if (!expert || appointment.expertId.toString() !== expert._id.toString()) {
      return res.status(403).json({ message: 'You can only complete your own appointments' });
    }

    const { diagnosis, recommendations, notes } = req.body;

    appointment.status = 'completed';
    await appointment.save();

    const record = await ConsultationRecord.findOneAndUpdate(
      { appointmentId: appointment._id },
      {
        appointmentId: appointment._id,
        farmerId: appointment.farmerId,
        expertId: appointment.expertId,
        diagnosis,
        recommendations,
        notes,
        completedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    await notify(appointment.farmerId, `Your consultation "${appointment.title}" has been completed`, '/consultations');

    res.json({ appointment, record });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  rescheduleRequest,
  acceptReschedule,
  getMyAppointments,
  completeAppointment,
};
