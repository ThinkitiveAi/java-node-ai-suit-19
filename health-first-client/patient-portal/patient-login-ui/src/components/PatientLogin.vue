<template>
  <div class="patient-login-container">
    <div class="login-card">
      <h2 class="welcome">Welcome to Your Health Portal</h2>
      <form @submit.prevent>
        <div class="form-group">
          <label for="identifier">Email or Phone Number</label>
          <input
            id="identifier"
            v-model="identifier"
            :class="{'invalid': identifierTouched && !isIdentifierValid}"
            type="text"
            placeholder="e.g. john@email.com or 555-123-4567"
            @input="onIdentifierInput"
            @blur="identifierTouched = true"
            autocomplete="username"
            required
          />
          <div v-if="identifierTouched && !isIdentifierValid" class="error-msg">
            Please enter a valid email or phone number.
          </div>
        </div>
        <div class="form-group password-group">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :class="{'invalid': passwordTouched && !password}"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
              @focus="passwordFocused = true"
              @blur="onPasswordBlur"
              style="padding-right: 2.5rem;"
            />
            <button
              type="button"
              class="show-hide"
              @click="toggleShowPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              tabindex="0"
            >
              <span v-if="showPassword" aria-hidden="true">🙈</span>
              <span v-else aria-hidden="true">👁️</span>
            </button>
          </div>
          <div v-if="passwordTouched && !password" class="error-msg">
            Password is required.
          </div>
        </div>
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            Remember Me
          </label>
          <a href="#" class="forgot-password">Forgot Password?</a>
        </div>
        <button
          class="login-btn"
          :disabled="!canSubmit"
          type="submit"
        >
          Log In
        </button>
        <div v-if="errorMsg" class="error-msg main-error">
          {{ errorMsg }}
          <template v-if="errorType === 'password'">
            <a href="#" class="reset-link">Reset Password</a>
          </template>
          <template v-else-if="errorType === 'notfound'">
            <span>Check your email/phone or <a href="#" class="register-link">register</a>.</span>
          </template>
        </div>
        <div class="register-section">
          <span>Don't have an account?</span>
          <router-link to="/register" class="register-btn">Register</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PatientLogin',
  data() {
    return {
      identifier: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      identifierTouched: false,
      passwordTouched: false,
      passwordFocused: false,
      errorMsg: '',
      errorType: '', // 'password' | 'notfound'
    };
  },
  computed: {
    isIdentifierValid() {
      // Simple email or phone validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^\+?\d{10,15}$/;
      return emailPattern.test(this.identifier) || phonePattern.test(this.identifier.replace(/[-\s()]/g, ''));
    },
    canSubmit() {
      return this.isIdentifierValid && this.password;
    },
  },
  methods: {
    toggleShowPassword() {
      this.showPassword = !this.showPassword;
    },
    onIdentifierInput() {
      this.identifierTouched = true;
      this.errorMsg = '';
      this.errorType = '';
    },
    // Placeholder for error handling logic
    showError(type) {
      if (type === 'password') {
        this.errorMsg = 'Incorrect password. Please try again or reset your password.';
        this.errorType = 'password';
      } else if (type === 'notfound') {
        this.errorMsg = 'Account not found.';
        this.errorType = 'notfound';
      } else {
        this.errorMsg = '';
        this.errorType = '';
      }
    },
    onPasswordBlur() {
      this.passwordFocused = false;
      this.passwordTouched = true;
    },
  },
};
</script>

<style scoped>
.patient-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #f8fafc 100%);
}
.login-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2.5rem 2rem 2rem 2rem;
  max-width: 370px;
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
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
input[type="text"],
input[type="password"] {
  padding: 0.7rem 1rem;
  border: 1.5px solid #b2dfdb;
  border-radius: 7px;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
input.invalid {
  border-color: #e57373;
}
.error-msg {
  color: #e57373;
  font-size: 0.92rem;
  margin-top: 0.1rem;
}
.password-group {
  position: relative;
}
.password-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}
.password-wrapper input[type="password"],
.password-wrapper input[type="text"] {
  width: 100%;
  box-sizing: border-box;
  padding-right: 2.5rem;
}
.show-hide {
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.3rem;
  color: #00796b;
  outline: none;
  padding: 0.3rem 0.5rem;
  display: flex;
  align-items: center;
  height: 2.2rem;
  width: 2.2rem;
  justify-content: center;
}
.password-wrapper input:focus {
  border-color: #4dd0e1;
  box-shadow: 0 0 0 2px #b2ebf2;
}
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.remember-me {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.98rem;
}
.forgot-password {
  color: #00796b;
  text-decoration: underline;
  font-size: 0.98rem;
  cursor: pointer;
}
.login-btn {
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
.login-btn:disabled {
  background: #b2dfdb;
  cursor: not-allowed;
}
.main-error {
  margin-top: 0.7rem;
  text-align: center;
}
.reset-link, .register-link {
  color: #00796b;
  text-decoration: underline;
  margin-left: 0.3rem;
  cursor: pointer;
}
.register-section {
  margin-top: 1.2rem;
  text-align: center;
  font-size: 1rem;
}
.register-btn {
  display: inline-block;
  margin-left: 0.4rem;
  color: #fff;
  background: #00796b;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}
.register-btn:hover {
  background: #004d40;
}
@media (max-width: 600px) {
  .login-card {
    padding: 1.5rem 0.7rem 1.2rem 0.7rem;
    max-width: 98vw;
  }
}
</style> 