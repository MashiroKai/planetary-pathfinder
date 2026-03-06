// ===== SpaceX 风格互动脚本 =====

// 导航栏滚动效果
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 粒子效果（全局）
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    const particleCount = 80;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 3 + 1;
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 15 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            pointer-events: none;
        `;
        container.appendChild(particle);
    }
}

// 添加粒子浮动动画
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 滚动动画
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.timeline-item, .research-card, .stat-card, .achievement-card, .contact-item, .gallery-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// 数字计数动画
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseInt(target.getAttribute('data-count'));
                animateCount(target, countTo);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(num => observer.observe(num));
}

function animateCount(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '%';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '%';
        }
    }, 40);
}

// 时间线点击交互
function initTimelineInteraction() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        item.addEventListener('click', () => {
            timelineItems.forEach(i => {
                if (i !== item) {
                    i.style.background = '';
                }
            });
            
            if (!item.classList.contains('current')) {
                item.style.background = 'rgba(241, 61, 50, 0.15)';
            }
        });
    });
}

// 研究卡片点击效果
function initCardInteraction() {
    const cards = document.querySelectorAll('.research-card, .achievement-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => {
                if (c !== card) {
                    c.style.borderColor = '';
                }
            });
            card.style.borderColor = 'var(--spacex-red)';
        });
    });
}

// 图片画廊缩放效果
function initGalleryInteraction() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            galleryItems.forEach(i => {
                if (i !== item) {
                    i.style.opacity = '0.5';
                }
            });
        });
        
        item.addEventListener('mouseleave', () => {
            galleryItems.forEach(i => {
                i.style.opacity = '1';
            });
        });
    });
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
}

// 鼠标跟随效果（英雄区）
function initMouseFollow() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    hero.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        hero.style.backgroundPosition = `${50 + x * 5}% ${50 + y * 5}%`;
    });
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    handleScrollAnimation();
    animateNumbers();
    initTimelineInteraction();
    initCardInteraction();
    initGalleryInteraction();
    initSmoothScroll();
    initMouseFollow();
    
    console.log('%c PLANETARY PATHFINDER ', 'background: #F13D32; color: #fff; font-size: 20px; font-weight: bold; padding: 10px 20px;');
    console.log('%c 深空探测实验室 · USTC ', 'color: #E8E8E8; font-size: 12px;');
});

// 页面加载完成后的初始动画
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
