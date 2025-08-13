const AppointmentSlot = require('../models/AppointmentSlot');
const Provider = require('../models/Provider');
const Patient = require('../models/Patient');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { isPatient, isProvider, getUserId } = require('../middleware/authentication');

// Book an appointment slot (patient only)
const bookAppointment = asyncHandler(async (req, res, next) => {
	if (!isPatient(req)) {
		return res.status(403).json({ error: 'Only patients can book appointments' });
	}

	const { slot_id, appointment_type, notes } = req.body || {};
	if (!slot_id) {
		return res.status(400).json({ error: 'slot_id is required' });
	}

	// Find the slot
	const slot = await AppointmentSlot.findById(slot_id);
	if (!slot) {
		return res.status(404).json({ error: 'Slot not found' });
	}

	if (!slot.isAvailable()) {
		return res.status(409).json({ error: 'Slot is not available for booking' });
	}

	// Optional: prevent booking in the past
	if (slot.slot_end_time <= new Date()) {
		return res.status(400).json({ error: 'Cannot book a slot in the past' });
	}

	// Ensure provider exists and is verified/active
	const provider = await Provider.findById(slot.provider_id);
	if (!provider) {
		return res.status(404).json({ error: 'Provider not found for this slot' });
	}
	if (!provider.is_active || provider.verification_status !== 'verified') {
		return res.status(403).json({ error: 'Provider is not available to accept bookings' });
	}

	// Ensure patient exists and is active
	const patientId = req.user.patient_id;
	const patient = await Patient.findById(patientId);
	if (!patient || !patient.is_active) {
		return res.status(403).json({ error: 'Patient account is not active' });
	}

	// Use provided appointment_type or fallback to slot's existing type
	const finalType = appointment_type || slot.appointment_type || 'consultation';
	const saved = await slot.bookSlot(patientId, finalType, notes || '');

	return res.status(201).json({
		success: true,
		message: 'Appointment booked successfully',
		data: {
			appointment_id: saved._id,
			booking_reference: saved.booking_reference,
			provider_id: saved.provider_id,
			patient_id: saved.patient_id,
			appointment_type: saved.appointment_type,
			status: saved.status,
			slot_start_time: saved.slot_start_time,
			slot_end_time: saved.slot_end_time,
			notes: saved.notes
		}
	});
});

// List appointments for the authenticated user
// - Patients: their own appointments
// - Providers: appointments with them as provider
const listAppointments = asyncHandler(async (req, res, next) => {
	const userIsPatient = isPatient(req);
	const userIsProvider = isProvider(req);
	if (!userIsPatient && !userIsProvider) {
		return res.status(403).json({ error: 'Only authenticated patients or providers can list appointments' });
	}

	const { status, from, to, page = 1, limit = 20 } = req.query;
	const filter = {};

	if (userIsPatient) {
		filter.patient_id = req.user.patient_id;
	}
	if (userIsProvider) {
		filter.provider_id = req.user.provider_id;
	}

	if (status) {
		filter.status = status;
	}

	if (from || to) {
		filter.slot_start_time = {};
		if (from) filter.slot_start_time.$gte = new Date(from);
		if (to) filter.slot_start_time.$lte = new Date(to);
	}

	const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
	const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

	const [items, total] = await Promise.all([
		AppointmentSlot.find(filter)
			.sort({ slot_start_time: -1 })
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize),
		AppointmentSlot.countDocuments(filter)
	]);

	return res.status(200).json({
		success: true,
		data: {
			items,
			pagination: {
				page: pageNumber,
				limit: pageSize,
				total,
				total_pages: Math.ceil(total / pageSize)
			}
		}
	});
});

module.exports = {
	bookAppointment,
	listAppointments
}; 