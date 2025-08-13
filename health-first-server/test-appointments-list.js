const axios = require('axios');

const BASE = process.env.BASE || 'http://localhost:3000/api/v1';

async function run() {
	try {
		console.log('Health First - Appointments List Test');
		console.log('Using BASE:', BASE);

		// 1) Provider login to create availability (assumes seeded provider)
		console.log('Logging in provider...');
		const provLogin = await axios.post(`${BASE}/provider/login`, {
			email: 'john.doe@clinic.com',
			password: 'SecurePassword123!'
		});
		const providerToken = provLogin.data.data.access_token;
		const providerId = provLogin.data.data.provider.id;

		// 2) Create availability in the future to generate slots
		const today = new Date();
		const futureDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
		const yyyy = futureDate.getFullYear();
		const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
		const dd = String(futureDate.getDate()).padStart(2, '0');
		const isoDate = `${yyyy}-${mm}-${dd}`;

		console.log('Creating availability for', isoDate);
		try {
			await axios.post(`${BASE}/provider/availability`, {
				date: isoDate,
				start_time: '09:00',
				end_time: '10:30',
				timezone: 'America/New_York',
				slot_duration: 30,
				break_duration: 0,
				is_recurring: false,
				appointment_type: 'consultation',
				location: {
					type: 'clinic',
					address: '123 Medical Center Dr',
					city: 'New York',
					state: 'NY',
					zip: '10001'
				},
				pricing: {
					base_fee: 150,
					insurance_accepted: true,
					currency: 'USD',
					copay: 25,
					deductible_applies: true
				}
			}, {
				headers: { Authorization: `Bearer ${providerToken}` }
			});
			console.log('Availability created');
		} catch (e) {
			if (e.response && e.response.status === 409) {
				console.log('Availability already exists for this time. Proceeding...');
			} else {
				throw e;
			}
		}

		// 3) Search slots to get an available slot id
		console.log('Searching available slots...');
		const search = await axios.get(`${BASE}/availability/search?date=${isoDate}&specialization=Cardiology&available_only=true&timezone=America/New_York`);
		const firstProvider = search.data.data.results[0];
		if (!firstProvider || !firstProvider.available_slots.length) {
			throw new Error('No available slots found to book');
		}
		const slotId = firstProvider.available_slots[0].slot_id;
		console.log('Found slot:', slotId);

		// 4) Register and login a patient
		const unique = Date.now();
		console.log('Registering patient...');
		await axios.post(`${BASE}/patient/register`, {
			first_name: 'Test',
			last_name: 'Patient',
			email: `patient_${unique}@mail.com`,
			phone_number: "+1555" + String(unique).slice(-7),
			password: 'SecurePass123!',
			confirm_password: 'SecurePass123!',
			date_of_birth: '1995-01-01',
			gender: 'female',
			address: { street: '1 Test Ave', city: 'New York', state: 'NY', zip: '10001' },
			emergency_contact: { name: 'EC', relationship: 'Friend', phone: '+15550000000' },
			medical_history: ['none'],
			insurance_info: { provider: 'ACME', policy_number: 'X1' }
		});

		console.log('Logging in patient...');
		const patLogin = await axios.post(`${BASE}/patient/login`, {
			email: `patient_${unique}@mail.com`,
			password: 'SecurePass123!'
		});
		const patientToken = patLogin.data.data.access_token;

		// 5) Book the slot
		console.log('Booking appointment...');
		await axios.post(`${BASE}/appointments/book`, {
			slot_id: slotId,
			appointment_type: 'consultation',
			notes: 'Test booking'
		}, {
			headers: { Authorization: `Bearer ${patientToken}` }
		});

		// 6) List the appointments (patient)
		console.log('Listing patient appointments...');
		const list = await axios.get(`${BASE}/appointments?status=booked`, {
			headers: { Authorization: `Bearer ${patientToken}` }
		});
		console.log('List result count:', list.data.data.items.length);
		console.log('Sample item:', list.data.data.items[0]);

		console.log('✅ Appointments list test completed');
	} catch (err) {
		console.error('❌ Test failed:', err.response?.data || err.message);
		process.exit(1);
	}
}

if (require.main === module) {
	run();
}

module.exports = { run }; 