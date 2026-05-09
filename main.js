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

    // Open Modal Logic is now handled dynamically after cards are rendered
    window.setupSlider = setupSlider;

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

// --- Dynamic News Loading & Pagination ---
document.addEventListener('DOMContentLoaded', async () => {
    const homeContainer = document.getElementById('dynamic-news-home');
    const pageContainer = document.querySelector('.news-grid-page');
    
    if (!homeContainer && !pageContainer) return;

    try {
        const res = await fetch('https://gewerbeverin-heemsen-backend.friese-scholz.workers.dev/api/news');
        const posts = await res.json();

        // --- Render Homepage (Max 2) ---
        if (homeContainer) {
            homeContainer.innerHTML = '';
            if (posts.length === 0) {
                homeContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">Keine Neuigkeiten verfügbar.</p>';
            }
            const recentPosts = posts.slice(0, 2);
            recentPosts.forEach(post => {
                const imgUrl = (post.images && post.images.length > 0) ? post.images[0] : 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/gewerbeverein%20heemsen/Gewerbeverein-Heemsen-Logo.png';
                const card = document.createElement('article');
                card.className = 'news-card';
                card.innerHTML = `
                    <div class="news-image-placeholder" style="background-image: url('${imgUrl}'); background-size: cover; background-position: center;"></div>
                    <div class="news-content">
                        <span class="news-date">${post.date}</span>
                        <h4 class="news-title">${post.title}</h4>
                        <p class="news-excerpt">${post.excerpt}</p>
                        <a href="aktuelles.html" class="text-link">Weiterlesen <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                `;
                homeContainer.appendChild(card);
            });
        }

        // --- Render Subpage (Pagination & Modal) ---
        if (pageContainer) {
            pageContainer.innerHTML = '';
            if (posts.length === 0) {
                pageContainer.innerHTML = '<div style="text-align:center; padding: 40px; width: 100%; color: var(--text-muted);">Keine Beiträge vorhanden.</div>';
                return;
            }

            const itemsPerPage = 12;
            let currentPage = 1;
            const totalPages = Math.ceil(posts.length / itemsPerPage);
            
            // Create pagination container if > 1 page
            let paginationContainer = document.getElementById('pagination');
            if (!paginationContainer && totalPages > 1) {
                paginationContainer = document.createElement('div');
                paginationContainer.id = 'pagination';
                paginationContainer.className = 'pagination-container';
                pageContainer.parentNode.appendChild(paginationContainer);
            }

            function renderPage(page, scrollToTop = true) {
                if (page < 1) page = 1;
                if (page > totalPages) page = totalPages;
                currentPage = page;

                pageContainer.innerHTML = '';
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const pagePosts = posts.slice(start, end);

                pagePosts.forEach(post => {
                    const imgUrl = (post.images && post.images.length > 0) ? post.images[0] : 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/gewerbeverein%20heemsen/Gewerbeverein-Heemsen-Logo.png';
                    
                    const card = document.createElement('article');
                    card.className = 'news-card-large';
                    
                    // Create hidden data safely
                    const hiddenData = document.createElement('div');
                    hiddenData.style.display = 'none';
                    
                    // Clean content mapping
                    let safeImages = [];
                    if (Array.isArray(post.images)) {
                        safeImages = post.images;
                    }

                    // Parse text blocks to HTML paragraphs if they don't already contain HTML tags
                    let formattedContent = post.content || '';
                    if (!formattedContent.includes('<p>') && !formattedContent.includes('<br>')) {
                        formattedContent = formattedContent
                            .split(/\n\s*\n/)
                            .filter(para => para.trim() !== '')
                            .map(para => `<p>${para.trim().replace(/\n/g, '<br>')}</p>`)
                            .join('');
                    }

                    hiddenData.innerHTML = `
                        <div class="news-full-content">${formattedContent}</div>
                        <div class="news-images-data" data-images='${JSON.stringify(safeImages).replace(/'/g, "&#39;")}'></div>
                    `;

                    card.innerHTML = `
                        <div class="news-card-img" style="background-image: url('${imgUrl}');"></div>
                        <div class="news-card-content">
                            <span class="news-date">${post.date}</span>
                            <h2 class="news-title">${post.title}</h2>
                            <p class="news-excerpt">${post.excerpt}</p>
                            <button class="btn btn-primary open-modal-btn">Vollständigen Beitrag lesen</button>
                        </div>
                    `;
                    card.appendChild(hiddenData);
                    pageContainer.appendChild(card);
                });

                renderPaginationControls();
                bindModalEventsToNewCards();

                if (scrollToTop) {
                    const yOffset = -100; 
                    const y = pageContainer.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                }
            }

            function renderPaginationControls() {
                if (!paginationContainer || totalPages <= 1) return;
                paginationContainer.innerHTML = '';

                // Prev
                const prevBtn = document.createElement('button');
                prevBtn.className = 'page-btn';
                prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
                prevBtn.disabled = currentPage === 1;
                prevBtn.addEventListener('click', (e) => { e.preventDefault(); renderPage(currentPage - 1); });
                paginationContainer.appendChild(prevBtn);

                // Pages
                for (let i = 1; i <= totalPages; i++) {
                    const pageBtn = document.createElement('button');
                    pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
                    pageBtn.textContent = i;
                    pageBtn.addEventListener('click', (e) => { e.preventDefault(); renderPage(i); });
                    paginationContainer.appendChild(pageBtn);
                }

                // Next
                const nextBtn = document.createElement('button');
                nextBtn.className = 'page-btn';
                nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
                nextBtn.disabled = currentPage === totalPages;
                nextBtn.addEventListener('click', (e) => { e.preventDefault(); renderPage(currentPage + 1); });
                paginationContainer.appendChild(nextBtn);
            }

            renderPage(1, false);
        }

    } catch (e) {
        console.error("Error loading news:", e);
        if (homeContainer) homeContainer.innerHTML = '<p style="text-align:center;">Fehler beim Laden der News.</p>';
        if (pageContainer) pageContainer.innerHTML = '<p style="text-align:center;">Fehler beim Laden der News.</p>';
    }
});

function bindModalEventsToNewCards() {
    const openButtons = document.querySelectorAll('.open-modal-btn');
    const modalOverlay = document.getElementById('news-modal');
    if (!modalOverlay) return;

    const modalDate = document.getElementById('modal-date');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    openButtons.forEach(btn => {
        if (btn.classList.contains('bound')) return;
        btn.classList.add('bound');
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.news-card-large');
            if (!card) return;

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

            modalDate.textContent = date;
            modalTitle.textContent = title;
            modalBody.innerHTML = fullContentHtml;

            if (typeof window.setupSlider === 'function') {
                window.setupSlider(images);
            }

            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        });
    });
}

// ICS Download Helper Function
window.downloadICS = function(title, dateStr, timeStr, location, description) {
    // dateStr format: YYYY-MM-DD
    // timeStr format: HH:MM
    const startDate = dateStr.replace(/-/g, "") + "T" + timeStr.replace(":", "") + "00";
    
    // Add 2 hours for end time as a default estimate
    let endHour = parseInt(timeStr.split(":")[0]) + 2;
    if(endHour > 23) endHour = 23;
    const endHourStr = endHour.toString().padStart(2, "0");
    const endDate = dateStr.replace(/-/g, "") + "T" + endHourStr + timeStr.split(":")[1] + "00";

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Gewerbeverein Heemsen//DE",
        "BEGIN:VEVENT",
        "SUMMARY:" + title,
        "DTSTART;TZID=Europe/Berlin:" + startDate,
        "DTEND;TZID=Europe/Berlin:" + endDate,
        "LOCATION:" + location,
        "DESCRIPTION:" + description,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
