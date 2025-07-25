<template>
  <div class="registration-container">
    <form @submit.prevent="onSubmit" novalidate>
      <h2>Provider Registration</h2>
      <div v-if="formError" class="form-error">{{ formError }}</div>

      <!-- Personal Information -->
      <section>
        <h3>Personal Information</h3>
        <div class="form-group">
          <label>First Name</label>
          <input v-model="form.firstName" type="text" :class="{ invalid: errors.firstName }" @blur="validateField('firstName')" />
          <span v-if="errors.firstName" class="error">{{ errors.firstName }}</span>
        </div>
        <div class="form-group">
          <label>Last Name</label>
          <input v-model="form.lastName" type="text" :class="{ invalid: errors.lastName }" @blur="validateField('lastName')" />
          <span v-if="errors.lastName" class="error">{{ errors.lastName }}</span>
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input v-model="form.email" type="email" :class="{ invalid: errors.email }" @blur="validateField('email')" />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input v-model="form.phone" type="tel" :class="{ invalid: errors.phone }" @blur="validateField('phone')" />
          <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
        </div>
      </section>

      <!-- Professional Information -->
      <section>
        <h3>Professional Information</h3>
        <div class="form-group">
          <label>Specialization</label>
          <input v-model="form.specialization" type="text" :class="{ invalid: errors.specialization }" @blur="validateField('specialization')" />
          <span v-if="errors.specialization" class="error">{{ errors.specialization }}</span>
        </div>
        <div class="form-group">
          <label>Medical License Number</label>
          <input v-model="form.license" type="text" :class="{ invalid: errors.license }" @blur="validateField('license')" />
          <span v-if="errors.license" class="error">{{ errors.license }}</span>
        </div>
        <div class="form-group">
          <label>Years of Experience</label>
          <input v-model="form.experience" type="number" min="0" max="50" :class="{ invalid: errors.experience }" @blur="validateField('experience')" />
          <span v-if="errors.experience" class="error">{{ errors.experience }}</span>
        </div>
      </section>

      <!-- Clinic Address -->
      <section>
        <h3>Clinic Address</h3>
        <div class="form-group">
          <label>Street Address</label>
          <input v-model="form.street" type="text" :class="{ invalid: errors.street }" @blur="validateField('street')" />
          <span v-if="errors.street" class="error">{{ errors.street }}</span>
        </div>
        <div class="form-group">
          <label>City</label>
          <input v-model="form.city" type="text" :class="{ invalid: errors.city }" @blur="validateField('city')" />
          <span v-if="errors.city" class="error">{{ errors.city }}</span>
        </div>
        <div class="form-group">
          <label>State/Province</label>
          <input v-model="form.state" type="text" :class="{ invalid: errors.state }" @blur="validateField('state')" />
          <span v-if="errors.state" class="error">{{ errors.state }}</span>
        </div>
        <div class="form-group">
          <label>ZIP/Postal Code</label>
          <input v-model="form.zip" type="text" :class="{ invalid: errors.zip }" @blur="validateField('zip')" />
          <span v-if="errors.zip" class="error">{{ errors.zip }}</span>
        </div>
      </section>

      <!-- Account Security -->
      <section>
        <h3>Account Security</h3>
        <div class="form-group">
          <label>Password</label>
          <input v-model="form.password" type="password" :class="{ invalid: errors.password }" @blur="validateField('password')" />
          <span v-if="errors.password" class="error">{{ errors.password }}</span>
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input v-model="form.confirmPassword" type="password" :class="{ invalid: errors.confirmPassword }" @blur="validateField('confirmPassword')" />
          <span v-if="errors.confirmPassword" class="error">{{ errors.confirmPassword }}</span>
        </div>
      </section>

      <button type="submit" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        Register
      </button>
      <div v-if="success" class="form-success">
        Registration successful! <a href="#" @click.prevent="goToLogin">Go to Login</a>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as yup from 'yup'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialization: '',
  license: '',
  experience: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  password: '',
  confirmPassword: ''
})

const errors = ref({})
const formError = ref('')
const loading = ref(false)
const success = ref(false)

// Validation schema
const schema = yup.object({
  firstName: yup.string().required('First name is required').min(2).max(50),
  lastName: yup.string().required('Last name is required').min(2).max(50),
  email: yup.string().required('Email is required').email('Invalid email format'),
  phone: yup.string().required('Phone is required').matches(/^\d{10,15}$/, 'Invalid phone number'),
  specialization: yup.string().required('Specialization is required').min(3).max(100),
  license: yup.string().required('Medical license is required').matches(/^[a-zA-Z0-9]+$/, 'Invalid license number'),
  experience: yup.number().required('Experience is required').min(0).max(50),
  street: yup.string().required('Street address is required').max(200),
  city: yup.string().required('City is required').max(100),
  state: yup.string().required('State/Province is required').max(50),
  zip: yup.string().required('ZIP/Postal code is required').matches(/^[a-zA-Z0-9\- ]{3,10}$/, 'Invalid postal code'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'At least one uppercase letter')
    .matches(/[a-z]/, 'At least one lowercase letter')
    .matches(/[0-9]/, 'At least one number')
    .matches(/[^A-Za-z0-9]/, 'At least one special character'),
  confirmPassword: yup.string().required('Confirm password is required')
    .oneOf([yup.ref('password')], 'Passwords must match')
})

function validateField(field) {
  errors.value[field] = ''
  schema.validateAt(field, form.value).catch(e => {
    errors.value[field] = e.message
  })
}

function validateAll() {
  errors.value = {}
  return schema.validate(form.value, { abortEarly: false })
    .then(() => true)
    .catch(e => {
      if (e.inner) {
        e.inner.forEach(err => {
          errors.value[err.path] = err.message
        })
      }
      return false
    })
}

function onSubmit() {
  formError.value = ''
  success.value = false
  loading.value = true
  validateAll().then(valid => {
    if (!valid) {
      formError.value = 'Please fix the errors above.'
      loading.value = false
      return
    }
    // Simulate API call and duplicate check
    setTimeout(() => {
      loading.value = false
      // Simulate duplicate email/license
      if (form.value.email === 'duplicate@email.com') {
        errors.value.email = 'Email already registered'
        formError.value = 'Please fix the errors above.'
        return
      }
      if (form.value.license === 'DUPLICATE123') {
        errors.value.license = 'License number already registered'
        formError.value = 'Please fix the errors above.'
        return
      }
      // Simulate network error
      if (form.value.email === 'network@error.com') {
        formError.value = 'Network error. Please try again.'
        return
      }
      // Success
      success.value = true
      formError.value = ''
    }, 1200)
  })
}

function goToLogin() {
  // Replace with your router logic if needed
  window.location.href = '/login'
}
</script>

<style scoped>
.registration-container {
  max-width: 600px;
  margin: 5vh auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
}
h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}
h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: #1976d2;
  font-size: 1.1rem;
}
.form-group {
  margin-bottom: 1rem;
}
input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="password"] {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
input.invalid {
  border-color: #e74c3c;
}
.error {
  color: #e74c3c;
  font-size: 0.9rem;
}
.form-error {
  color: #e74c3c;
  margin-bottom: 1rem;
  text-align: center;
}
.form-success {
  color: #27ae60;
  margin-top: 1rem;
  text-align: center;
}
button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}
button[type="submit"]:disabled {
  background: #90caf9;
  cursor: not-allowed;
}
.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1976d2;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}
@media (max-width: 700px) {
  .registration-container {
    padding: 1rem;
    margin: 2vh 1vw;
  }
  h2 {
    font-size: 1.3rem;
  }
  button[type="submit"] {
    font-size: 1rem;
    padding: 0.6rem;
  }
}
</style>
