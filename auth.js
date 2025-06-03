// -------------------------
// Card Flip
// -------------------------
const card = document.getElementById('card');

function flipCard() {
  card.classList.toggle('flipped');
}

// Add event listeners to flip buttons
document.querySelectorAll('.switch-to-signup, .switch-to-login').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    flipCard();
  });
});

// Accessibility: Flip card with keyboard
document.getElementById('flip-btn')?.addEventListener('keydown', (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    flipCard();
  }
});

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
// Admin Username Check
// -------------------------
function isAdminUsername(username) {
  return username.toLowerCase().startsWith('@admin');
}

const admins = [
  '@adminjohn',
  '@adminmary',
  '@adminalice',
];

// -------------------------
// Fake API (Replace with Real API)
// -------------------------
async function fakeApiLogin(username, password) {
  if (isAdminUsername(username)) {
    if (!admins.includes(username.toLowerCase())) {
      throw new Error("Admin account does not exist.");
    }
    if (password.length === 0) {
      throw new Error("Password is required.");
    }
    return { user: { username, role: 'admin' } };
  }

  if (username.length >= 3 && password.length > 0) {
    return { user: { username, role: 'user' } };
  } else {
    throw new Error("Invalid username or password.");
  }
}

async function fakeApiSignup(username, email, password) {
  if (isAdminUsername(username)) {
    throw new Error("Admin accounts cannot be created by signup.");
  }
  if (username.length >= 3 && password.length >= 8) {
    return { user: { username, email, role: 'user' } };
  } else {
    throw new Error("Invalid signup details.");
  }
}

// -------------------------
// Login Handler
// -------------------------
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!validateInput(usernameInput) || !validateInput(passwordInput)) {
    alert("Please enter valid username and password.");
    return;
  }

  if (isAdminUsername(username) && !admins.includes(username.toLowerCase())) {
    alert("Admin account does not exist.");
    return;
  }

  try {
    const result = await fakeApiLogin(username, password);
    alert(`Welcome ${result.user.role} ${result.user.username}! Login successful.`);
    window.location.href = "index.html";
  } catch (err) {
    alert(err.message);
  }
});

// -------------------------
// Signup Handler
// -------------------------
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usernameInput = document.getElementById('signup-username');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!validateInput(usernameInput) || !validateInput(emailInput) || !validateInput(passwordInput)) {
    alert("Please fill in valid signup details.");
    return;
  }

  if (isAdminUsername(username)) {
    alert("Admin accounts cannot be created via signup.");
    return;
  }

  try {
    const result = await fakeApiSignup(username, email, password);
    alert(`Signup successful! Welcome ${result.user.username}. Please login.`);
    flipCard(); // Flip to login
    usernameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
  } catch (err) {
    alert(err.message);
  }
});

// -------------------------
// Password Strength Update
// -------------------------
const signupPasswordInput = document.getElementById('signup-password');
const strengthMeter = document.getElementById('strength-meter');
const strengthFeedback = document.getElementById('strength-feedback');

signupPasswordInput.addEventListener('input', () => {
  updateStrengthMeter(signupPasswordInput, strengthMeter, strengthFeedback);
});

// -------------------------
// Setup Tooltips
// -------------------------
setupTooltip(document.getElementById('signup-username'), "3-20 chars: letters, numbers, underscore.");
setupTooltip(document.getElementById('signup-email'), "Enter a valid email address.");
setupTooltip(document.getElementById('signup-password'), "Min 8 chars, mix case, numbers, special chars.");
setupTooltip(document.getElementById('login-username'), "Enter your username.");
setupTooltip(document.getElementById('login-password'), "Enter your password.");

const passwordInput = document.getElementById("password");
const strengthText = document.getElementById("password-strength-text");
const strengthBar = document.getElementById("password-strength-bar");

if (passwordInput) {
  passwordInput.addEventListener("input", () => {
    const strength = getPasswordStrength(passwordInput.value);
    updatePasswordStrengthUI(strength);
  });
}

function getPasswordStrength(password) {
  if (!password) return 0;

  let strength = 0;

  if (password.length >= 6) strength += 1;
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
  if (password.match(/[0-9]/)) strength += 1;
  if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

  return strength;
}

function updatePasswordStrengthUI(strength) {
  const strengths = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  const colors = ["#ccc", "#ff4d4d", "#ffa500", "#00cc66", "#007bff"];
  const widths = ["20%", "40%", "60%", "80%", "100%"];

  strengthText.innerText = strengths[strength];
  strengthText.style.color = colors[strength];
  strengthBar.style.width = widths[strength];
  strengthBar.style.backgroundColor = colors[strength];
}

