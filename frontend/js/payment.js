




const pricingPlans = {
  basic: {
    name: 'BASIC',
    price: 49.99,
    duration: '1 Month',
    features: [
      'Access to all gym equipment',
      'Unlimited training time',
      '1 free entry for a friend'
    ]
  },
  plus: {
    name: 'PLUS',
    price: 99.99,
    duration: '1 Month',
    features: [
      'All benefits from BASIC',
      'Specialised programs',
      '2 personal training sessions',
      'Preorders on eshop'
    ]
  },
  vip: {
    name: 'VIP',
    price: 199.99,
    duration: '1 Month',
    features: [
      'All benefits from PLUS',
      'Unlimited personal training',
      'VIP discounts on all services',
      'VIP access to events'
    ]
  }
};

function planFeaturesFromEntity(p) {
  const lines = [];
  if (p.description) lines.push(String(p.description));
  if (p.classesIncluded != null) lines.push(`${p.classesIncluded} classes included`);
  if (p.personalTrainingIncluded) lines.push('Personal training included');
  if (p.durationDays != null) lines.push(`Duration: ${p.durationDays} days`);
  return lines.length ? lines : ['Membership plan'];
}

function planFromEntity(p) {
  return {
    id: p.id,
    name: p.name || 'Plan',
    price: p.price != null ? Number(p.price) : 0,
    duration: p.durationDays != null ? `${p.durationDays} days` : 'Membership',
    features: planFeaturesFromEntity(p)
  };
}

async function loadPlansCatalog() {
  if (window._apexPlansCatalog) return window._apexPlansCatalog;
  const data = await apiFetchPublic('/api/payments/plans/active');
  window._apexPlansCatalog = Array.isArray(data) ? data : [];
  return window._apexPlansCatalog;
}

async function loadPaymentMethodsCatalog() {
  if (window._apexPaymentMethods) return window._apexPaymentMethods;
  const data = await apiFetchPublic('/api/payments/methods/active');
  window._apexPaymentMethods = Array.isArray(data) ? data : [];
  return window._apexPaymentMethods;
}

async function getPlanFromURL() {
  const params = new URLSearchParams(window.location.search);
  const planId = params.get('planId');
  const catalog = await loadPlansCatalog();
  if (planId && catalog.length) {
    const match = catalog.find((p) => String(p.id) === String(planId));
    if (match) return planFromEntity(match);
  }
  const slug = (params.get('plan') || 'basic').toLowerCase();
  const byName = catalog.find((p) => (p.name || '').toLowerCase() === slug);
  if (byName) return planFromEntity(byName);
  return pricingPlans[slug] || pricingPlans.basic;
}


document.addEventListener('DOMContentLoaded', async () => {
  const selectedPlan = await getPlanFromURL();
  loadPlanData(selectedPlan);
  await loadPaymentMethodsCatalog();
  setupPaymentMethods();
  setupFormHandlers();
  setupLanguageSwitcher();
  applyTranslations(document.documentElement.lang || 'en');
});


function loadPlanData(planId) {
  const plan = pricingPlans[planId];
  
  if (!plan) {
    console.error('Plan not found');
    return;
  }

  
  document.getElementById('summaryPlanName').textContent = plan.name;
  document.getElementById('summaryDuration').textContent = plan.duration;
  document.getElementById('summaryPrice').textContent = `$${plan.price.toFixed(2)}`;

  
  const featuresContainer = document.getElementById('summaryFeatures');
  featuresContainer.innerHTML = '';
  plan.features.forEach(feature => {
    const featureEl = document.createElement('div');
    featureEl.className = 'feature-item';
    featureEl.innerHTML = `
      <i class="bi bi-check-circle"></i>
      <span>${feature}</span>
    `;
    featuresContainer.appendChild(featureEl);
  });

  
  window.selectedPlan = { id: planId, ...plan };
}


function setupPaymentMethods() {
  // Try to load payment methods from catalog if available
  const methods = window._apexPaymentMethods;
  if (Array.isArray(methods) && methods.length > 0) {
    populatePaymentMethodsFromCatalog(methods);
  }

  const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
  
  paymentOptions.forEach(option => {
    option.addEventListener('change', (e) => {
      const method = e.target.value;
      updatePaymentMethodDisplay(method);
    });
  });

  
  updatePaymentMethodDisplay('card');
}

function populatePaymentMethodsFromCatalog(methods) {
  // Map backend payment method types to HTML element IDs
  const typeMap = {
    'CARD': 'cardMethod',
    'EWALLET': 'ewalletMethod',
    'BANK_TRANSFER': 'instapayMethod',
    'CASH': 'cashMethod'
  };

  // Show/hide methods based on what's available from backend
  const availableMethods = new Set();
  methods.forEach(method => {
    if (method.isActive) {
      availableMethods.add(method.type);
    }
  });

  // Hide methods that aren't in the backend catalog
  Object.values(typeMap).forEach(elementId => {
    const el = document.getElementById(elementId);
    if (el) {
      const methodType = elementId.replace('Method', '').toUpperCase();
      if (methodType === 'INSTAPAY') {
        el.style.display = availableMethods.has('BANK_TRANSFER') ? 'block' : 'block';
      } else {
        el.style.display = availableMethods.has(methodType) ? 'block' : 'block';
      }
    }
  });
}


function updatePaymentMethodDisplay(method) {
  
  document.querySelectorAll(
    '.card-form-container, .ewallet-form-container, .instapay-form-container, .cash-form-container'
  ).forEach(el => {
    el.style.display = 'none';
  });

  
  const containerMap = {
    card: 'cardFormContainer',
    ewallet: 'ewalletFormContainer',
    instapay: 'instapayFormContainer',
    cash: 'cashFormContainer'
  };

  const containerId = containerMap[method];
  if (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.style.display = 'block';
    }
  }
}


function setupFormHandlers() {
  const completeBtn = document.getElementById('completeBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');

  completeBtn.addEventListener('click', handlePaymentCompletion);
  cancelBtn.addEventListener('click', handleCancel);
  closeModalBtn.addEventListener('click', handleCloseModal);

  
  const cardNumberInput = document.querySelector('input[placeholder="1234 5678 9012 3456"]');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s/g, '');
      let formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
      e.target.value = formattedValue;
    });
  }

  
  const expiryInput = document.querySelector('input[placeholder="MM/YY"]');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      e.target.value = value;
    });
  }
}


function validateCustomerInfo() {
  const name = document.getElementById('customerName').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const age = document.getElementById('customerAge').value;
  const address = document.getElementById('customerAddress').value.trim();
  const termsCheckbox = document.getElementById('termsCheckbox').checked;

  if (!name || !email || !phone || !age || !address) {
    showNotification('Please fill in all customer information fields', 'error');
    return false;
  }

  if (!isValidEmail(email)) {
    showNotification('Please enter a valid email address', 'error');
    return false;
  }

  if (age < 18) {
    showNotification('You must be at least 18 years old', 'error');
    return false;
  }

  if (!termsCheckbox) {
    showNotification('Please agree to the terms and conditions', 'error');
    return false;
  }

  return true;
}


function validatePaymentMethod() {
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (selectedMethod === 'card') {
    const cardHolder = document.querySelector('.card-form input[placeholder="John Doe"]').value.trim();
    const cardNumber = document.querySelector('.card-form input[placeholder="1234 5678 9012 3456"]').value.trim();
    const expiryDate = document.querySelector('.card-form input[placeholder="MM/YY"]').value.trim();
    const cvv = document.querySelector('.card-form input[placeholder="123"]').value.trim();

    if (!cardHolder || !cardNumber || !expiryDate || !cvv) {
      showNotification('Please fill in all card details', 'error');
      return false;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      showNotification('Card number must be 16 digits', 'error');
      return false;
    }

    if (cvv.length !== 3) {
      showNotification('CVV must be 3 digits', 'error');
      return false;
    }
  } else if (selectedMethod === 'ewallet') {
    const phone = document.querySelector('.ewallet-form input[placeholder="+20 123 456 7890"]').value.trim();
    if (!phone) {
      showNotification('Please enter your phone number', 'error');
      return false;
    }
  } else if (selectedMethod === 'instapay') {
    const accountNumber = document.querySelector('.instapay-form input[placeholder="1234567890"]').value.trim();
    const bankName = document.querySelector('.instapay-form select').value;

    if (!accountNumber || !bankName) {
      showNotification('Please fill in all InstaPay details', 'error');
      return false;
    }
  }

  return true;
}


function handlePaymentCompletion() {
  if (!validateCustomerInfo()) {
    return;
  }

  if (!validatePaymentMethod()) {
    return;
  }

  
  const paymentData = collectPaymentData();

  
  console.log('Payment Data:', paymentData);

  
  showSuccessModal();

  
  
  
  
  
  
  
}


function collectPaymentData() {
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  const customerData = {
    name: document.getElementById('customerName').value,
    email: document.getElementById('customerEmail').value,
    phone: document.getElementById('customerPhone').value,
    age: document.getElementById('customerAge').value,
    address: document.getElementById('customerAddress').value
  };

  const paymentData = {
    plan: window.selectedPlan,
    paymentMethod: selectedMethod,
    customer: customerData,
    timestamp: new Date().toISOString()
  };

  
  if (selectedMethod === 'card') {
    paymentData.cardDetails = {
      holder: document.querySelector('.card-form input[placeholder="John Doe"]').value,
      number: document.querySelector('.card-form input[placeholder="1234 5678 9012 3456"]').value,
      expiry: document.querySelector('.card-form input[placeholder="MM/YY"]').value
    };
  } else if (selectedMethod === 'ewallet') {
    paymentData.ewalletDetails = {
      provider: document.querySelector('input[name="walletProvider"]:checked').value,
      phone: document.querySelector('.ewallet-form input[placeholder="+20 123 456 7890"]').value
    };
  } else if (selectedMethod === 'instapay') {
    paymentData.instaPayDetails = {
      accountNumber: document.querySelector('.instapay-form input[placeholder="1234567890"]').value,
      bank: document.querySelector('.instapay-form select').value
    };
  } else if (selectedMethod === 'cash') {
    paymentData.cashDetails = {
      paymentLocation: 'gym'
    };
  }

  return paymentData;
}


function showSuccessModal() {
  const modal = document.getElementById('successModal');
  modal.classList.add('active');
}


function handleCloseModal() {
  window.location.href = 'index.html';
}


function handleCancel() {
  if (confirm('Are you sure you want to cancel this payment?')) {
    window.location.href = 'index.html#pricing';
  }
}


function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'error' ? '#ff4444' : '#ffffff'};
    color: ${type === 'error' ? '#ffffff' : '#000000'};
    padding: 15px 25px;
    border-radius: 8px;
    font-weight: 700;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    max-width: 400px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideInLeft 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}


function setupLanguageSwitcher() {
  const langOptions = document.querySelectorAll('.lang-option');

  langOptions.forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.getAttribute('data-lang');
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

      
      document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.remove('active');
      });
      option.classList.add('active');

      
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.textContent = lang === 'ar' ? 'AR' : 'EN';
      });

      
      applyTranslations(lang);
    });
  });
}


function applyTranslations(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = getTranslation(key, lang);
    if (translation) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    }
  });
}


function getTranslation(key, lang) {
  if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  return null;
}


window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});
