<template>
  <div class="registration-container">
    <div class="registration-card">
      <h2 class="welcome">Create Your Patient Account</h2>
      <form @submit.prevent>
        <!-- Personal Information -->
        <section class="form-section">
          <h3>Personal Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input id="firstName" v-model="firstName" type="text" required minlength="2" maxlength="50" placeholder="First Name" />
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input id="lastName" v-model="lastName" type="text" required minlength="2" maxlength="50" placeholder="Last Name" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input id="email" v-model="email" type="email" required placeholder="Email Address" />
            </div>
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input id="phone" v-model="phone" type="tel" required placeholder="Phone Number" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="dob">Date of Birth</label>
              <input id="dob" v-model="dob" type="date" required :max="today" />
            </div>
            <div class="form-group">
              <label for="gender">Gender</label>
              <select id="gender" v-model="gender" required>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>
        </section>
        <!-- Address -->
        <section class="form-section">
          <h3>Address</h3>
          <div class="form-row">
            <div class="form-group wide">
              <label for="street">Street Address</label>
              <input id="street" v-model="street" type="text" required maxlength="200" placeholder="Street Address" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="city">City</label>
              <input id="city" v-model="city" type="text" required maxlength="100" placeholder="City" />
            </div>
            <div class="form-group">
              <label for="state">State/Province</label>
              <input id="state" v-model="state" type="text" required maxlength="50" placeholder="State/Province" />
            </div>
            <div class="form-group">
              <label for="zip">ZIP/Postal Code</label>
              <input id="zip" v-model="zip" type="text" required placeholder="ZIP/Postal Code" />
            </div>
          </div>
        </section>
        <!-- Emergency Contact -->
        <section class="form-section">
          <h3>Emergency Contact <span class="optional">(Optional)</span></h3>
          <div class="form-row">
            <div class="form-group">
              <label for="emergencyName">Contact Name</label>
              <input id="emergencyName" v-model="emergencyName" type="text" maxlength="100" placeholder="Emergency Contact Name" />
            </div>
            <div class="form-group">
              <label for="emergencyRelationship">Relationship</label>
              <input id="emergencyRelationship" v-model="emergencyRelationship" type="text" maxlength="50" placeholder="Relationship" />
            </div>
            <div class="form-group">
              <label for="emergencyPhone">Phone Number</label>
              <input id="emergencyPhone" v-model="emergencyPhone" type="tel" placeholder="Emergency Phone Number" />
            </div>
          </div>
        </section>
        <!-- Account Security -->
        <section class="form-section">
          <h3>Account Security</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="password">Password</label>
              <input id="password" v-model="password" type="password" required minlength="8" placeholder="Password" />
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" v-model="confirmPassword" type="password" required minlength="8" placeholder="Confirm Password" />
            </div>
          </div>
        </section>
        <button class="register-btn" type="submit">Register</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PatientRegistration',
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: '',
      gender: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      emergencyName: '',
      emergencyRelationship: '',
      emergencyPhone: '',
      password: '',
      confirmPassword: '',
      today: new Date().toISOString().split('T')[0],
    };
  },
};
</script>

<style scoped>
.registration-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #f8fafc 100%);
}
.registration-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2.5rem 2rem 2rem 2rem;
  max-width: 650px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.welcome {
  text-align: center;
  color: #00796b;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-section {
  background: #f8fafc;
  border-radius: 10px;
  padding: 1.2rem 1rem 1rem 1rem;
  margin-bottom: 0.5rem;
}
.form-section h3 {
  margin-bottom: 0.7rem;
  color: #009688;
  font-size: 1.1rem;
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
label {
  font-size: 1rem;
  margin-bottom: 0.2rem;
  color: #333;
}
input, select {
  padding: 0.7rem 1rem;
  border: 1.5px solid #b2dfdb;
  border-radius: 7px;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
input:focus, select:focus {
  border-color: #4dd0e1;
  box-shadow: 0 0 0 2px #b2ebf2;
}
.optional {
  color: #888;
  font-size: 0.95rem;
}
.register-btn {
  width: 100%;
  padding: 0.8rem;
  background: #00796b;
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}
.register-btn:hover {
  background: #004d40;
}
@media (max-width: 900px) {
  .registration-card {
    max-width: 98vw;
    padding: 1.5rem 0.7rem 1.2rem 0.7rem;
  }
  .form-row {
    flex-direction: column;
    gap: 0.2rem;
  }
}
</style> 