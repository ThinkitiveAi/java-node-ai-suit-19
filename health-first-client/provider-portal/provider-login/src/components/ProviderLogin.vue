<template>
  <div class="login-container">
    <form @submit.prevent="onSubmit" novalidate>
      <h2>Provider Login</h2>
      <div class="form-group">
        <label for="credential">Email or Phone</label>
        <input
          id="credential"
          v-model="credential"
          :class="{ invalid: errors.credential }"
          type="text"
          placeholder="Enter email or phone"
          @input="validateCredential"
        />
        <span v-if="errors.credential" class="error">{{ errors.credential }}</span>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <div class="password-wrapper">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :class="{ invalid: errors.password }"
            placeholder="Enter password"
            @input="validatePassword"
          />
          <button type="button" class="toggle" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>
      <div class="form-options">
        <label>
          <input type="checkbox" v-model="rememberMe" />
          Remember Me
        </label>
        <a href="#" @click.prevent="onForgotPassword">Forgot Password?</a>
      </div>
      <button type="submit" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        Login
      </button>
      <div v-if="formError" class="form-error">{{ formError }}</div>
      <div v-if="success" class="form-success">Login successful! Redirecting...</div>
    </form>
    <!-- Registration Button -->
    <div class="register-link">
      <button @click="goToRegister" type="button">Create an Account</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as yup from 'yup'
import { useRouter } from 'vue-router'

const credential = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errors = ref({})
const formError = ref('')
const success = ref(false)

function validateCredential() {
  errors.value.credential = ''
  if (!credential.value) {
    errors.value.credential = 'Credential is required'
  } else if (credential.value.includes('@')) {
    // Email validation
    const emailSchema = yup.string().email('Invalid email format')
    try {
      emailSchema.validateSync(credential.value)
    } catch (e) {
      errors.value.credential = e.message
    }
  } else {
    // Phone validation (simple)
    const phoneSchema = yup
      .string()
      .matches(/^\d{10,15}$/, 'Invalid phone number')
    try {
      phoneSchema.validateSync(credential.value)
    } catch (e) {
      errors.value.credential = e.message
    }
  }
}

function validatePassword() {
  errors.value.password = ''
  if (!password.value) {
    errors.value.password = 'Password is required'
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }
}

function onForgotPassword() {
  alert('Redirect to password recovery')
}

function onSubmit() {
  validateCredential()
  validatePassword()
  if (errors.value.credential || errors.value.password) return

  loading.value = true
  formError.value = ''
  success.value = false

  // Simulate API call
  setTimeout(() => {
    loading.value = false
    // Simulate error/success
    if (credential.value === 'locked@provider.com') {
      formError.value = 'Account locked/suspended'
    } else if (credential.value === 'notfound@provider.com') {
      formError.value = 'Account not found'
    } else if (password.value !== 'password123') {
      formError.value = 'Wrong password'
    } else {
      success.value = true
      setTimeout(() => {
        // Simulate redirect
        window.location.href = '/dashboard'
      }, 1500)
    }
  }, 1200)
}

const router = useRouter()
function goToRegister() {
  router.push('/register')
}
</script>

<style scoped>
/* Responsive, clean styles */
.login-container {
  max-width: 400px;
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
.form-group {
  margin-bottom: 1rem;
}
input[type="text"], input[type="password"] {
  width: 100%;
  padding: 0.75rem;
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
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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
.password-wrapper {
  display: flex;
  align-items: center;
}
.password-wrapper .toggle {
  margin-left: 0.5rem;
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
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
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
.form-error {
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
}
.form-success {
  color: #27ae60;
  margin-top: 1rem;
  text-align: center;
}
.register-link {
  margin-top: 1.5rem;
  text-align: center;
}
.register-link button {
  background: none;
  border: none;
  color: #1976d2;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.5rem 1rem;
}
.register-link button:hover {
  color: #0d47a1;
}
@media (max-width: 600px) {
  .login-container {
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