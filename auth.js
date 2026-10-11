/**
 * Foodie Hub - Authentication Engine (Sign In & Sign Up)
 * Handles client-side persistent user state, form validations,
 * demo credentials, social logins, and password security metering.
 */

// --------------------------------------------------------------------------
// 1. Initial Default Demo Users Seed
// --------------------------------------------------------------------------
const DEFAULT_DEMO_USERS = [
    {
        id: "usr-01",
        name: "Sophia Vance",
        email: "sophia.vip@example.com",
        phone: "+91 98765 12345",
        password: "VipChef#99",
        tier: "VIP Connoisseur",
        points: 850,
        createdAt: "2026-01-15"
    },
    {
        id: "usr-02",
        name: "Alex Mercer",
        email: "alex.gourmet@example.com",
        phone: "+91 98111 22334",
        password: "Foodie@2026",
        tier: "Gold Gourmet",
        points: 350,
        createdAt: "2026-02-20"
    }
];

function initUserDatabase() {
    if (!localStorage.getItem('foodie_hub_users')) {
        localStorage.setItem('foodie_hub_users', JSON.stringify(DEFAULT_DEMO_USERS));
    }
}

function getUsersList() {
    try {
        return JSON.parse(localStorage.getItem('foodie_hub_users')) || DEFAULT_DEMO_USERS;
    } catch (e) {
        return DEFAULT_DEMO_USERS;
    }
}

function saveUsersList(users) {
    localStorage.setItem('foodie_hub_users', JSON.stringify(users));
}

function getCurrentUser() {
    try {
        const u = localStorage.getItem('foodie_hub_current_user');
        return u ? JSON.parse(u) : null;
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    localStorage.setItem('foodie_hub_current_user', JSON.stringify(user));
    // Also sync existing user points in foodie_hub_points
    if (user && user.points !== undefined) {
        localStorage.setItem('foodie_hub_points', user.points);
    }
}

// --------------------------------------------------------------------------
// 2. DOM Ready & Event Setup
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initUserDatabase();
    initTabRouting();
    initPasswordToggles();
    initStrengthMeter();
    initDemoLogins();
    initSocialLogins();
    initSignInForm();
    initSignUpForm();
    initForgotPasswordModal();
    updateCartCountBadge();

    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        showToast(`Signed in as ${currentUser.name}. Welcome back!`, 'info');
    }
});

// Update cart counter in top nav
function updateCartCountBadge() {
    try {
        const cart = JSON.parse(localStorage.getItem('foodie_hub_cart')) || [];
        const count = cart.reduce((total, item) => total + (item.qty || 1), 0);
        const badge = document.getElementById('authNavCartBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    } catch (e) {}
}

// --------------------------------------------------------------------------
// 3. Tab Navigation & Hash Management
// --------------------------------------------------------------------------
function switchAuthTab(targetTab) {
    const tabBtns = document.querySelectorAll('.auth-tab-btn');
    const views = document.querySelectorAll('.auth-view');

    tabBtns.forEach(btn => {
        if (btn.dataset.tab === targetTab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    views.forEach(view => {
        if (view.id === `${targetTab}View`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    // Update URL hash without jumping page
    history.replaceState(null, null, `#${targetTab}`);
}

function initTabRouting() {
    const tabBtns = document.querySelectorAll('.auth-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchAuthTab(btn.dataset.tab);
        });
    });

    // Handle hash on initial load
    const hash = window.location.hash.toLowerCase().replace('#', '');
    if (hash === 'signup' || hash === 'register') {
        switchAuthTab('signup');
    } else {
        switchAuthTab('signin');
    }

    // Direct switcher links (e.g. "Don't have an account? Sign Up")
    document.querySelectorAll('[data-switch-to]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthTab(link.dataset.switchTo);
        });
    });
}

// --------------------------------------------------------------------------
// 4. Password Visibility Toggles
// --------------------------------------------------------------------------
function initPasswordToggles() {
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
            }
        });
    });
}

// --------------------------------------------------------------------------
// 5. Password Strength Meter
// --------------------------------------------------------------------------
function initStrengthMeter() {
    const passInput = document.getElementById('signUpPassword');
    const confirmInput = document.getElementById('signUpConfirmPassword');
    const confirmMatchMsg = document.getElementById('confirmPassMatchMsg');

    if (!passInput) return;

    passInput.addEventListener('input', () => {
        const val = passInput.value;
        const score = calculatePasswordStrength(val);
        updateStrengthUI(score, val.length);

        if (confirmInput && confirmInput.value) {
            checkPasswordMatch();
        }
    });

    if (confirmInput) {
        confirmInput.addEventListener('input', checkPasswordMatch);
    }

    function checkPasswordMatch() {
        if (!confirmMatchMsg) return;
        if (!confirmInput.value) {
            confirmMatchMsg.style.display = 'none';
            return;
        }

        if (confirmInput.value === passInput.value) {
            confirmMatchMsg.className = 'field-validation-msg success';
            confirmMatchMsg.innerHTML = '<i class="fa-solid fa-check-circle"></i> Passwords match perfectly.';
            confirmMatchMsg.style.display = 'block';
        } else {
            confirmMatchMsg.className = 'field-validation-msg error';
            confirmMatchMsg.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Passwords do not match yet.';
            confirmMatchMsg.style.display = 'block';
        }
    }
}

function calculatePasswordStrength(password) {
    if (!password) return 0;
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
}

function updateStrengthUI(score, length) {
    const steps = document.querySelectorAll('.strength-step');
    const label = document.getElementById('strengthLabel');

    steps.forEach((step, idx) => {
        step.className = 'strength-step';
        if (length > 0 && idx < score) {
            if (score === 1) step.classList.add('active', 'weak');
            else if (score === 2) step.classList.add('active', 'fair');
            else if (score === 3) step.classList.add('active', 'good');
            else if (score === 4) step.classList.add('active', 'strong');
        }
    });

    if (length === 0) {
        label.textContent = 'None';
        label.className = 'strength-text';
    } else if (score <= 1) {
        label.textContent = 'Weak';
        label.className = 'strength-text weak';
    } else if (score === 2) {
        label.textContent = 'Fair';
        label.className = 'strength-text fair';
    } else if (score === 3) {
        label.textContent = 'Good';
        label.className = 'strength-text good';
    } else {
        label.textContent = 'Very Strong';
        label.className = 'strength-text strong';
    }
}

// --------------------------------------------------------------------------
// 6. 1-Click Demo Accounts Quick-Fill
// --------------------------------------------------------------------------
function initDemoLogins() {
    document.querySelectorAll('.demo-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const email = btn.dataset.demoEmail;
            const pass = btn.dataset.demoPass;

            const emailInput = document.getElementById('signInEmail');
            const passInput = document.getElementById('signInPassword');

            if (emailInput && passInput) {
                emailInput.value = email;
                passInput.value = pass;

                // Visual flash highlight
                emailInput.focus();
                showToast(`Filled credentials for ${btn.textContent.trim()}! Click "Sign In".`, 'info');
            }
        });
    });
}

// --------------------------------------------------------------------------
// 7. Social Login Simulations
// --------------------------------------------------------------------------
function initSocialLogins() {
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.dataset.provider || 'Social';
            showToast(`Connecting to ${provider} authentication...`, 'info');

            setTimeout(() => {
                const socialUser = {
                    id: `usr-soc-${Date.now()}`,
                    name: `${provider} Gourmet Guest`,
                    email: `guest.${provider.toLowerCase()}@foodiehub.com`,
                    phone: "+91 98765 00000",
                    tier: "VIP Silver",
                    points: 250,
                    provider: provider,
                    createdAt: new Date().toISOString()
                };

                completeLoginSuccess(socialUser, `Successfully connected with ${provider}!`);
            }, 1000);
        });
    });
}

// --------------------------------------------------------------------------
// 8. Sign In Form Handler
// --------------------------------------------------------------------------
function initSignInForm() {
    const form = document.getElementById('signInForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('signInEmail').value.trim();
        const password = document.getElementById('signInPassword').value;
        const submitBtn = document.getElementById('signInSubmitBtn');

        if (!email || !password) {
            showToast('Please enter both your email/phone and password.', 'error');
            return;
        }

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        setTimeout(() => {
            const users = getUsersList();
            const user = users.find(u => 
                (u.email.toLowerCase() === email.toLowerCase() || u.phone === email) && 
                u.password === password
            );

            if (user) {
                completeLoginSuccess(user, `Welcome back, ${user.name}!`);
            } else {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                showToast('Invalid credentials. Check email & password or try 1-Click Demo.', 'error');
            }
        }, 850);
    });
}

// --------------------------------------------------------------------------
// 9. Sign Up Form Handler
// --------------------------------------------------------------------------
function initSignUpForm() {
    const form = document.getElementById('signUpForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('signUpName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const phone = document.getElementById('signUpPhone').value.trim();
        const password = document.getElementById('signUpPassword').value;
        const confirmPass = document.getElementById('signUpConfirmPassword').value;
        const agreeTerms = document.getElementById('signUpTerms')?.checked;
        const submitBtn = document.getElementById('signUpSubmitBtn');

        // Validation
        if (!name || !email || !phone || !password) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Please provide a valid email address.', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password should be at least 6 characters long.', 'error');
            return;
        }

        if (password !== confirmPass) {
            showToast('Passwords do not match. Please re-check.', 'error');
            return;
        }

        if (!agreeTerms) {
            showToast('Please agree to the VIP Loyalty program terms.', 'error');
            return;
        }

        const users = getUsersList();
        const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            showToast('An account with this email already exists. Please Sign In.', 'error');
            switchAuthTab('signin');
            return;
        }

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        setTimeout(() => {
            // New user gets 200 Welcome VIP Points!
            const newUser = {
                id: `usr-${Date.now()}`,
                name: name,
                email: email,
                phone: phone,
                password: password,
                tier: "Gold VIP Member",
                points: 200,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            saveUsersList(users);

            completeLoginSuccess(newUser, `🎉 Welcome to Foodie Hub VIP, ${name}! +200 Points credited!`);
        }, 1000);
    });
}

// Complete login & redirect
function completeLoginSuccess(user, message) {
    setCurrentUser(user);
    showToast(message, 'success');

    // Show celebratory modal or transition
    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'index.html';
        window.location.href = redirect;
    }, 1200);
}

// --------------------------------------------------------------------------
// 10. Forgot Password Modal Logic
// --------------------------------------------------------------------------
function initForgotPasswordModal() {
    const modal = document.getElementById('forgotPassModal');
    const openBtn = document.getElementById('forgotPassTrigger');
    const closeBtn = document.getElementById('closeForgotModalBtn');
    const form = document.getElementById('forgotPassForm');
    const sendOtpBtn = document.getElementById('sendResetOtpBtn');
    const resetOtpInputGroup = document.getElementById('resetOtpGroup');
    const resetPassGroup = document.getElementById('resetNewPassGroup');
    const finalResetBtn = document.getElementById('submitNewPasswordBtn');

    if (!modal) return;

    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => {
            const email = document.getElementById('forgotEmailInput').value.trim();
            if (!email) {
                showToast('Please enter your registered email address.', 'error');
                return;
            }

            sendOtpBtn.textContent = 'Sending Code...';
            sendOtpBtn.disabled = true;

            setTimeout(() => {
                sendOtpBtn.textContent = 'Code Sent!';
                resetOtpInputGroup.style.display = 'block';
                resetPassGroup.style.display = 'block';
                finalResetBtn.style.display = 'flex';
                showToast('6-digit reset code sent to your email! (Demo code: 778899)', 'info');

                const otpInput = document.getElementById('resetOtpInput');
                if (otpInput) otpInput.value = '778899';
            }, 800);
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('forgotEmailInput').value.trim();
            const newPass = document.getElementById('newPasswordInput').value;

            if (!newPass || newPass.length < 6) {
                showToast('Password must be at least 6 characters.', 'error');
                return;
            }

            const users = getUsersList();
            const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

            if (userIndex !== -1) {
                users[userIndex].password = newPass;
                saveUsersList(users);
                showToast('Password updated successfully! Please Sign In.', 'success');
            } else {
                showToast('Password updated for this session! Please Sign In.', 'success');
            }

            modal.classList.remove('active');
            switchAuthTab('signin');
            const pInput = document.getElementById('signInPassword');
            if (pInput) pInput.value = newPass;
        });
    }
}

// --------------------------------------------------------------------------
// 11. Toast Notifications
// --------------------------------------------------------------------------
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-solid fa-circle-info text-gold';
    if (type === 'success') icon = 'fa-solid fa-circle-check text-gold';
    if (type === 'error') icon = 'fa-solid fa-circle-exclamation text-gold';

    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3800);
}
