let allTracks = [];
let currentFilter = 'all';
let sortConfig = { field: 'date', direction: 'desc' };
let currentFolders = [];
let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en');

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        updateThemeIcon(false);
    } else {
        document.body.classList.remove('dark-theme');
        updateThemeIcon(true);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(!isDark);
}

function updateThemeIcon(isLight) {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.innerHTML = `<svg class="icon-svg"><use xlink:href="${isLight ? '#icon-moon' : '#icon-sun'}"></use></svg>`;
    }
}

// i18n Management
function applyTranslations() {
    const dict = translations[currentLang];
    
    // Titre de la page
    document.title = dict.title;

    // Éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key]) {
            if (el.tagName === 'INPUT' && el.placeholder) {
                el.placeholder = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });

    // Mise à jour visuelle des boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        applyTranslations();
        renderSessionSelect(); // Update "Toutes les sessions" text
        fetchTracks(); // Recharge pour mettre à jour les statuts/textes dynamiques
    }
}

// Sessions Management
let allSessions = [];

async function loadSessions() {
    try {
        const response = await fetch('/api/sessions');
        allSessions = await response.json();
        renderSessionSelect();
    } catch (error) {
        console.error('Erreur chargement sessions:', error);
    }
}

function renderSessionSelect() {
    const select = document.getElementById('session-select');
    const btnRename = document.getElementById('btn-rename-session');
    const btnDelete = document.getElementById('btn-delete-session');
    if (!select) return;
    
    const currentVal = select.value;
    const dict = translations[currentLang];
    
    select.innerHTML = `<option value="">${dict.opt_all_sessions || 'Toutes les sessions'}</option>`;
    
    allSessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.id;
        option.textContent = session.name;
        select.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (allSessions.find(s => String(s.id) === String(currentVal))) {
        select.value = currentVal;
        btnRename.style.display = 'flex';
        btnDelete.style.display = 'flex';
    } else {
        select.value = "";
        btnRename.style.display = 'none';
        btnDelete.style.display = 'none';
    }
}

async function createSession() {
    const now = new Date();
    const defaultName = `Session ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    const newSession = {
        id: Date.now().toString(),
        name: defaultName,
        timestamp: Date.now()
    };
    
    try {
        const res = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSession)
        });
        if (res.ok) {
            await loadSessions();
            document.getElementById('session-select').value = newSession.id;
            document.getElementById('session-select').dispatchEvent(new Event('change'));
        }
    } catch (e) {
        console.error("Erreur création session", e);
    }
}

async function renameSession() {
    const select = document.getElementById('session-select');
    const sessionId = select.value;
    if (!sessionId) return;
    
    const session = allSessions.find(s => String(s.id) === String(sessionId));
    const newName = prompt("Nouveau nom pour la session :", session.name);
    if (newName && newName.trim() !== "" && newName !== session.name) {
        try {
            const res = await fetch('/api/sessions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sessionId, name: newName.trim() })
            });
            if (res.ok) {
                await loadSessions();
            }
        } catch (e) {
            console.error("Erreur renommage", e);
        }
    }
}

async function deleteSession() {
    const select = document.getElementById('session-select');
    const sessionId = select.value;
    if (!sessionId) return;
    
    if (confirm("Supprimer cette session ? (Les morceaux ne seront pas supprimés de la DB)")) {
        try {
            const res = await fetch('/api/sessions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sessionId })
            });
            if (res.ok) {
                await loadSessions();
                select.dispatchEvent(new Event('change'));
            }
        } catch (e) {
            console.error("Erreur suppression", e);
        }
    }
}

// Settings Management
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        currentFolders = data.music_folders || [];
        renderFolderList();
    } catch (error) {
        console.error('Erreur chargement réglages:', error);
    }
}

function renderFolderList() {
    const list = document.getElementById('folder-list');
    list.innerHTML = '';
    currentFolders.forEach((folder, index) => {
        const item = document.createElement('div');
        item.className = 'folder-item';
        item.innerHTML = `
            <span>${folder}</span>
            <button class="btn-icon" onclick="removeFolder(${index})">
                <svg class="icon-inline"><use xlink:href="#icon-trash"></use></svg>
            </button>
        `;
        list.appendChild(item);
    });
}

function removeFolder(index) {
    currentFolders.splice(index, 1);
    renderFolderList();
}

async function saveSettings() {
    const btn = document.getElementById('save-settings');
    const dict = translations[currentLang];
    btn.textContent = currentLang === 'fr' ? 'Scan...' : 'Scanning...';
    btn.disabled = true;

    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ music_folders: currentFolders })
        });
        const data = await response.json();
        console.log('Scan terminé:', data.files_indexed, 'fichiers indexés');
        closeSettings();
        fetchTracks(); // Refresh list to see new matches
    } catch (error) {
        console.error('Erreur sauvegarde réglages:', error);
    } finally {
        btn.textContent = dict.btn_save;
        btn.disabled = false;
    }
}

function openSettings() {
    console.log("Ouverture des réglages...");
    loadSettings();
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error("Modal 'settings-modal' introuvable !");
    }
}

function closeSettings() {
    console.log("Fermeture des réglages.");
    document.getElementById('settings-modal').style.display = 'none';
}

// Tracks Management
async function fetchTracks(isReload = false) {
    const statusEl = document.getElementById('status');
    const start = document.getElementById('date-start').value;
    const end = document.getElementById('date-end').value;

    if (isReload) {
        const reloadBtn = document.getElementById('reload-btn');
        if (reloadBtn) {
            reloadBtn.style.animation = 'spin 1s linear infinite';
            setTimeout(() => reloadBtn.style.animation = '', 1000);
        }
    }
    
    const dict = translations[currentLang];
    statusEl.textContent = currentLang === 'fr' ? 'Mise à jour...' : 'Updating...';

    const exportCsv = document.querySelector('a[href*="/export/csv"]');
    const exportTxt = document.querySelector('a[href*="/export/txt"]');
    
    let queryParams = `?start=${start}&end=${end}`;
    
    const sessionSelect = document.getElementById('session-select');
    if (sessionSelect && sessionSelect.value) {
        const sessionId = sessionSelect.value;
        const idx = allSessions.findIndex(s => String(s.id) === String(sessionId));
        if (idx !== -1) {
            const currentSession = allSessions[idx];
            const nextSession = idx > 0 ? allSessions[idx - 1] : null;
            
            const startTs = currentSession.timestamp;
            const endTs = nextSession ? nextSession.timestamp : '';
            
            queryParams += `&start_ts=${startTs}`;
            if (endTs) {
                queryParams += `&end_ts=${endTs}`;
            }
        }
    }

    if (exportCsv) exportCsv.href = `/export/csv${queryParams}`;
    if (exportTxt) exportTxt.href = `/export/txt${queryParams}`;

    try {
        const response = await fetch(`/api/tracks${queryParams}`);
        allTracks = await response.json();
        
        if (allTracks.error) {
            statusEl.textContent = 'Erreur : ' + allTracks.error;
            return;
        }

        statusEl.textContent = currentLang === 'fr' ? `${allTracks.length} morceaux` : `${allTracks.length} tracks`;
        sortAndRender();
        updateStats();
    } catch (error) {
        statusEl.textContent = currentLang === 'fr' ? 'Erreur serveur' : 'Server error';
        console.error(error);
    }
}

function sortAndRender() {
    allTracks.sort((a, b) => {
        let valA = a[sortConfig.field];
        let valB = b[sortConfig.field];

        if (sortConfig.field === 'hits') {
            valA = parseInt(valA);
            valB = parseInt(valB);
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable(allTracks);
}

function renderTable(tracks) {
    const body = document.getElementById('tracks-body');
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const hideOwned = document.getElementById('hide-owned').checked;
    
    let filtered = tracks;
    
    if (currentFilter !== 'all') {
        const filterType = currentFilter === 'auto' ? 'Auto-shazam' : 'Solo-shazam';
        filtered = filtered.filter(t => t.type === filterType);
    }

    if (searchTerm) {
        filtered = filtered.filter(t => 
            t.artist.toLowerCase().includes(searchTerm) || 
            t.title.toLowerCase().includes(searchTerm)
        );
    }

    if (hideOwned) {
        filtered = filtered.filter(t => !t.in_library);
    }

    body.innerHTML = '';
    
    let prevDate = null;

    filtered.forEach((track, index) => {
        if (sortConfig.field === 'date' && prevDate) {
            const currentD = new Date(track.date);
            const prevD = new Date(prevDate);
            const diffMins = Math.abs(currentD - prevD) / (1000 * 60);
            
            if (diffMins > 10) {
                const separator = document.createElement('tr');
                separator.className = 'session-separator';
                separator.innerHTML = `<td colspan="5"></td>`;
                body.appendChild(separator);
            }
        }
        prevDate = track.date;

        const tr = document.createElement('tr');
        if (track.in_library) tr.classList.add('row-owned');
        
        const hitIcon = `<svg class="icon-inline"><use xlink:href="#icon-flame"></use></svg>`;
        const hitLabel = track.hits > 1 ? `<span class="hits-badge">${hitIcon} ${track.hits}</span>` : '1';
        
        const ownedBadge = track.in_library ? 
            `<div class="owned-badge"><svg class="icon-inline"><use xlink:href="#icon-check"></use></svg> Library</div>` : '';

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
                    ${ownedBadge}
                </div>
            </td>
            <td class="links">
                <a href="${track.links.beatport}" target="_blank" title="Beatport">BP</a>
                <a href="${track.links.traxsource}" target="_blank" title="Traxsource">TX</a>
                <a href="${track.links.junodownload}" target="_blank" title="Juno">JD</a>
                <a href="${track.links.spotify}" target="_blank" title="Spotify">SP</a>
                <a href="${track.links.apple}" target="_blank" title="Apple Music">AM</a>
                <a href="${track.links.soundcloud}" target="_blank" title="SoundCloud">SC</a>
                <a href="${track.links.youtube}" target="_blank" title="YouTube">YT</a>
                <a href="${track.links.google}" target="_blank" title="Google">G</a>
            </td>
        `;
        body.appendChild(tr);
    });
}

function updateStats() {
    if (allTracks.length === 0) {
        document.getElementById('total-tracks').textContent = '0';
        document.getElementById('top-count').textContent = '-';
        document.getElementById('auto-ratio').textContent = '-';
        return;
    }

    document.getElementById('total-tracks').textContent = allTracks.length;

    const artistCounts = {};
    let topArtist = "-";
    let maxCount = 0;
    
    allTracks.forEach(t => {
        artistCounts[t.artist] = (artistCounts[t.artist] || 0) + 1;
        if (artistCounts[t.artist] > maxCount) {
            maxCount = artistCounts[t.artist];
            topArtist = t.artist;
        }
    });
    document.getElementById('top-count').textContent = topArtist;

    const autoCount = allTracks.filter(t => t.type.includes('Auto')).length;
    const ratio = Math.round((autoCount / allTracks.length) * 100);
    document.getElementById('auto-ratio').textContent = `${ratio}%`;
}

// Event Listeners
document.getElementById('search')?.addEventListener('input', () => renderTable(allTracks));
document.getElementById('date-start')?.addEventListener('change', () => {
    document.querySelectorAll('.shortcut-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('session-select').value = '';
    document.getElementById('btn-rename-session').style.display = 'none';
    document.getElementById('btn-delete-session').style.display = 'none';
    fetchTracks();
});
document.getElementById('date-end')?.addEventListener('change', () => {
    document.querySelectorAll('.shortcut-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('session-select').value = '';
    document.getElementById('btn-rename-session').style.display = 'none';
    document.getElementById('btn-delete-session').style.display = 'none';
    fetchTracks();
});

// Session Listeners
document.getElementById('btn-new-session')?.addEventListener('click', createSession);
document.getElementById('btn-rename-session')?.addEventListener('click', renameSession);
document.getElementById('btn-delete-session')?.addEventListener('click', deleteSession);
document.getElementById('session-select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    const btnRename = document.getElementById('btn-rename-session');
    const btnDelete = document.getElementById('btn-delete-session');
    
    if (val) {
        btnRename.style.display = 'flex';
        btnDelete.style.display = 'flex';
        // Clear standard date filters
        document.getElementById('date-start').value = '';
        document.getElementById('date-end').value = '';
        document.querySelectorAll('.shortcut-btn').forEach(b => b.classList.remove('active'));
    } else {
        btnRename.style.display = 'none';
        btnDelete.style.display = 'none';
    }
    fetchTracks();
});
document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
document.getElementById('settings-toggle')?.addEventListener('click', openSettings);
document.getElementById('close-settings')?.addEventListener('click', closeSettings);
document.getElementById('save-settings')?.addEventListener('click', saveSettings);
document.getElementById('reload-btn')?.addEventListener('click', () => fetchTracks(true));
document.getElementById('hide-owned')?.addEventListener('change', () => renderTable(allTracks));

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

document.getElementById('pick-folder-btn')?.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/pick-folder');
        const data = await response.json();
        if (data.path) {
            const input = document.getElementById('new-folder-path');
            if(input) input.value = data.path;
        }
    } catch (error) {
        console.error('Erreur sélecteur:', error);
    }
});

document.getElementById('add-folder-btn')?.addEventListener('click', () => {
    const input = document.getElementById('new-folder-path');
    if (!input) return;
    const path = input.value.trim();
    if (path) {
        currentFolders.push(path);
        input.value = '';
        renderFolderList();
    }
});

document.querySelectorAll('.shortcut-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.shortcut-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const range = btn.dataset.range;
        const startInput = document.getElementById('date-start');
        const endInput = document.getElementById('date-end');
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        if (range === 'today') {
            startInput.value = today;
            endInput.value = today;
        } else if (range === 'yesterday') {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yStr = yesterday.toISOString().split('T')[0];
            startInput.value = yStr;
            endInput.value = yStr;
        } else if (range === 'week') {
            const lastWeek = new Date(now);
            lastWeek.setDate(now.getDate() - 7);
            startInput.value = lastWeek.toISOString().split('T')[0];
            endInput.value = today;
        } else if (range === 'all') {
            startInput.value = '';
            endInput.value = '';
        }
        
        // Reset session
        document.getElementById('session-select').value = '';
        document.getElementById('btn-rename-session').style.display = 'none';
        document.getElementById('btn-delete-session').style.display = 'none';
        
        fetchTracks();
    });
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentFilter = e.currentTarget.dataset.filter;
        renderTable(allTracks);
    });
});

document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (sortConfig.field === field) {
            sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sortConfig.field = field;
            sortConfig.direction = 'desc';
        }
        document.querySelectorAll('.icon-sort').forEach(icon => {
            icon.innerHTML = `<use xlink:href="#icon-sort"></use>`;
        });
        const currentIcon = th.querySelector('.icon-sort');
        const iconId = sortConfig.direction === 'asc' ? '#icon-sort-asc' : '#icon-sort-desc';
        currentIcon.innerHTML = `<use xlink:href="${iconId}"></use>`;
        sortAndRender();
    });
});

window.addEventListener('keydown', (e) => {
    // Cmd+, (macOS) ou Ctrl+, (Windows) pour les réglages
    if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        openSettings();
    }

    if (e.key === 'Escape') {
        if (document.getElementById('settings-modal').style.display === 'block') {
            closeSettings();
        } else {
            const search = document.getElementById('search');
            if (search.value) {
                search.value = '';
                renderTable(allTracks);
            }
        }
    }
    if (e.key === 'f' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('search').focus();
    }
});

// TCC Permissions
async function checkAccess() {
    try {
        const response = await fetch('/api/access-status');
        const data = await response.json();
        if (data.status === 'denied' || data.status === 'missing') {
            document.getElementById('tcc-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur checkAccess:', error);
    }
}

document.getElementById('open-tcc').addEventListener('click', async () => {
    await fetch('/api/open-tcc');
});

// Initial Init
initTheme();
applyTranslations();
loadSessions(); // Lancer le fetch des sessions
fetchTracks();
loadSettings();
checkAccess();
