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
    
    // Update Wavesurfer colors if initialized
    if (wavesurfer) {
        const ctx = document.createElement('canvas').getContext('2d');
        const polyGradient = ctx.createLinearGradient(0, 0, 0, 40);
        polyGradient.addColorStop(0, '#ff1e22');
        polyGradient.addColorStop(1, '#ff8a8d');

        wavesurfer.setOptions({
            waveColor: isDark ? '#444' : '#ccc',
            progressColor: polyGradient,
            cursorColor: isDark ? '#fff' : '#000',
        });
    }
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

    const exportCsv = document.getElementById('export-csv-btn');
    const exportTxt = document.getElementById('export-txt-btn');
    
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

    if (exportCsv) exportCsv.dataset.query = queryParams;
    if (exportTxt) exportTxt.dataset.query = queryParams;

    // Logique d'export : API native pour Desktop, lien classique pour Web
    [ {el: exportCsv, format: 'csv'}, {el: exportTxt, format: 'txt'} ].forEach(item => {
        if (item.el && !item.el.dataset.listenerAttached) {
            item.el.addEventListener('click', async (e) => {
                e.preventDefault();
                const qParams = item.el.dataset.query || '';
                const url = `/export/${item.format}${qParams}`;
                
                if (window.pywebview && window.pywebview.api) {
                    try {
                        const res = await fetch(url);
                        const content = await res.text();
                        
                        // Génération du timestamp pour le nom de fichier
                        const now = new Date();
                        const ts = now.getFullYear() + 
                                   String(now.getMonth() + 1).padStart(2, '0') + 
                                   String(now.getDate()).padStart(2, '0') + "_" + 
                                   String(now.getHours()).padStart(2, '0') + 
                                   String(now.getMinutes()).padStart(2, '0');
                        
                        const filename = `shazylist_export_${ts}.${item.format}`;
                        const success = await window.pywebview.api.save_file(content, filename);
                        if (success) {
                            console.log(`Export ${item.format.toUpperCase()} natif réussi.`);
                        }
                    } catch (err) {
                        console.error("Erreur lors de l'export natif :", err);
                    }
                } else {
                    window.location.href = url;
                }
            });
            item.el.dataset.listenerAttached = "true";
        }
    });

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
            <td>
                <div class="cover-container" onclick="playPreview(this, '${track.artist.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', '${track.title.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', '${track.cover}')">
                    <img src="${track.cover}" class="cover-img" alt="cover">
                    <div class="cover-play-overlay">
                        <svg class="icon-svg" style="width:20px;height:20px;fill:white;"><use xlink:href="#icon-play"></use></svg>
                    </div>
                </div>
            </td>
            <td>
                <div class="artist-title">
                    <span class="artist-name">${track.artist}</span>
                    <span class="track-name">${track.title}</span>
                    ${ownedBadge}
                </div>
            </td>
            <td class="links">
                <a href="${track.links.beatport}" target="_blank" title="Beatport"><svg class="icon-inline" style="width:16px;height:16px;"><use xlink:href="#icon-beatport"></use></svg></a>
                <a href="${track.links.traxsource}" target="_blank" title="Traxsource" style="font-weight:bold; font-size:12px; text-decoration:none;">TX</a>
                <a href="${track.links.junodownload}" target="_blank" title="Juno" style="font-weight:bold; font-size:12px; text-decoration:none;">JD</a>
                <a href="${track.links.spotify}" target="_blank" title="Spotify"><svg class="icon-inline" style="width:16px;height:16px;"><use xlink:href="#icon-spotify"></use></svg></a>
                <a href="${track.links.apple}" target="_blank" title="Apple Music"><svg class="icon-inline" style="width:16px;height:16px;"><use xlink:href="#icon-apple"></use></svg></a>
                <a href="${track.links.soundcloud}" target="_blank" title="SoundCloud"><svg class="icon-inline" style="width:16px;height:16px;"><use xlink:href="#icon-soundcloud"></use></svg></a>
                <a href="${track.links.youtube}" target="_blank" title="YouTube"><svg class="icon-inline" style="width:16px;height:16px;"><use xlink:href="#icon-youtube"></use></svg></a>
                <a href="${track.links.google}" target="_blank" title="Google"><svg class="icon-inline" style="width:16px;height:16px;"><use xlink:href="#icon-google"></use></svg></a>
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

// --- Audio Player Logic ---
let wavesurfer = null;
let currentContainer = null;
const playerWidget = document.getElementById('audio-player');
const playerPlayBtn = document.getElementById('player-play-btn');
const playerIconUse = playerPlayBtn.querySelector('use');

function initWavesurfer() {
    const isDark = document.body.classList.contains('dark-theme');
    
    // Create gradient for progress
    const ctx = document.createElement('canvas').getContext('2d');
    const polyGradient = ctx.createLinearGradient(0, 0, 0, 40);
    polyGradient.addColorStop(0, '#ff1e22'); // Shazylist Red
    polyGradient.addColorStop(1, '#ff8a8d'); // Lighter Red

    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: isDark ? '#444' : '#ccc',
        progressColor: polyGradient,
        cursorColor: isDark ? '#fff' : '#000',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 40,
        barGap: 3,
        normalize: true
    });

    wavesurfer.on('play', () => {
        playerIconUse.setAttribute('href', '#icon-pause');
        playerIconUse.setAttribute('xlink:href', '#icon-pause');
        if (currentContainer) currentContainer.classList.add('playing');
    });

    wavesurfer.on('pause', () => {
        playerIconUse.setAttribute('href', '#icon-play');
        playerIconUse.setAttribute('xlink:href', '#icon-play');
        if (currentContainer) currentContainer.classList.remove('playing');
    });

    wavesurfer.on('finish', () => {
        if (currentContainer) currentContainer.classList.remove('playing');
        playerIconUse.setAttribute('href', '#icon-play');
        playerIconUse.setAttribute('xlink:href', '#icon-play');
    });
}

async function playPreview(container, artist, title, cover) {
    if (!wavesurfer) initWavesurfer();

    if (currentContainer === container && wavesurfer.isPlaying()) {
        wavesurfer.pause();
        return;
    }
    if (currentContainer === container && !wavesurfer.isPlaying() && wavesurfer.getDuration() > 0) {
        wavesurfer.play();
        return;
    }

    if (wavesurfer.isPlaying()) {
        wavesurfer.pause();
    }
    
    if (currentContainer) currentContainer.classList.remove('playing');

    if (container === null) {
        playerWidget.classList.add('hidden');
        currentContainer = null;
        wavesurfer.stop();
        return;
    }

    currentContainer = container;
    container.classList.add('playing');
    
    document.getElementById('player-cover').src = cover;
    document.getElementById('player-title').textContent = title;
    document.getElementById('player-artist').textContent = artist;
    playerWidget.classList.remove('hidden');
    
    playerIconUse.setAttribute('href', '#icon-play'); // Show play while loading
    playerIconUse.setAttribute('xlink:href', '#icon-play');

    try {
        const query = encodeURIComponent(`${artist} ${title}`);
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
        const data = await response.json();

        if (data.results && data.results.length > 0 && data.results[0].previewUrl) {
            const previewUrl = data.results[0].previewUrl;
            
            await wavesurfer.load(previewUrl);
            wavesurfer.play();
        } else {
            console.warn("No preview found for", artist, title);
            container.classList.remove('playing');
        }
    } catch (e) {
        console.error("Error fetching preview", e);
        container.classList.remove('playing');
    }
}

playerPlayBtn.addEventListener('click', () => {
    if (wavesurfer) {
        wavesurfer.playPause();
    }
});

document.getElementById('player-close-btn').addEventListener('click', () => {
    playPreview(null);
});

// Initial Init
initTheme();
applyTranslations();
loadSessions(); // Lancer le fetch des sessions
fetchTracks();
loadSettings();
checkAccess();
