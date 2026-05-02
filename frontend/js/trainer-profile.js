




const trainersData = {
  matthew: {
    id: 'matthew',
    name: 'Matthew Johnson',
    specialty: 'Strength Coach',
    image: 'images/trainer-matthew.jpg',
    yearsExperience: 12,
    clients: '500+',
    successRate: '95%',
    rating: 4.9,
    reviewCount: 127,
    bio: 'Dedicated fitness professional with a passion for transforming lives through strength training and personalized coaching.',
    fullBio: 'With over 12 years of experience in the fitness industry, I\'ve dedicated my career to helping individuals achieve their fitness goals. My approach combines proven training methodologies with personalized nutrition guidance to deliver transformative results. I specialize in strength training, muscle building, and functional fitness. My training philosophy focuses on sustainable progress, injury prevention, and building a strong mindset alongside physical strength.',
    specialties: [
      'Strength Training',
      'Muscle Building',
      'Functional Fitness',
      'Performance Coaching',
      'Nutrition Planning',
      'Goal Achievement'
    ],
    certifications: [
      {
        title: 'ACE Certified Personal Trainer',
        issuer: 'American Council on Exercise',
        year: 2015
      },
      {
        title: 'NASM Certified Strength Coach',
        issuer: 'National Academy of Sports Medicine',
        year: 2017
      },
      {
        title: 'Precision Nutrition Level 2',
        issuer: 'Precision Nutrition',
        year: 2018
      },
      {
        title: 'Advanced Sports Conditioning',
        issuer: 'International Sports Sciences Association',
        year: 2019
      }
    ]
  },
  benjamin: {
    id: 'benjamin',
    name: 'Benjamin Smith',
    specialty: 'Bodybuilding Pro',
    image: 'images/trainer-benjamin.jpg',
    yearsExperience: 15,
    clients: '600+',
    successRate: '97%',
    rating: 4.95,
    reviewCount: 156,
    bio: 'Professional bodybuilder with expertise in muscle development and competitive preparation.',
    fullBio: 'With 15 years of competitive bodybuilding experience, I bring a unique perspective to training and nutrition. I\'ve helped hundreds of clients achieve their physique goals, from beginners to competitive athletes. My specialization in periodization and advanced training techniques ensures optimal results for muscle growth and definition.',
    specialties: [
      'Bodybuilding',
      'Muscle Hypertrophy',
      'Competition Prep',
      'Advanced Training',
      'Supplement Guidance',
      'Physique Coaching'
    ],
    certifications: [
      {
        title: 'IFBB Pro Card',
        issuer: 'International Federation of Bodybuilding',
        year: 2010
      },
      {
        title: 'NASM-PES Certified',
        issuer: 'National Academy of Sports Medicine',
        year: 2012
      },
      {
        title: 'Advanced Nutrition Specialist',
        issuer: 'International Sports Sciences Association',
        year: 2014
      },
      {
        title: 'Competition Coach Certification',
        issuer: 'Professional Bodybuilding Association',
        year: 2016
      }
    ]
  },
  emily: {
    id: 'emily',
    name: 'Emily Williams',
    specialty: 'Fitness Expert',
    image: 'images/trainer-emily.jpg',
    yearsExperience: 10,
    clients: '450+',
    successRate: '94%',
    rating: 4.85,
    reviewCount: 112,
    bio: 'Comprehensive fitness specialist with expertise in weight loss and overall wellness.',
    fullBio: 'I\'m passionate about helping people achieve sustainable fitness results through balanced training and lifestyle changes. With 10 years of experience working with diverse clientele, I\'ve developed a holistic approach that combines cardio, strength training, and nutrition coaching for maximum results.',
    specialties: [
      'Weight Loss',
      'Cardio Training',
      'HIIT Training',
      'Wellness Coaching',
      'Group Fitness',
      'Lifestyle Change'
    ],
    certifications: [
      {
        title: 'ACE Certified Personal Trainer',
        issuer: 'American Council on Exercise',
        year: 2014
      },
      {
        title: 'NASM Certified Nutrition Specialist',
        issuer: 'National Academy of Sports Medicine',
        year: 2016
      },
      {
        title: 'Group Fitness Instructor',
        issuer: 'ACE Fitness',
        year: 2015
      },
      {
        title: 'Wellness Coach Certification',
        issuer: 'International Wellness Institute',
        year: 2018
      }
    ]
  },
  olivia: {
    id: 'olivia',
    name: 'Olivia Taylor',
    specialty: 'Yoga Specialist',
    image: 'images/trainer-olivia.jpg',
    yearsExperience: 8,
    clients: '350+',
    successRate: '96%',
    rating: 4.9,
    reviewCount: 98,
    bio: 'Certified yoga instructor specializing in flexibility, balance, and mindfulness.',
    fullBio: 'With 8 years of dedicated yoga practice and teaching, I help clients achieve physical flexibility, mental clarity, and spiritual balance. My classes combine traditional yoga principles with modern fitness science to provide transformative experiences for all levels.',
    specialties: [
      'Hatha Yoga',
      'Vinyasa Flow',
      'Flexibility Training',
      'Mindfulness',
      'Injury Recovery',
      'Stress Management'
    ],
    certifications: [
      {
        title: 'RYT-200 Yoga Teacher',
        issuer: 'Yoga Alliance',
        year: 2016
      },
      {
        title: 'RYT-500 Advanced Yoga',
        issuer: 'Yoga Alliance',
        year: 2019
      },
      {
        title: 'Yoga Therapy Certification',
        issuer: 'International Association of Yoga Therapists',
        year: 2018
      },
      {
        title: 'Mindfulness Instructor',
        issuer: 'Center for Mindfulness',
        year: 2017
      }
    ]
  }
};


function getTrainerIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

const APEX_FALLBACK_IMG = 'images/hero-apex-coming-soon.jpg';

async function loadTrainerData() {
  const rawId = getTrainerIdFromURL();
  const numericId = parseInt(rawId, 10);
  if (!Number.isFinite(numericId)) {
    console.error('Use a numeric trainer id (from the directory).');
    return;
  }

  const trainer = await apiFetchPublic('/api/trainers/' + numericId);
  if (!trainer || trainer.error || trainer.id == null) {
    console.error('Trainer not found');
    return;
  }

  const imageLink = document.getElementById('trainerImageLink');
  if (imageLink) {
    imageLink.href = `trainer-profile.html?id=${numericId}`;
  }

  document.getElementById('trainerImage').src = APEX_FALLBACK_IMG;
  document.getElementById('trainerImage').alt = trainer.fullName || 'Trainer';
  document.getElementById('trainerName').textContent = trainer.fullName || '';
  document.getElementById('trainerSpecialty').textContent = trainer.specialization || '';
  document.getElementById('trainerYears').textContent =
    trainer.experienceYears != null ? String(trainer.experienceYears) : '—';
  document.getElementById('trainerClients').textContent = trainer.phoneNumber || '—';
  document.getElementById('trainerSuccess').textContent = trainer.status || '—';
  document.getElementById('trainerRating').textContent = '—';
  const bio = trainer.bio || '';
  document.getElementById('trainerBio').textContent =
    bio.length > 220 ? bio.slice(0, 220).trim() + '…' : bio;
  document.getElementById('trainerFullBio').textContent = bio || 'Bio coming soon.';

  const specialtiesContainer = document.querySelector('.specialties-grid');
  if (specialtiesContainer) {
    specialtiesContainer.innerHTML = '';
    const parts = (trainer.specialization || '')
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const list = parts.length ? parts : ['Personal training'];
    const icons = ['lightning-charge', 'heart-pulse', 'person-check', 'graph-up', 'fork-knife', 'target'];
    list.slice(0, 6).forEach((specialty, index) => {
      const item = document.createElement('div');
      item.className = 'specialty-item';
      item.innerHTML = `
      <i class="bi bi-${icons[index % icons.length]} specialty-icon"></i>
      <span>${specialty}</span>
    `;
      specialtiesContainer.appendChild(item);
    });
  }

  const certsContainer = document.querySelector('.certifications-grid');
  if (certsContainer) {
    certsContainer.innerHTML = '';
    const certCard = document.createElement('div');
    certCard.className = 'certification-card visible-on-scroll';
    certCard.innerHTML = `
      <div class="cert-icon">
        <i class="bi bi-award"></i>
      </div>
      <h3 class="cert-title">Verified Apex trainer</h3>
      <p class="cert-issuer">Profile synced from member services</p>
      <p class="cert-year">${trainer.email ? 'Contact: ' + trainer.email : ''}</p>
    `;
    certsContainer.appendChild(certCard);
  }

  const avgEl = document.getElementById('avgRating');
  if (avgEl) avgEl.textContent = '—';
  const rc = document.getElementById('reviewCount');
  if (rc) rc.textContent = '(reviews not stored in app yet)';

  document.title = `${trainer.fullName || 'Trainer'} - Apex Fitness`;
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
        entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.visible-on-scroll').forEach(el => {
    observer.observe(el);
  });
}


function setupReviewForm() {
  const reviewForm = document.getElementById('reviewForm');
  if (!reviewForm) return;

  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();

    
    const formData = new FormData(reviewForm);
    const name = formData.get('name') || 'Anonymous';
    const rating = formData.get('rating') || 5;
    const review = formData.get('review') || '';

    
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    reviewCard.style.animation = 'fadeInUp 0.6s ease-out';
    reviewCard.innerHTML = `
      <div class="review-header">
        <div class="reviewer-avatar">
          <i class="bi bi-person-circle"></i>
        </div>
        <div class="reviewer-info">
          <h4 class="reviewer-name">${name}</h4>
          <div class="review-rating">
            ${Array(parseInt(rating)).fill('<i class="bi bi-star-fill"></i>').join('')}
          </div>
        </div>
      </div>
      <p class="review-text">"${review}"</p>
      <span class="review-date">Just now</span>
    `;

    
    const reviewsGrid = document.querySelector('.reviews-grid');
    reviewsGrid.insertBefore(reviewCard, reviewsGrid.firstChild);

    
    reviewForm.reset();

    
    showNotification('Review submitted successfully!');
  });
}


function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #ff0000;
    color: white;
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


function setupCTAButtons() {
  const bookButtons = document.querySelectorAll('[data-i18n="trainer.bookSession"], [data-i18n="trainer.bookNow"]');
  const contactButtons = document.querySelectorAll('[data-i18n="trainer.contactMe"]');
  const learnMoreButtons = document.querySelectorAll('[data-i18n="trainer.learnMore"]');

  bookButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showNotification('Redirecting to booking system...');
      setTimeout(() => {
        window.location.href = 'index.html#classes';
      }, 1000);
    });
  });

  contactButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showNotification('Opening contact form...');
      document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  learnMoreButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.specialties-grid')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
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
  await loadTrainerData();
  setupScrollAnimations();
  setupReviewForm();
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
