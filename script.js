/**
 * Catálogo Ágil - Interactive Scripts
 * Handles tabs, navigation, and code highlighting
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize syntax highlighting
    hljs.highlightAll();
    
    // Initialize tabs
    initTabs();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize header scroll effect
    initHeaderScroll();
    
    // Initialize copy code buttons
    initCopyButtons();
});

/**
 * Tab System
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Re-highlight code in the newly visible panel
            const newPanel = document.getElementById(targetTab);
            newPanel.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        });
    });
}

/**
 * Smooth Scroll for Navigation Links
 */
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

/**
 * Mobile Menu
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
    }
}

function closeMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuBtn.classList.remove('active');
    }
}

/**
 * Header Scroll Effect
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

/**
 * Copy Code Buttons
 */
function initCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre');
    
    codeBlocks.forEach(block => {
        // Create copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Copiar';
        copyBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            color: #9ca3af;
            font-size: 12px;
            cursor: pointer;
            opacity: 0;
            transition: all 0.2s ease;
        `;
        
        // Make pre relative for absolute positioning
        block.style.position = 'relative';
        block.appendChild(copyBtn);
        
        // Show button on hover
        block.addEventListener('mouseenter', () => {
            copyBtn.style.opacity = '1';
        });
        
        block.addEventListener('mouseleave', () => {
            copyBtn.style.opacity = '0';
        });
        
        // Copy functionality
        copyBtn.addEventListener('click', async () => {
            const code = block.querySelector('code');
            const text = code ? code.textContent : block.textContent;
            
            try {
                await navigator.clipboard.writeText(text);
                copyBtn.innerHTML = '✓ Copiado!';
                copyBtn.style.background = 'rgba(16, 185, 129, 0.2)';
                copyBtn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                copyBtn.style.color = '#10b981';
                
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Copiar';
                    copyBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                    copyBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    copyBtn.style.color = '#9ca3af';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                copyBtn.innerHTML = '❌ Erro';
            }
        });
    });
}

/**
 * Intersection Observer for Animations
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.card, .deploy-step, .roadmap-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease';
        observer.observe(el);
    });
}

// Add animation class
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    </style>
`);

// Initialize scroll animations after a short delay
setTimeout(initScrollAnimations, 100);

/**
 * Mobile Navigation Styles (injected)
 */
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @media (max-width: 768px) {
            .nav-links {
                position: fixed;
                top: 70px;
                left: 0;
                right: 0;
                background: white;
                flex-direction: column;
                padding: 1rem;
                gap: 0;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                transform: translateY(-100%);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .nav-links.active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .nav-links li {
                border-bottom: 1px solid #e5e7eb;
            }
            
            .nav-links a {
                display: block;
                padding: 1rem;
            }
            
            .mobile-menu-btn.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .mobile-menu-btn.active span:nth-child(2) {
                opacity: 0;
            }
            
            .mobile-menu-btn.active span:nth-child(3) {
                transform: rotate(-45deg) translate(5px, -5px);
            }
        }
    </style>
`);

console.log('🚀 Catálogo Ágil - Página carregada com sucesso!');
