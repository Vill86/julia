// Прелоадер
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.preloader').classList.add('hidden');
    }, 1000);
});

// Мобильное меню
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Закрытие меню при клике на ссылку
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Активная ссылка при скролле
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Изменение навбара при скролле
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Анимация счетчиков
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const increment = target / 200;
        
        const updateCounter = () => {
            const current = +counter.innerText;
            
            if (current < target) {
                counter.innerText = Math.ceil(current + increment);
                setTimeout(updateCounter, 10);
            } else {
                counter.innerText = target + (counter.parentElement.querySelector('.stat-label').innerText.includes('%') ? '%' : '+');
            }
        };
        
        updateCounter();
    });
};

// Запуск анимации при появлении в viewport
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('stats-container')) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        }
    });
}, observerOptions);

// Наблюдение за статистикой
const statsContainer = document.querySelector('.stats-container');
if (statsContainer) {
    observer.observe(statsContainer);
}

// Табы услуг
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Удаляем активный класс у всех
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Добавляем активный класс выбранным
        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Слайдер отзывов
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-card');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

const showTestimonials = () => {
    testimonials.forEach((testimonial, index) => {
        if (window.innerWidth > 768) {
            // Показываем все на десктопе
            testimonial.style.display = 'block';
        } else {
            // На мобильных показываем по одному
            testimonial.style.display = index === currentTestimonial ? 'block' : 'none';
        }
    });
};

if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        showTestimonials();
    });
    
    nextBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonials();
    });
}

// Инициализация слайдера
showTestimonials();
window.addEventListener('resize', showTestimonials);

// Обработка формы
const bookingForm = document.getElementById('booking-form');
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
    <div class="modal-content">
        <span class="modal-close">&times;</span>
        <h2 class="modal-title">Спасибо за заявку!</h2>
        <p class="modal-text">Я свяжусь с вами в течение 24 часов для уточнения деталей и подтверждения записи.</p>
        <p class="modal-text">С уважением, Юлия</p>
    </div>
`;
document.body.appendChild(modal);

if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Собираем данные формы
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData);
        
        // Здесь можно добавить отправку на сервер
        console.log('Данные формы:', data);
        
        // Показываем модальное окно
        modal.style.display = 'block';
        
        // Сброс формы
        bookingForm.reset();
        
        // Закрытие модального окна через 5 секунд
        setTimeout(() => {
            modal.style.display = 'none';
        }, 5000);
    });
}

// Закрытие модального окна
const modalClose = modal.querySelector('.modal-close');
modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Кнопки быстрой записи на услуги
const bookButtons = document.querySelectorAll('.btn-book');
bookButtons.forEach(button => {
    button.addEventListener('click', () => {
        const service = button.getAttribute('data-service');
        
        // Прокручиваем к форме
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        
        // Заполняем поле услуги
        setTimeout(() => {
            const serviceSelect = document.getElementById('service');
            if (serviceSelect) {
                // Находим нужную опцию
                Array.from(serviceSelect.options).forEach(option => {
                    if (option.text.includes(service)) {
                        serviceSelect.value = option.value;
                    }
                });
            }
        }, 1000);
    });
});

// Маска для телефона
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        
        if (value.length > 0) {
            if (value[0] === '7' || value[0] === '8') {
                value = value.substring(1);
            }
            formattedValue = '+7';
            if (value.length > 0) {
                formattedValue += ' (' + value.substring(0, 3);
            }
            if (value.length > 3) {
                formattedValue += ') ' + value.substring(3, 6);
            }
            if (value.length > 6) {
                formattedValue += '-' + value.substring(6, 8);
            }
            if (value.length > 8) {
                formattedValue += '-' + value.substring(8, 10);
            }
        }
        
        e.target.value = formattedValue;
    });
}

// Валидация формы
const validateForm = () => {
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const serviceSelect = document.getElementById('service');
    
    let isValid = true;
    
    // Валидация имени
    if (nameInput && nameInput.value.trim().length < 2) {
        showError(nameInput, 'Имя должно содержать минимум 2 символа');
        isValid = false;
    } else {
        clearError(nameInput);
    }
    
    // Валидация телефона
    if (phoneInput && phoneInput.value.replace(/\D/g, '').length < 11) {
        showError(phoneInput, 'Введите корректный номер телефона');
        isValid = false;
    } else {
        clearError(phoneInput);
    }
    
    // Валидация услуги
    if (serviceSelect && serviceSelect.value === '') {
        showError(serviceSelect, 'Выберите услугу');
        isValid = false;
    } else {
        clearError(serviceSelect);
    }
    
    return isValid;
};

const showError = (input, message) => {
    const formGroup = input.parentElement;
    let errorElement = formGroup.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.style.color = '#ef4444';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        errorElement.style.display = 'block';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    input.style.borderColor = '#ef4444';
};

const clearError = (input) => {
    const formGroup = input.parentElement;
    const errorElement = formGroup.querySelector('.error-message');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    input.style.borderColor = '#d1d5db';
};

// Добавляем валидацию к форме
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        if (!validateForm()) {
            e.preventDefault();
        }
    });
}

// Lazy loading для изображений
const images = document.querySelectorAll('img[data-src]');
const imageOptions = {
    threshold: 0.5,
    rootMargin: '50px'
};

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
            observer.unobserve(img);
        }
    });
}, imageOptions);

images.forEach(img => imageObserver.observe(img));

// Анимация при прокрутке
const animatedElements = document.querySelectorAll('.animate-on-scroll');
const animationOptions = {
    threshold: 0.3,
    rootMargin: '0px'
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            animationObserver.unobserve(entry.target);
        }
    });
}, animationOptions);

animatedElements.forEach(el => animationObserver.observe(el));

// Кнопка "Наверх"
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '↑';
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    display: none;
    z-index: 999;
    transition: all 0.3s;
`;
document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Инициализация всех функций при загрузке
document.addEventListener('DOMContentLoaded', () => {
    console.log('Сайт успешно загружен');
    
    // Проверяем наличие всех необходимых элементов
    const requiredElements = {
        'navbar': document.getElementById('navbar'),
        'bookingForm': document.getElementById('booking-form'),
        'heroSection': document.getElementById('home')
    };
    
    Object.entries(requiredElements).forEach(([name, element]) => {
        if (!element) {
            console.warn(`Элемент ${name} не найден`);
        }
    });
});
