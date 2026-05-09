
// --- Dynamic Members Loading & Search ---
document.addEventListener('DOMContentLoaded', async () => {
    const membersPageContainer = document.getElementById('dynamic-members-page');
    const searchInput = document.getElementById('member-search');
    
    if (!membersPageContainer) return;

    let allMembers = [];

    try {
        const res = await fetch('https://gewerbeverin-heemsen-backend.friese-scholz.workers.dev/api/members');
        allMembers = await res.json();
        
        // Sort alphabetically by name
        allMembers.sort((a, b) => a.name.localeCompare(b.name));
        
        renderMembers(allMembers);

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filtered = allMembers.filter(m => {
                    const nameMatch = m.name.toLowerCase().includes(query);
                    const tagMatch = m.tags && m.tags.some(t => t.toLowerCase().includes(query));
                    return nameMatch || tagMatch;
                });
                renderMembers(filtered);
            });
        }

    } catch (e) {
        console.error("Error fetching members:", e);
        membersPageContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: red;">Fehler beim Laden der Mitglieder.</div>';
    }

    function renderMembers(members) {
        membersPageContainer.innerHTML = '';
        if (members.length === 0) {
            membersPageContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: var(--text-muted);">Keine Mitglieder gefunden.</div>';
            return;
        }

        members.forEach(m => {
            const article = document.createElement('article');
            article.className = 'member-tile';
            
            // Generate details HTML conditionally
            let detailsHtml = '';
            
            if (m.address) {
                detailsHtml += `<div class="member-detail-item"><i class="fa-solid fa-location-dot"></i> <span>${m.address.replace(/\\n/g, '<br>')}</span></div>`;
            }
            if (m.phone) {
                detailsHtml += `<div class="member-detail-item"><i class="fa-solid fa-phone"></i> <span>${m.phone}</span></div>`;
            }
            if (m.fax) {
                detailsHtml += `<div class="member-detail-item"><i class="fa-solid fa-fax"></i> <span>${m.fax}</span></div>`;
            }
            if (m.mobile) {
                detailsHtml += `<div class="member-detail-item"><i class="fa-solid fa-mobile-screen"></i> <span>${m.mobile}</span></div>`;
            }
            if (m.email) {
                detailsHtml += `<div class="member-detail-item"><i class="fa-solid fa-envelope"></i> <a href="mailto:${m.email}">${m.email}</a></div>`;
            }
            if (m.website) {
                const cleanUrl = m.website.replace(/^https?:\\/\\//i, '');
                detailsHtml += `<div class="member-detail-item"><i class="fa-solid fa-globe"></i> <a href="${m.website}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a></div>`;
            }

            // Generate tags HTML
            let tagsHtml = '';
            if (m.tags && m.tags.length > 0) {
                tagsHtml = '<div class="member-tags">';
                m.tags.forEach(tag => {
                    tagsHtml += `<span class="member-tag">${tag}</span>`;
                });
                tagsHtml += '</div>';
            }

            // Default image if none provided
            const logoUrl = m.logo || 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/gewerbeverein%20heemsen/Gewerbeverein-Heemsen-Logo.png';

            article.innerHTML = `
                <div class="member-logo-wrapper">
                    <img src="${logoUrl}" alt="Logo von ${m.name}">
                </div>
                <h3 class="member-name">${m.name}</h3>
                <div class="member-details">
                    ${detailsHtml}
                </div>
                ${tagsHtml}
            `;
            
            membersPageContainer.appendChild(article);
        });
    }
});
