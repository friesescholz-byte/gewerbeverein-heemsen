document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scrolling when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Add active class to nav links on scroll (Only on Homepage)
    const sections = document.querySelectorAll('section');
    const isHomepage = document.getElementById('aktuelles') !== null;
    
    if (isHomepage) {
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                if (!section.getAttribute('id')) return;
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes('#' + current) && current !== '') {
                    link.classList.add('active');
                }
            });
            
            // Fix for startseite when at very top
            if(window.scrollY < 100) {
                 navLinks.forEach(link => link.classList.remove('active'));
                 navLinks[0].classList.add('active');
            }
        });
    }
});

// --- News Modal & Slider Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('news-modal');
    if (!modalOverlay) return; // Only execute on pages with the modal

    const modalClose = document.getElementById('modal-close');
    const modalDate = document.getElementById('modal-date');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const sliderTrack = document.getElementById('modal-slider-track');
    const sliderDotsContainer = document.getElementById('slider-dots');
    const sliderPrevBtn = document.getElementById('slider-prev');
    const sliderNextBtn = document.getElementById('slider-next');
    
    let currentSlideIndex = 0;
    let totalSlides = 0;

    // Open Modal
    const openButtons = document.querySelectorAll('.open-modal-btn');
    openButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.news-card-large') || this.closest('.news-card');
            if (!card) return;

            // Extract Data
            const date = card.querySelector('.news-date').textContent;
            const title = card.querySelector('.news-title').textContent;
            const fullContentHtml = card.querySelector('.news-full-content').innerHTML;
            
            let images = [];
            try {
                const imagesData = card.querySelector('.news-images-data').getAttribute('data-images');
                images = JSON.parse(imagesData);
            } catch (e) {
                console.error("Could not parse images data", e);
            }

            // Populate Modal Text
            modalDate.textContent = date;
            modalTitle.textContent = title;
            modalBody.innerHTML = fullContentHtml;

            // Populate Slider
            setupSlider(images);

            // Show Modal
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close Modal
    const closeModal = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        // Reset slider to avoid flashes on next open
        setTimeout(() => {
            sliderTrack.innerHTML = '';
            sliderDotsContainer.innerHTML = '';
        }, 300);
    };

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Slider Logic
    function setupSlider(images) {
        sliderTrack.innerHTML = '';
        sliderDotsContainer.innerHTML = '';
        currentSlideIndex = 0;
        totalSlides = images.length;

        if (totalSlides === 0) {
            document.getElementById('modal-slider-container').style.display = 'none';
            return;
        } else {
            document.getElementById('modal-slider-container').style.display = 'block';
        }

        // Hide controls if only 1 image
        if (totalSlides === 1) {
            sliderPrevBtn.style.display = 'none';
            sliderNextBtn.style.display = 'none';
            sliderDotsContainer.style.display = 'none';
        } else {
            sliderPrevBtn.style.display = 'flex';
            sliderNextBtn.style.display = 'flex';
            sliderDotsContainer.style.display = 'flex';
        }

        images.forEach((imgUrl, index) => {
            // Create Slide
            const slide = document.createElement('div');
            slide.className = 'slider-image';
            slide.style.backgroundImage = `url('${imgUrl}')`;
            sliderTrack.appendChild(slide);

            // Create Dot
            if (totalSlides > 1) {
                const dot = document.createElement('div');
                dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => goToSlide(index));
                sliderDotsContainer.appendChild(dot);
            }
        });

        updateSliderPosition();
    }

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentSlideIndex = index;
        updateSliderPosition();
    }

    function updateSliderPosition() {
        sliderTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
        
        // Update dots
        const dots = sliderDotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            if (index === currentSlideIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    sliderPrevBtn.addEventListener('click', () => goToSlide(currentSlideIndex - 1));
    sliderNextBtn.addEventListener('click', () => goToSlide(currentSlideIndex + 1));
});

// --- Pagination Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.querySelector('.news-grid-page');
    if (!newsGrid) return;

    const cards = Array.from(newsGrid.querySelectorAll('.news-card-large'));
    const itemsPerPage = 12;
    let currentPage = 1;
    const totalPages = Math.ceil(cards.length / itemsPerPage);

    // Create pagination container if it doesn't exist
    let paginationContainer = document.getElementById('pagination');
    if (!paginationContainer && totalPages > 1) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination';
        paginationContainer.className = 'pagination-container';
        newsGrid.parentNode.appendChild(paginationContainer);
    }

    function renderPage(page, scrollToTop = true) {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        currentPage = page;

        // Hide all
        cards.forEach(card => card.style.display = 'none');

        // Show items for current page
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        for (let i = start; i < end && i < cards.length; i++) {
            cards[i].style.display = 'flex';
        }

        renderPaginationControls();
        
        // Scroll to top of grid when changing page
        if (scrollToTop) {
            const yOffset = -100; 
            const y = newsGrid.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});
        }
    }

    function renderPaginationControls() {
        if (!paginationContainer || totalPages <= 1) return;
        paginationContainer.innerHTML = '';

        // Prev button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', (e) => { e.preventDefault(); renderPage(currentPage - 1); });
        paginationContainer.appendChild(prevBtn);

        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', (e) => { e.preventDefault(); renderPage(i); });
            paginationContainer.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', (e) => { e.preventDefault(); renderPage(currentPage + 1); });
        paginationContainer.appendChild(nextBtn);
    }

    // Init
    if (cards.length > 0) {
        // Initial render without scrolling
        renderPage(1, false);
    }
});
