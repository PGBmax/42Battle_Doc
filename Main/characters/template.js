class CharacterManager {
    constructor() {
        this.characters = [];
        this.currentCharacter = null;
        this.init();
    }

    async init() {
        await this.loadCharacters();
        this.renderCharacterList();
        this.setupSearch();
        this.setupNavigation();
    }

    async loadCharacters() {
        try {
            const response = await fetch('Main/data.csv');
            const csvText = await response.text();
            this.characters = this.parseCSV(csvText);
        } catch (error) {
            console.error('Error loading characters:', error);
        }
    }

    parseCSV(csv) {
        const lines = csv.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const characters = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (!values[0] || values[0] === 'Template') continue;

            const character = {};
            headers.forEach((header, index) => {
                const value = values[index];
                character[header] = isNaN(value) ? value : Number(value);
            });
            characters.push(character);
        }

        return characters.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderCharacterList() {
        const listContainer = document.getElementById('characterList');
        listContainer.innerHTML = '';

        this.characters.forEach(character => {
            const item = document.createElement('a');
            item.className = 'character-item';
            item.textContent = character.name;
            item.dataset.character = character.name;
            item.href = '#';
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCharacter(character.name);
            });
            listContainer.appendChild(item);
        });

        const countEl = document.getElementById('charCount');
        if (countEl) countEl.textContent = this.characters.length;
    }

    setupSearch() {
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.character-item').forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(query) ? 'block' : 'none';
            });
        });

        const searchBox    = document.querySelector('.search-box');
        const charPanel    = document.getElementById('charPanel');
        const toggleBtn    = document.getElementById('searchToggle');
        toggleBtn.addEventListener('click', () => {
            const collapsed = charPanel.classList.toggle('collapsed');
            toggleBtn.textContent = collapsed ? '▼' : '▲';
            if (collapsed) {
                document.getElementById('searchInput').value = '';
                document.querySelectorAll('.character-item').forEach(i => i.style.display = 'block');
            }
        });
    }

    setupNavigation() {
        const goHome = () => {
            window.location.hash = '';
            document.getElementById('welcomePage').style.display = '';
            document.getElementById('characterPage').style.display = 'none';
            document.querySelectorAll('.character-item').forEach(i => i.classList.remove('active'));
            document.getElementById('navHome').classList.add('active');
            document.querySelector('.main-content').scrollTop = 0;
        };

        document.getElementById('homeBtn').addEventListener('click', goHome);
        document.getElementById('navHome').addEventListener('click', goHome);

        const hash = decodeURIComponent(window.location.hash.slice(1));
        if (hash) {
            const character = this.characters.find(c => c.name === hash);
            if (character) this.showCharacter(character.name);
        }
    }

    showCharacter(name) {
        const character = this.characters.find(c => c.name === name);
        if (!character) return;

        this.currentCharacter = character;
        window.location.hash = encodeURIComponent(name);

        document.querySelectorAll('.character-item').forEach(item => {
            item.classList.toggle('active', item.dataset.character === name);
        });
        document.getElementById('navHome').classList.remove('active');

        const welcomePage   = document.getElementById('welcomePage');
        const characterPage = document.getElementById('characterPage');

        const render = () => {
            welcomePage.style.display = 'none';
            characterPage.innerHTML = this.renderCharacterPage(character);
            characterPage.style.cssText = 'display:block; opacity:0; transform:translateY(12px);';
            requestAnimationFrame(() => requestAnimationFrame(() => {
                characterPage.style.cssText = 'display:block; opacity:1; transform:translateY(0); transition:opacity 0.35s ease, transform 0.35s ease;';
                this.animateStats();
            }));
            document.querySelector('.main-content').scrollTop = 0;
        };

        if (welcomePage.style.display !== 'none' || characterPage.style.display === 'none') {
            render();
        } else {
            // Fade out current → render new
            characterPage.style.cssText = 'display:block; opacity:0; transform:translateY(-8px); transition:opacity 0.18s ease, transform 0.18s ease;';
            setTimeout(render, 190);
        }
    }

    animateStats() {
        const rows      = document.querySelectorAll('.stat-row');
        const bars      = document.querySelectorAll('.stat-bar-fill[data-pct]');
        const values    = document.querySelectorAll('.stat-row-value[data-value]');
        const abilities = document.querySelectorAll('.ability-card');

        // Stagger rows sliding in
        rows.forEach((row, i) => {
            setTimeout(() => row.classList.add('visible'), i * 38);
        });

        // Animate bars after rows start appearing
        bars.forEach((bar, i) => {
            setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, i * 38 + 80);
        });

        // Count-up for numeric values
        values.forEach((el, i) => {
            const target = parseFloat(el.dataset.value);
            const unit   = el.dataset.unit || '';
            setTimeout(() => {
                if (target === 0) { el.textContent = '0' + unit; return; }
                this.countUp(el, target, 750, unit);
            }, i * 38 + 80);
        });

        // Ability cards slide in last
        abilities.forEach((card, i) => {
            setTimeout(() => card.classList.add('visible'), rows.length * 38 / 2 + i * 110);
        });
    }

    countUp(el, target, duration, unit) {
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
            el.textContent = Math.round(target * eased) + unit;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    // ── Render ──────────────────────────────────────────────────────

    renderCharacterPage(char) {
        return `
            <div class="character-header">
                <h1>${char.name}</h1>
            </div>
            ${this.renderStatsSection(char)}
            ${this.renderAbilitiesSection(char)}
        `;
    }

    statRow(label, value, max) {
        const isZero = value === 0;
        const pct    = Math.min((value / max) * 100, 100);
        return `
            <div class="stat-row">
                <span class="stat-row-label">${label}</span>
                <div class="stat-row-right">
                    <div class="stat-bar-wrap">
                        <div class="stat-bar-fill" data-pct="${pct}"></div>
                    </div>
                    <span class="stat-row-value ${isZero ? 'zero' : 'active-stat'}" data-value="${value}" data-unit="%">0%</span>
                </div>
            </div>`;
    }

    renderStatsSection(char) {
        const heartsPct  = Math.min((char.hearts / 20) * 100, 100);
        const fireResHtml = `
            <div class="stat-row">
                <span class="stat-row-label">Fire Resistance</span>
                <div class="stat-row-right">
                    <span class="stat-boolean ${char.fire_resistance === 1 ? 'yes' : 'no'}">${char.fire_resistance === 1 ? 'YES' : 'NO'}</span>
                </div>
            </div>`;

        return `
            <div class="section">
                <div class="section-title">Stats</div>
                <div class="character-stats-layout">
                    <div class="character-portrait">
                        <img src="Main/characters/img/${char.name}.png"
                             alt="${char.name}"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                        <div class="portrait-placeholder">${char.name[0]}</div>
                    </div>
                    <div class="stats-panel">
                        <div class="stats-category-label">❤️ Base</div>
                        <div class="stat-row">
                            <span class="stat-row-label">Hearts</span>
                            <div class="stat-row-right">
                                <div class="stat-bar-wrap">
                                    <div class="stat-bar-fill" data-pct="${heartsPct}"></div>
                                </div>
                                <span class="stat-row-value active-stat" data-value="${char.hearts}" data-unit="">0</span>
                            </div>
                        </div>
                        ${this.statRow('Speed', char.speed, 100)}

                        <div class="stats-category-label">⚔️ Strength</div>
                        ${this.statRow('Total Strength',  char.strength_total, 100)}
                        ${this.statRow('Melee Strength',  char.strength_melee, 100)}
                        ${this.statRow('Range Strength',  char.strength_range, 100)}
                        ${this.statRow('Magic Strength',  char.strength_magic, 100)}

                        <div class="stats-category-label">🛡️ Defense</div>
                        ${this.statRow('Total Defense',   char.defense_total, 100)}
                        ${this.statRow('Melee Defense',   char.defense_melee, 100)}
                        ${this.statRow('Range Defense',   char.defense_range, 100)}
                        ${this.statRow('Magic Defense',   char.defense_magic, 100)}

                        <div class="stats-category-label">✨ Special</div>
                        ${this.statRow('Tenacity',   char.tenacity,   100)}
                        ${this.statRow('Lethality',  char.lethality,  100)}
                        ${this.statRow('Resilience', char.resilience, 100)}

                        <div class="stats-category-label">🩸 Life</div>
                        ${this.statRow('Vampirism',      char.vampirism,        100)}
                        ${this.statRow('Anti-Vampirism', char['anti-vampirism'], 100)}
                        ${fireResHtml}
                    </div>
                </div>
            </div>`;
    }

    renderAbilitiesSection(char) {
        return `
            <div class="section">
                <div class="section-title">Abilities</div>
                <div class="abilities-list">
                    <div class="ability-card">
                        <div class="ability-header">
                            <span class="ability-type passive">Passive</span>
                            <span class="ability-name">Passive Ability</span>
                        </div>
                        <div class="ability-description">
                            Passive ability description for ${char.name} — to be filled in.
                        </div>
                    </div>
                    <div class="ability-card">
                        <div class="ability-header">
                            <span class="ability-type active">Active</span>
                            <span class="ability-name">Active Ability</span>
                        </div>
                        <div class="ability-description">
                            Active ability description for ${char.name} — to be filled in.
                        </div>
                    </div>
                </div>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => new CharacterManager());
