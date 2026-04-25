let allTracks = [];
let currentFilter = 'all';

async function fetchTracks() {
    const statusEl = document.getElementById('status');
    const start = document.getElementById('date-start').value;
    const end = document.getElementById('date-end').value;
    
    statusEl.textContent = 'Mise à jour des Shazams...';

    // Mise à jour des liens d'export pour inclure les filtres de date
    const exportCsv = document.querySelector('a[href*="/export/csv"]');
    const exportTxt = document.querySelector('a[href*="/export/txt"]');
    
    let queryParams = `?start=${start}&end=${end}`;
    exportCsv.href = `/export/csv${queryParams}`;
    exportTxt.href = `/export/txt${queryParams}`;

    try {
        const response = await fetch(`/api/tracks${queryParams}`);
        allTracks = await response.json();
        
        if (allTracks.error) {
            statusEl.textContent = 'Erreur : ' + allTracks.error;
            return;
        }

        statusEl.textContent = `${allTracks.length} morceaux filtrés`;
        renderTable(allTracks);
    } catch (error) {
        statusEl.textContent = 'Erreur de connexion au serveur';
        console.error(error);
    }
}

function renderTable(tracks) {
    const body = document.getElementById('tracks-body');
    const searchTerm = document.getElementById('search').value.toLowerCase();
    
    // Filtrage complémentaire côté client (Type et Search)
    let filtered = tracks;
    
    if (currentFilter !== 'all') {
        const filterType = currentFilter === 'auto' ? '🚀 Auto-shazam' : '👤 Solo-shazam';
        filtered = filtered.filter(t => t.type === filterType);
    }

    if (searchTerm) {
        filtered = filtered.filter(t => 
            t.artist.toLowerCase().includes(searchTerm) || 
            t.title.toLowerCase().includes(searchTerm)
        );
    }

    body.innerHTML = '';
    
    filtered.forEach(track => {
        const tr = document.createElement('tr');
        const hitLabel = track.hits > 1 ? `<span class="hits-badge">🔥 ${track.hits}</span>` : '1';
        
        tr.innerHTML = `
            <td>
                <div class="date">${track.date}</div>
                <div class="source-tag">${track.type}</div>
            </td>
            <td>${hitLabel}</td>
            <td><img src="${track.cover}" class="cover-img" alt="cover"></td>
            <td>
                <div class="artist-title">
                    <span class="artist-name">${track.artist}</span>
                    <span class="track-name">${track.title}</span>
                </div>
            </td>
            <td>${track.style}</td>
            <td class="links">
                <a href="${track.links.beatport}" target="_blank">BP</a>
                <a href="${track.links.traxsource}" target="_blank">TX</a>
                <a href="${track.links.youtube}" target="_blank">YT</a>
                <a href="${track.links.google}" target="_blank">G</a>
            </td>
        `;
        body.appendChild(tr);
    });
}

// Event Listeners
document.getElementById('search').addEventListener('input', () => renderTable(allTracks));
document.getElementById('date-start').addEventListener('change', fetchTracks);
document.getElementById('date-end').addEventListener('change', fetchTracks);

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTable(allTracks);
    });
});

// Initial Fetch
fetchTracks();
