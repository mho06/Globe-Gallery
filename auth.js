// Add this at the top of auth.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enlujcfoktovgfvxnrqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubHVqY2Zva3RvdmdmdnhucnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODY2MDYsImV4cCI6MjA2NDQ2MjYwNn0.esnA0u8NZFk-_v1upWFgz__YEFuxJFxiTZpxA9kSo3s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// -------------------------
// Signup Handler
// -------------------------
async function signupUser(username, email, password) {
  if (username.startsWith('@admin')) {
    alert('Admin accounts cannot be created via signup.');
    return false;
  }

  // Signup with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert('Signup error: ' + error.message);
    return false;
  }

  // After signup, insert user record into your "users" table with username and role = 'user'
  const { error: insertError } = await supabase
    .from('users')
    .insert([
      { id: data.user.id, username, email, role: 'user' }
    ]);

  if (insertError) {
    alert('Error saving user data: ' + insertError.message);
    return false;
  }

  alert('Signup successful! Please check your email for verification.');
  return true;
}

// -------------------------
// Login Handler
// -------------------------
async function loginUser(username, password) {
  if (username.startsWith('@admin')) {
    // Admin login flow: check if admin user exists in users table
    const { data: admins, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('role', 'admin')
      .limit(1);

    if (error) {
      alert('Error checking admin user: ' + error.message);
      return false;
    }
    if (admins.length === 0) {
      alert('Admin account does not exist.');
      return false;
    }

    // Admin login with Supabase Auth
    // NOTE: Supabase Auth uses email for login, so you must fetch admin's email from users table
    const adminEmail = admins[0].email;
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password,
    });

    if (loginError) {
      alert('Login failed: ' + loginError.message);
      return false;
    }

    alert('Admin login successful!');
    return true;

  } else {
    // Normal user login with Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email: username,  // Here username is email for normal users (or you can add lookup)
      password,
    });

    if (error) {
      alert('Login failed: ' + error.message);
      return false;
    }

    alert('User login successful!');
    return true;
  }
}

// -------------------------
// Example usage on form submit
// -------------------------
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = e.target.elements['login-username'].value.trim();
  const password = e.target.elements['login-password'].value;

  const success = await loginUser(username, password);
  if(success) {
    // redirect or show logged in UI
  }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = e.target.elements['signup-username'].value.trim();
  const email = e.target.elements['signup-email'].value.trim();
  const password = e.target.elements['signup-password'].value;

  const success = await signupUser(username, email, password);
  if(success) {
    // redirect or show signup success message
  }
});



// -------------------------
// Card Flip
// -------------------------
const card = document.getElementById('card');
function flipCard() {
  card.classList.toggle('flipped');
}

// -------------------------
// Toggle Password Visibility
// -------------------------
function togglePassword(toggleSelector, inputSelector) {
  const toggle = document.querySelector(toggleSelector);
  const input = document.querySelector(inputSelector);
  let visible = false;

  function setIcon() {
    toggle.innerHTML = visible
      ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" width="20" height="20" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7
                     a19.998 19.998 0 014.22-5.28M9.9 9.9a3 3 0 104.2 4.2M1 1l22 22"/>
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" width="20" height="20" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.522 5 12 5
                     c4.478 0 8.268 2.943 9.542 7
                     -1.274 4.057-5.064 7-9.542 7
                     -4.478 0-8.268-2.943-9.542-7z"/>
         </svg>`;
  }

  toggle.setAttribute('tabindex', '0');
  toggle.addEventListener('click', () => {
    visible = !visible;
    input.type = visible ? 'text' : 'password';
    setIcon();
  });

  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      visible = !visible;
      input.type = visible ? 'text' : 'password';
      setIcon();
    }
  });

  setIcon();
}

togglePassword('.login-toggle', '.login-password');
togglePassword('.signup-toggle', '.signup-password');

// -------------------------
// Basic Validation
// -------------------------
function validateInput(input) {
  const value = input.value.trim();
  let valid = false;

  if (input.name === 'username') {
    valid = /^[a-zA-Z0-9_]{3,20}$/.test(value);
  } else if (input.name === 'email') {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  } else if (input.classList.contains('signup-password')) {
    valid = value.length >= 8;
  } else if (input.name === 'login-password') {
    valid = value.length > 0;
  }

  return valid;
}

// -------------------------
// Password Strength Meter
// -------------------------
function getPasswordStrength(password) {
  let score = 0;
  if (!password) return score;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

function updateStrengthMeter(input, meterElement, feedbackElement) {
  const val = input.value;
  const score = getPasswordStrength(val);

  const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Great password!"];
  const colors = ["#ff4d4d", "#ff9933", "#f1c40f", "#66cc66", "#00e68a"];

  const percent = Math.min((score / 5) * 100, 100);
  meterElement.style.width = percent + "%";
  meterElement.style.backgroundColor = colors[score - 1] || "#ccc";
  feedbackElement.textContent = val.length === 0 ? "" : strengthLabels[score - 1] || "";
}

// -------------------------
// Input Tooltips
// -------------------------
function setupTooltip(input, message) {
  let tooltip = input.parentElement.querySelector('.tooltip-text');
  if (!tooltip) {
    tooltip = document.createElement('span');
    tooltip.className = 'tooltip-text';
    tooltip.textContent = message;
    Object.assign(tooltip.style, {
      position: 'absolute',
      backgroundColor: '#333',
      color: '#fff',
      padding: '5px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      whiteSpace: 'nowrap',
      visibility: 'hidden',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      bottom: '10px',
    });
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(tooltip);
  }

  input.addEventListener('focus', () => {
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
  });
  input.addEventListener('blur', () => {
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
  });
}

// -------------------------
// Signup Username Admin Check - prevent creating @admin users
// -------------------------
function isAdminUsername(username) {
  return username.toLowerCase().startsWith('@admin');
}

// -------------------------
// Mock admin user data (for demo, replace with real backend check)
// -------------------------
const admins = [
  '@adminjohn',
  '@adminmary',
  '@adminalice',
];

// -------------------------
// Fake API for login/signup (replace with your actual auth API logic)
// -------------------------
async function fakeApiLogin(username, password) {
  // Admin login: username must be in admins list and password must not be empty
  if (isAdminUsername(username)) {
    if (!admins.includes(username.toLowerCase())) {
      throw new Error("Admin account does not exist.");
    }
    if (password.length === 0) {
      throw new Error("Password is required.");
    }
    // Assume success for demo
    return { user: { username, role: 'admin' } };
  }

  // User login: username and password non-empty (replace with real check)
  if (username.length >= 3 && password.length > 0) {
    return { user: { username, role: 'user' } };
  } else {
    throw new Error("Invalid username or password.");
  }
}

async function fakeApiSignup(username, email, password) {
  // Prevent signup if username is admin-type
  if (isAdminUsername(username)) {
    throw new Error("Admin accounts cannot be created by signup.");
  }
  // Mock success signup
  if (username.length >= 3 && password.length >= 8) {
    return { user: { username, email, role: 'user' } };
  } else {
    throw new Error("Invalid signup details.");
  }
}

// -------------------------
// Handle Login Submit
// -------------------------
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  // Basic validation
  if (!validateInput(usernameInput) || !validateInput(passwordInput)) {
    alert("Please enter valid username and password.");
    return;
  }

  // Admin username check: must start with @admin and exist in admins list
  if (isAdminUsername(username) && !admins.includes(username.toLowerCase())) {
    alert("Admin account does not exist.");
    return;
  }

  try {
    const result = await fakeApiLogin(username, password);
    alert(`Welcome ${result.user.role} ${result.user.username}! Login successful.`);
    // Redirect or do post-login actions here
    window.location.href = "index.html"; // example redirect
  } catch (err) {
    alert(err.message);
  }
});

// -------------------------
// Handle Signup Submit
// -------------------------
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usernameInput = document.getElementById('signup-username');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Basic validation
  if (!validateInput(usernameInput) || !validateInput(emailInput) || !validateInput(passwordInput)) {
    alert("Please fill in valid signup details.");
    return;
  }

  // Prevent signup if username is admin-type
  if (isAdminUsername(username)) {
    alert("Admin accounts cannot be created via signup.");
    return;
  }

  try {
    const result = await fakeApiSignup(username, email, password);
    alert(`Signup successful! Welcome ${result.user.username}. Please login.`);
    flipCard(); // flip to login after signup
    // Optionally reset signup form
    usernameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
  } catch (err) {
    alert(err.message);
  }
});

// -------------------------
// Password strength update
// -------------------------
const signupPasswordInput = document.getElementById('signup-password');
const strengthMeter = document.getElementById('strength-meter');
const strengthFeedback = document.getElementById('strength-feedback');

signupPasswordInput.addEventListener('input', () => {
  updateStrengthMeter(signupPasswordInput, strengthMeter, strengthFeedback);
});

// -------------------------
// Setup input tooltips
// -------------------------
setupTooltip(document.getElementById('signup-username'), "3-20 chars: letters, numbers, underscore.");
setupTooltip(document.getElementById('signup-email'), "Enter a valid email address.");
setupTooltip(document.getElementById('signup-password'), "Min 8 chars, mix case, numbers, special chars.");
setupTooltip(document.getElementById('login-username'), "Enter your username.");
setupTooltip(document.getElementById('login-password'), "Enter your password.");

// -------------------------
// Accessibility: Flip card with keyboard
// -------------------------
document.getElementById('flip-btn').addEventListener('keydown', (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    flipCard();
  }
});
