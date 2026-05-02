




const classesData = {
  hiit: {
    id: 'hiit',
    name: 'HIIT Training',
    category: 'High Intensity',
    level: 'Advanced',
    image: 'images/hero-apex-coming-soon.jpg',
    duration: '45 Min',
    calories: '450-550',
    capacity: '20 People',
    description: 'Intense interval training combining cardio and strength exercises for maximum calorie burn and metabolic boost.',
    fullDescription: 'High-Intensity Interval Training (HIIT) is a cardiovascular exercise strategy alternating short periods of intense anaerobic exercise with less intense recovery periods. This class is designed to push your limits and maximize results in minimal time.',
    trainer: {
      id: 'matthew',
      name: 'Matthew Johnson',
      specialty: 'Strength Coach',
      image: 'images/trainer-matthew.jpg',
      bio: 'Dedicated fitness professional with 12+ years of experience in high-intensity training and performance coaching.',
      rating: '4.9/5',
      clients: '500+ Clients',
      certs: '4 Certifications'
    },
    schedule: [
      { day: 'Monday', times: ['07:00 AM', '06:00 PM'] },
      { day: 'Wednesday', times: ['09:00 AM', '07:00 PM'] },
      { day: 'Friday', times: ['08:00 AM', '05:00 PM'] },
      { day: 'Saturday', times: ['10:00 AM', '04:00 PM'] }
    ],
    benefits: [
      { title: 'Cardiovascular Strength', desc: 'Improve your heart health and endurance with intense interval training.' },
      { title: 'Maximum Calorie Burn', desc: 'Burn up to 550 calories in a single 45-minute session.' },
      { title: 'Metabolism Boost', desc: 'Experience the afterburn effect that lasts for hours post-workout.' },
      { title: 'Full Body Workout', desc: 'Engage every muscle group in a comprehensive training session.' }
    ],
    equipment: [
      { name: 'Dumbbells', desc: 'Various weights available' },
      { name: 'Exercise Mat', desc: 'Provided by gym' },
      { name: 'Resistance Bands', desc: 'All resistance levels' },
      { name: 'Water Bottle', desc: 'Bring your own' }
    ]
  },
  yoga: {
    id: 'yoga',
    name: 'Yoga Flow',
    category: 'Mind & Body',
    level: 'Beginner to Intermediate',
    image: 'images/hero-apex-coming-soon.jpg',
    duration: '60 Min',
    calories: '200-300',
    capacity: '25 People',
    description: 'Flowing yoga sequences combining strength, flexibility, and mindfulness for holistic wellness.',
    fullDescription: 'Vinyasa Flow Yoga is a dynamic practice that links breath with movement, creating a moving meditation. This class focuses on building strength, improving flexibility, and achieving mental clarity through synchronized breathing and fluid movements.',
    trainer: {
      id: 'olivia',
      name: 'Olivia Taylor',
      specialty: 'Yoga Specialist',
      image: 'images/trainer-olivia.jpg',
      bio: 'Certified yoga instructor with 8+ years of experience in vinyasa flow and mindfulness practices.',
      rating: '4.9/5',
      clients: '350+ Clients',
      certs: '4 Certifications'
    },
    schedule: [
      { day: 'Monday', times: ['09:00 AM', '05:30 PM'] },
      { day: 'Wednesday', times: ['08:00 AM', '06:00 PM'] },
      { day: 'Friday', times: ['09:30 AM', '06:30 PM'] },
      { day: 'Saturday', times: ['09:00 AM', '03:00 PM'] }
    ],
    benefits: [
      { title: 'Flexibility & Balance', desc: 'Increase your range of motion and improve body balance.' },
      { title: 'Stress Relief', desc: 'Reduce anxiety and achieve mental clarity through mindfulness.' },
      { title: 'Core Strength', desc: 'Build a strong core through controlled movements and breathing.' },
      { title: 'Better Sleep', desc: 'Improve sleep quality and overall relaxation.' }
    ],
    equipment: [
      { name: 'Yoga Mat', desc: 'Provided by gym' },
      { name: 'Yoga Blocks', desc: 'For modifications' },
      { name: 'Yoga Straps', desc: 'For deeper stretches' },
      { name: 'Water Bottle', desc: 'Bring your own' }
    ]
  },
  strength: {
    id: 'strength',
    name: 'Strength Bootcamp',
    category: 'Muscle Building',
    level: 'Intermediate to Advanced',
    image: 'images/hero-apex-coming-soon.jpg',
    duration: '50 Min',
    calories: '400-500',
    capacity: '18 People',
    description: 'Comprehensive strength training program building muscle, power, and functional fitness.',
    fullDescription: 'Strength Bootcamp combines resistance training with functional movements to build lean muscle mass and increase overall strength. This class is perfect for those looking to transform their physique and develop functional fitness.',
    trainer: {
      id: 'benjamin',
      name: 'Benjamin Smith',
      specialty: 'Bodybuilding Pro',
      image: 'images/trainer-benjamin.jpg',
      bio: 'Professional bodybuilder with 15+ years of experience in strength training and muscle development.',
      rating: '4.95/5',
      clients: '600+ Clients',
      certs: '4 Certifications'
    },
    schedule: [
      { day: 'Monday', times: ['06:00 AM', '07:00 PM'] },
      { day: 'Wednesday', times: ['06:30 AM', '06:30 PM'] },
      { day: 'Friday', times: ['06:00 AM', '07:30 PM'] },
      { day: 'Saturday', times: ['08:00 AM', '05:00 PM'] }
    ],
    benefits: [
      { title: 'Muscle Growth', desc: 'Build lean muscle mass with progressive resistance training.' },
      { title: 'Increased Strength', desc: 'Develop functional strength for daily activities.' },
      { title: 'Bone Health', desc: 'Strengthen bones and improve overall skeletal health.' },
      { title: 'Metabolism Increase', desc: 'Boost resting metabolic rate through muscle building.' }
    ],
    equipment: [
      { name: 'Dumbbells', desc: 'Full range of weights' },
      { name: 'Barbells', desc: 'Olympic and standard' },
      { name: 'Resistance Machines', desc: 'Full gym equipment' },
      { name: 'Exercise Mat', desc: 'Provided by gym' }
    ]
  },
  spinning: {
    id: 'spinning',
    name: 'Spinning Class',
    category: 'Cardio',
    level: 'All Levels',
    image: 'images/hero-apex-coming-soon.jpg',
    duration: '45 Min',
    calories: '500-600',
    capacity: '30 People',
    description: 'High-energy cycling class with motivating music and dynamic coaching for an incredible cardio experience.',
    fullDescription: 'Spinning is a high-energy, indoor cycling workout performed to motivating music. This class combines cardio training with a community atmosphere, making fitness fun and engaging for all levels.',
    trainer: {
      id: 'emily',
      name: 'Emily Williams',
      specialty: 'Fitness Expert',
      image: 'images/trainer-emily.jpg',
      bio: 'Comprehensive fitness specialist with 10+ years of experience in cardio training and group fitness.',
      rating: '4.85/5',
      clients: '450+ Clients',
      certs: '4 Certifications'
    },
    schedule: [
      { day: 'Monday', times: ['06:30 AM', '05:30 PM'] },
      { day: 'Wednesday', times: ['07:00 AM', '06:00 PM'] },
      { day: 'Friday', times: ['06:30 AM', '05:45 PM'] },
      { day: 'Saturday', times: ['09:30 AM', '04:30 PM'] }
    ],
    benefits: [
      { title: 'Cardio Endurance', desc: 'Build cardiovascular strength and stamina.' },
      { title: 'Maximum Calorie Burn', desc: 'Burn 500-600 calories in a single session.' },
      { title: 'Low Impact', desc: 'Protect your joints while getting an intense workout.' },
      { title: 'Community Feel', desc: 'Join a supportive community of fitness enthusiasts.' }
    ],
    equipment: [
      { name: 'Spinning Bike', desc: 'Adjustable resistance' },
      { name: 'Cycling Shoes', desc: 'Provided or bring your own' },
      { name: 'Water Bottle', desc: 'Essential for hydration' },
      { name: 'Towel', desc: 'Bring your own' }
    ]
  }
};


function getClassIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

const APEX_FALLBACK_IMG = 'images/hero-apex-coming-soon.jpg';

function formatWhen(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' });
  } catch (e) {
    return iso;
  }
}

function sentencesFromDescription(text) {
  if (!text) return [];
  return text
    .split(/[.]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
    .slice(0, 4);
}

async function loadClassData() {
  const rawId = getClassIdFromURL();
  const numericId = parseInt(rawId, 10);
  if (!Number.isFinite(numericId)) {
    console.error('Use a numeric class id (from the schedule or homepage).');
    return;
  }

  const c = await apiFetchPublic('/api/trainers/classes/' + numericId);
  if (!c || c.error || c.id == null) {
    console.error('Class not found');
    return;
  }

  document.getElementById('classImage').src = APEX_FALLBACK_IMG;
  document.getElementById('classImage').alt = c.name || 'Class';
  document.getElementById('className').textContent = c.name || '';
  document.getElementById('classCategory').textContent = c.location || 'Apex Gym';
  document.getElementById('classLevel').textContent = c.classType || 'All levels';
  const dur = c.durationMinutes != null ? `${c.durationMinutes} min` : '—';
  document.getElementById('classDuration').textContent = dur;
  document.getElementById('classCalories').textContent = '—';
  const cap =
    c.maxCapacity != null
      ? `${c.currentEnrollment ?? 0} / ${c.maxCapacity} enrolled`
      : '—';
  document.getElementById('classCapacity').textContent = cap;
  document.getElementById('classDescription').textContent =
    c.description || 'Join this coached session at Apex.';

  const trainerName = c.trainerName || 'Our team';
  const trainerId = c.trainerId;
  document.getElementById('trainerImage').src = APEX_FALLBACK_IMG;
  document.getElementById('trainerImage').alt = trainerName;
  document.getElementById('trainerName').textContent = trainerName;
  document.getElementById('trainerSpecialty').textContent = 'Coach';
  document.getElementById('trainerBio').textContent =
    'Your coach will guide you through this session — check the class description for focus and intensity.';
  document.getElementById('trainerRating').textContent = '—';
  document.getElementById('trainerClients').textContent = '—';
  document.getElementById('trainerCerts').textContent = '—';

  const tid = trainerId != null ? Number(trainerId) : null;
  const trainerHref =
    Number.isFinite(tid) && tid > 0
      ? `trainer-profile.html?id=${tid}`
      : 'index.html#trainers';
  document.getElementById('trainerLink').href = trainerHref;
  document.getElementById('trainerProfileLink').href = trainerHref;

  const scheduleGrid = document.querySelector('.schedule-grid');
  if (scheduleGrid) {
    scheduleGrid.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'schedule-card visible-on-scroll';
    const when = formatWhen(c.classDateTime);
    card.innerHTML = `
      <div class="schedule-day">Next session</div>
      <div class="schedule-times">
        <div class="time-slot">
          <span class="time">${when || 'TBA'}</span>
          <span class="availability">${c.spotsAvailable != null ? c.spotsAvailable + ' spots left' : ''}</span>
        </div>
      </div>
      <button class="schedule-btn" data-i18n="class.enroll">ENROLL</button>
    `;
    scheduleGrid.appendChild(card);
  }

  const benefitsGrid = document.querySelector('.benefits-grid');
  if (benefitsGrid) {
    benefitsGrid.innerHTML = '';
    const bits = sentencesFromDescription(c.description);
    const defaults = [
      { title: 'Expert coaching', desc: 'Structured workout led by a certified trainer.' },
      { title: 'Community energy', desc: 'Train alongside members at a similar pace.' },
      { title: 'Book via front desk', desc: 'Reserve your spot through the member portal or staff.' }
    ];
    const rows = bits.length
      ? bits.map((t, i) => ({ title: `Focus ${i + 1}`, desc: t }))
      : defaults;
    rows.forEach((benefit, index) => {
      const el = document.createElement('div');
      el.className = 'benefit-card visible-on-scroll';
      el.style.animationDelay = `${index * 0.1}s`;
      el.innerHTML = `
      <div class="benefit-icon">
        <i class="bi bi-check-circle"></i>
      </div>
      <h3 class="benefit-title">${benefit.title}</h3>
      <p class="benefit-desc">${benefit.desc}</p>
    `;
      benefitsGrid.appendChild(el);
    });
  }

  const equipmentGrid = document.querySelector('.equipment-grid');
  if (equipmentGrid) {
    equipmentGrid.innerHTML = '';
    const loc = c.location ? [{ name: 'Location', desc: c.location }] : [];
    const defaults = [
      { name: 'Athletic wear', desc: 'Comfortable training clothes' },
      { name: 'Water bottle', desc: 'Stay hydrated' },
      { name: 'Towel', desc: 'Bring your own towel' }
    ];
    [...loc, ...defaults].forEach((equipment, index) => {
      const item = document.createElement('div');
      item.className = 'equipment-item visible-on-scroll';
      item.style.animationDelay = `${index * 0.1}s`;
      item.innerHTML = `
      <div class="equipment-icon">
        <i class="bi bi-box"></i>
      </div>
      <h4 class="equipment-name">${equipment.name}</h4>
      <p class="equipment-desc">${equipment.desc}</p>
    `;
      equipmentGrid.appendChild(item);
    });
  }

  document.title = `${c.name || 'Class'} - Apex Fitness`;
}


function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        if (!entry.target.style.animation) {
          entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.visible-on-scroll').forEach(el => {
    observer.observe(el);
  });
}


function setupCTAButtons() {
  const joinButtons = document.querySelectorAll('[data-i18n="class.joinNow"]');
  const enrollButtons = document.querySelectorAll('[data-i18n="class.enroll"]');
  const contactButtons = document.querySelectorAll('[data-i18n="class.contactUs"]');
  const learnMoreButtons = document.querySelectorAll('[data-i18n="class.learnMore"]');

  const handleJoin = () => {
    showNotification('Redirecting to enrollment...');
    setTimeout(() => {
      window.location.href = 'index.html#classes';
    }, 1000);
  };

  joinButtons.forEach(btn => btn.addEventListener('click', handleJoin));
  enrollButtons.forEach(btn => btn.addEventListener('click', handleJoin));

  contactButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showNotification('Opening contact form...');
      setTimeout(() => {
        window.location.href = 'index.html#contact';
      }, 800);
    });
  });

  learnMoreButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.benefits-grid')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}


function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #ffffff;
    color: #000000;
    padding: 15px 25px;
    border-radius: 8px;
    font-weight: 700;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideInLeft 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}


function setupHeaderScroll() {
  const header = document.querySelector('.header');
  let lastScrollTop = 0;

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScrollTop = scrollTop;
  });
}


function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
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


document.addEventListener('DOMContentLoaded', async () => {
  await loadClassData();
  setupScrollAnimations();
  setupCTAButtons();
  setupHeaderScroll();
  setupSmoothScroll();
  setupLanguageSwitcher();

  const currentLang = document.documentElement.lang || 'en';
  applyTranslations(currentLang);
});


window.addEventListener('load', () => {
  setupScrollAnimations();
});
