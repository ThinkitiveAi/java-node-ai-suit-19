<template>
  <div class="provider-availability-container">
    <div class="calendar-controls">
      <button class="nav-btn">&#8592; Prev</button>
      <input type="month" v-model="selectedMonth" />
      <button class="nav-btn">Today</button>
      <button class="nav-btn">Next &#8594;</button>
      <select v-model="calendarView">
        <option value="month">Month</option>
        <option value="week">Week</option>
        <option value="day">Day</option>
      </select>
    </div>
    <div class="calendar-view">
      <div v-if="calendarView === 'month'">
        <!-- Monthly Calendar Placeholder -->
        <div class="calendar-month-placeholder">[Monthly Calendar View]</div>
      </div>
      <div v-else-if="calendarView === 'week'">
        <!-- Weekly Calendar Placeholder -->
        <div class="calendar-week-placeholder">[Weekly Calendar View]</div>
      </div>
      <div v-else>
        <!-- Daily Calendar Placeholder -->
        <div class="calendar-day-placeholder">[Daily Calendar View]</div>
      </div>
    </div>
    <div class="availability-management">
      <h3>Manage Availability</h3>
      <form class="availability-form" @submit.prevent>
        <div class="form-row">
          <div class="form-group">
            <label for="provider">Provider</label>
            <select id="provider" v-model="provider">
              <option value="">Select Provider</option>
              <option>Dr. John Doe</option>
              <option>Dr. Jane Smith</option>
            </select>
          </div>
          <div class="form-group">
            <label for="date">Date</label>
            <input id="date" v-model="date" type="date" required />
          </div>
          <div class="form-group">
            <label for="startTime">Start Time</label>
            <input id="startTime" v-model="startTime" type="time" required />
          </div>
          <div class="form-group">
            <label for="endTime">End Time</label>
            <input id="endTime" v-model="endTime" type="time" required />
          </div>
          <div class="form-group">
            <label for="timezone">Timezone</label>
            <select id="timezone" v-model="timezone">
              <option>America/New_York</option>
              <option>Europe/London</option>
              <option>Asia/Kolkata</option>
              <option>UTC</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="isRecurring" />
              Is Recurring?
            </label>
          </div>
          <div class="form-group" v-if="isRecurring">
            <label for="recurrencePattern">Recurrence Pattern</label>
            <select id="recurrencePattern" v-model="recurrencePattern">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div class="form-group" v-if="isRecurring">
            <label for="recurrenceEnd">Recurrence End Date</label>
            <input id="recurrenceEnd" v-model="recurrenceEnd" type="date" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="slotDuration">Slot Duration (min)</label>
            <input id="slotDuration" v-model="slotDuration" type="number" min="5" max="180" step="5" />
          </div>
          <div class="form-group">
            <label for="breakDuration">Break Duration (min)</label>
            <input id="breakDuration" v-model="breakDuration" type="number" min="0" max="60" step="5" />
          </div>
          <div class="form-group">
            <label for="maxAppointments">Max Appointments/Slot</label>
            <input id="maxAppointments" v-model="maxAppointments" type="number" min="1" max="10" />
          </div>
          <div class="form-group">
            <label for="appointmentType">Appointment Type</label>
            <select id="appointmentType" v-model="appointmentType">
              <option>Consultation</option>
              <option>Follow Up</option>
              <option>Emergency</option>
              <option>Telemedicine</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="locationType">Location Type</label>
            <select id="locationType" v-model="locationType">
              <option>Clinic</option>
              <option>Hospital</option>
              <option>Telemedicine</option>
              <option>Home Visit</option>
            </select>
          </div>
          <div class="form-group" v-if="locationType !== 'Telemedicine'">
            <label for="address">Address</label>
            <input id="address" v-model="address" type="text" maxlength="200" />
          </div>
          <div class="form-group">
            <label for="roomNumber">Room Number</label>
            <input id="roomNumber" v-model="roomNumber" type="text" maxlength="50" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="baseFee">Base Fee</label>
            <input id="baseFee" v-model="baseFee" type="number" min="0" step="0.01" />
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="insuranceAccepted" />
              Insurance Accepted?
            </label>
          </div>
          <div class="form-group">
            <label for="currency">Currency</label>
            <select id="currency" v-model="currency">
              <option>USD</option>
              <option>EUR</option>
              <option>INR</option>
              <option>GBP</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group wide">
            <label for="notes">Notes</label>
            <textarea id="notes" v-model="notes" maxlength="500" rows="2" placeholder="Additional notes..."></textarea>
          </div>
          <div class="form-group wide">
            <label for="specialRequirements">Special Requirements</label>
            <input id="specialRequirements" v-model="specialRequirements" type="text" placeholder="e.g. wheelchair access, interpreter" />
          </div>
        </div>
        <div class="form-actions">
          <button class="add-btn" type="submit">Add Availability</button>
          <button class="bulk-btn" type="button">Bulk Add</button>
          <button class="template-btn" type="button">Apply Template</button>
        </div>
      </form>
      <div class="availability-list">
        <h4>Current Availability</h4>
        <div class="slot-list">
          <div class="slot-item available">
            <span>2024-06-10, 09:00-12:00 (Consultation)</span>
            <span class="status available">Available</span>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </div>
          <div class="slot-item conflict">
            <span>2024-06-10, 11:00-13:00 (Emergency)</span>
            <span class="status conflict">Conflict</span>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </div>
          <div class="slot-item reserved">
            <span>2024-06-10, 13:00-13:30 (Emergency)</span>
            <span class="status reserved">Reserved</span>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </div>
        </div>
        <div class="feedback success">Availability updated successfully!</div>
        <div class="feedback error">Error: Overlapping slot detected.</div>
        <div class="feedback warning">Warning: Buffer time not set between slots.</div>
        <div class="feedback info">Info: Schedule changes will notify patients.</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProviderAvailability',
  data() {
    return {
      calendarView: 'month',
      selectedMonth: new Date().toISOString().slice(0, 7),
      provider: '',
      date: '',
      startTime: '',
      endTime: '',
      timezone: 'America/New_York',
      isRecurring: false,
      recurrencePattern: 'weekly',
      recurrenceEnd: '',
      slotDuration: 30,
      breakDuration: 0,
      maxAppointments: 1,
      appointmentType: 'Consultation',
      locationType: 'Clinic',
      address: '',
      roomNumber: '',
      baseFee: '',
      insuranceAccepted: false,
      currency: 'USD',
      notes: '',
      specialRequirements: '',
    };
  },
};
</script>

<style scoped>
.provider-availability-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #f8fafc 100%);
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.calendar-controls {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  margin-bottom: 1.2rem;
}
.nav-btn {
  background: #00796b;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.nav-btn:hover {
  background: #004d40;
}
.calendar-view {
  width: 100%;
  max-width: 900px;
  margin-bottom: 2rem;
}
.calendar-month-placeholder,
.calendar-week-placeholder,
.calendar-day-placeholder {
  background: #fff;
  border-radius: 12px;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b0bec5;
  font-size: 1.3rem;
  border: 1.5px solid #b2dfdb;
}
.availability-management {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  max-width: 900px;
  width: 100%;
  margin-bottom: 2rem;
}
.availability-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.form-group {
  display: flex;
  flex-direction: column;
  flex: 1 1 180px;
  min-width: 140px;
  margin-bottom: 0.7rem;
}
.form-group.wide {
  flex: 2 1 100%;
}
.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}
label {
  font-size: 1rem;
  margin-bottom: 0.2rem;
  color: #333;
}
input, select, textarea {
  padding: 0.7rem 1rem;
  border: 1.5px solid #b2dfdb;
  border-radius: 7px;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
input:focus, select:focus, textarea:focus {
  border-color: #4dd0e1;
  box-shadow: 0 0 0 2px #b2ebf2;
}
textarea {
  resize: vertical;
}
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.7rem;
}
.add-btn, .bulk-btn, .template-btn {
  background: #00796b;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.add-btn:hover, .bulk-btn:hover, .template-btn:hover {
  background: #004d40;
}
.availability-list {
  margin-top: 2rem;
}
.slot-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.slot-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  border-radius: 7px;
  padding: 0.7rem 1rem;
  border: 1.5px solid #b2dfdb;
}
.status {
  font-weight: 600;
  padding: 0.2rem 0.7rem;
  border-radius: 5px;
  font-size: 0.98rem;
}
.status.available {
  background: #e0f7fa;
  color: #00796b;
}
.status.conflict {
  background: #ffe0e0;
  color: #d32f2f;
}
.status.reserved {
  background: #fff3e0;
  color: #f57c00;
}
.edit-btn, .delete-btn {
  background: none;
  border: none;
  color: #00796b;
  font-weight: 600;
  cursor: pointer;
  padding: 0.2rem 0.7rem;
  border-radius: 5px;
  transition: background 0.2s;
}
.edit-btn:hover {
  background: #e0f7fa;
}
.delete-btn:hover {
  background: #ffe0e0;
}
.feedback {
  margin-top: 0.7rem;
  padding: 0.6rem 1rem;
  border-radius: 7px;
  font-size: 1rem;
  font-weight: 500;
}
.feedback.success {
  background: #e0f7fa;
  color: #00796b;
}
.feedback.error {
  background: #ffe0e0;
  color: #d32f2f;
}
.feedback.warning {
  background: #fff3e0;
  color: #f57c00;
}
.feedback.info {
  background: #e3f2fd;
  color: #1976d2;
}
@media (max-width: 900px) {
  .calendar-view, .availability-management {
    max-width: 98vw;
    padding: 1.2rem 0.5rem;
  }
  .form-row {
    flex-direction: column;
    gap: 0.2rem;
  }
}
</style> 