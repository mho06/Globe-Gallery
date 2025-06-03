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
// Init on DOMContentLoaded
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  const signupPassword = document.getElementById("signup-password");
  const strengthBar = document.querySelector(".password-strength > div");
  const feedbackText = document.getElementById("password-feedback");

  document.querySelectorAll("input").forEach(input => {
    if (input.name === 'username') {
      setupTooltip(input, '3-20 characters: letters, numbers, underscore.');
    } else if (input.name === 'email') {
      setupTooltip(input, 'Enter a valid email address.');
    } else if (input.classList.contains('signup-password')) {
      setupTooltip(input, 'At least 8 chars with uppercase, lowercase, number & symbol.');
    } else if (input.name === 'login-password') {
      setupTooltip(input, 'Enter your password.');
    }

    input.addEventListener("input", () => {
      validateInput(input);

      // Only apply strength logic for signup password
      if (input === signupPassword) {
        updateStrengthMeter(signupPassword, strengthBar, feedbackText);
      }
    });

    // Initial check
    validateInput(input);
  });
});
