(function () {
    'use strict';

    let speedoTimeout = null;

    const elements = {
        hud: document.getElementById('hud-container'),
        speedo: document.getElementById('speedo-container'),
        healthBar: document.getElementById('health-bar'),
        healthFill: document.getElementById('health-fill'),
        healthValue: document.getElementById('health-value'),
        armorBar: document.getElementById('armor-bar'),
        armorFill: document.getElementById('armor-fill'),
        armorValue: document.getElementById('armor-value'),
        hungerBar: document.getElementById('hunger-bar'),
        hungerFill: document.getElementById('hunger-fill'),
        hungerValue: document.getElementById('hunger-value'),
        thirstBar: document.getElementById('thirst-bar'),
        thirstFill: document.getElementById('thirst-fill'),
        thirstValue: document.getElementById('thirst-value'),
        stressBar: document.getElementById('stress-bar'),
        stressFill: document.getElementById('stress-fill'),
        stressValue: document.getElementById('stress-value'),
        speedoSpeed: document.getElementById('speedo-speed'),
        speedoGear: document.getElementById('speedo-gear'),
        speedoFuel: document.getElementById('speedo-fuel'),
        speedoRpm: document.getElementById('speedo-rpm'),
        seatbeltIndicator: document.getElementById('seatbelt-indicator'),
        seatbeltText: document.getElementById('seatbelt-text'),
        streetName: document.getElementById('street-name'),
        zoneName: document.getElementById('zone-name'),
        compassDegree: document.getElementById('compass-degree'),
        compassDir: document.getElementById('compass-dir'),
        waypointRow: document.getElementById('waypoint-row'),
        waypointDistance: document.getElementById('waypoint-distance'),
        vLights: document.getElementById('v-lights'),
        vEngine: document.getElementById('v-engine'),
        vCruise: document.getElementById('v-cruise'),
        voiceBarContainer: document.getElementById('voice-bar-container'),
        voiceSeg1: document.getElementById('voice-seg-1'),
        voiceSeg2: document.getElementById('voice-seg-2'),
        voiceSeg3: document.getElementById('voice-seg-3'),
        voiceModeText: document.getElementById('voice-mode-text'),
        micDot: document.getElementById('mic-dot'),
        hudSettingsOverlay: document.getElementById('hud-settings-overlay'),
        setPlayerInfo: document.getElementById('set-player-info'),
        setLogo: document.getElementById('set-logo'),
        setCompass: document.getElementById('set-compass'),
        setStressAutohide: document.getElementById('set-stress-autohide'),
        setCompact: document.getElementById('set-compact'),
        settingsCloseBtn: document.getElementById('settings-close-btn'),
        // Player Info Elements
        playerInfoContainer: document.getElementById('player-info-container'),
        jobName: document.getElementById('job-name'),
        jobRank: document.getElementById('job-rank'),
        playerId: document.getElementById('player-id'),
        cashValue: document.getElementById('cash-value'),
        bankValue: document.getElementById('bank-value'),
        blackMoneyValue: document.getElementById('black-money-value'),
        blackMoneyContainer: document.getElementById('black-money-container'),
        cashContainer: document.getElementById('cash-container'),
        bankContainer: document.getElementById('bank-container'),
        // Advanced Features
        oxygenBar: document.getElementById('oxygen-bar'),
        oxygenFill: document.getElementById('oxygen-fill'),
        oxygenValue: document.getElementById('oxygen-value'),
        vNitro: document.getElementById('v-nitro'),
        setDnd: document.getElementById('set-dnd'),
        setCinematic: document.getElementById('set-cinematic'),
        setFps: document.getElementById('set-fps'),
        cinematicTop: document.getElementById('cinematic-top'),
        cinematicBottom: document.getElementById('cinematic-bottom'),
        notificationsContainer: document.getElementById('notifications-container'),
        // Weapons
        weaponContainer: document.getElementById('weapon-container'),
        weaponAmmo: document.getElementById('weapon-ammo'),
        // Edit Mode
        editModeBtn: document.getElementById('edit-mode-btn')
    };

    let Locales = {};
    let isEditMode = false;

    // =============================================
    // EINSTELLUNGEN (localStorage)
    // =============================================
    const settings = {
        playerInfo: localStorage.getItem('bs_hud_player_info') !== 'false',
        logo: localStorage.getItem('bs_hud_logo') !== 'false',
        compass: localStorage.getItem('bs_hud_compass') !== 'false',
        stressAutohide: localStorage.getItem('bs_hud_stress_autohide') !== 'false',
        compact: localStorage.getItem('bs_hud_compact') === 'true',
        dnd: localStorage.getItem('bs_hud_dnd') === 'true',
        cinematic: localStorage.getItem('bs_hud_cinematic') === 'true',
        fps: localStorage.getItem('bs_hud_fps') === 'true'
    };

    function applySettings() {
        if (elements.playerInfoContainer) elements.playerInfoContainer.style.display = settings.playerInfo ? 'flex' : 'none';
        const branding = document.querySelector('.hud-branding');
        const direction = document.querySelector('.direction-container');
        if (branding) branding.style.display = settings.logo ? '' : 'none';
        if (direction) direction.style.display = settings.compass ? '' : 'none';

        if (elements.cinematicTop && elements.cinematicBottom) {
            if (settings.cinematic) {
                elements.cinematicTop.classList.add('active');
                elements.cinematicBottom.classList.add('active');
                if (elements.hud) elements.hud.style.opacity = '0';
                if (elements.speedo) elements.speedo.style.opacity = '0';
            } else {
                elements.cinematicTop.classList.remove('active');
                elements.cinematicBottom.classList.remove('active');
                if (elements.hud) elements.hud.style.opacity = '1';
                if (elements.speedo) elements.speedo.style.opacity = '1';
            }
        }

        if (settings.fps) {
            document.body.classList.add('fps-mode');
        } else {
            document.body.classList.remove('fps-mode');
        }

        const compactOnlyHide = ['hunger-bar', 'thirst-bar', 'armor-bar', 'stress-bar'];
        if (settings.compact) {
            compactOnlyHide.forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.setAttribute('data-compact-hidden', '1'); el.style.display = 'none'; }
            });
            if (elements.seatbeltIndicator) elements.seatbeltIndicator.style.display = 'none';
            if (elements.voiceBarContainer) elements.voiceBarContainer.style.display = 'none';
        } else {
            compactOnlyHide.forEach(id => {
                const el = document.getElementById(id);
                if (el && el.getAttribute('data-compact-hidden')) {
                    el.removeAttribute('data-compact-hidden');
                    if (id === 'hunger-bar' || id === 'thirst-bar') el.style.display = 'flex';
                }
            });
            if (elements.seatbeltIndicator) elements.seatbeltIndicator.style.display = '';
            if (elements.voiceBarContainer) elements.voiceBarContainer.style.display = 'flex';
        }
    }

    function saveSettings() {
        localStorage.setItem('bs_hud_player_info', settings.playerInfo);
        localStorage.setItem('bs_hud_logo', settings.logo);
        localStorage.setItem('bs_hud_compass', settings.compass);
        localStorage.setItem('bs_hud_stress_autohide', settings.stressAutohide);
        localStorage.setItem('bs_hud_compact', settings.compact);
        localStorage.setItem('bs_hud_dnd', settings.dnd);
        localStorage.setItem('bs_hud_cinematic', settings.cinematic);
        localStorage.setItem('bs_hud_fps', settings.fps);
    }

    function initSettings() {
        if (elements.setPlayerInfo) {
            elements.setPlayerInfo.checked = settings.playerInfo;
            elements.setPlayerInfo.addEventListener('change', function () {
                settings.playerInfo = this.checked; saveSettings(); applySettings();
            });
        }
        if (elements.setLogo) {
            elements.setLogo.checked = settings.logo;
            elements.setLogo.addEventListener('change', function () {
                settings.logo = this.checked; saveSettings(); applySettings();
            });
        }
        if (elements.setCompass) {
            elements.setCompass.checked = settings.compass;
            elements.setCompass.addEventListener('change', function () {
                settings.compass = this.checked; saveSettings(); applySettings();
            });
        }
        if (elements.setStressAutohide) {
            elements.setStressAutohide.checked = settings.stressAutohide;
            elements.setStressAutohide.addEventListener('change', function () {
                settings.stressAutohide = this.checked; saveSettings();
            });
        }
        if (elements.setCompact) {
            elements.setCompact.checked = settings.compact;
            elements.setCompact.addEventListener('change', function () {
                settings.compact = this.checked; saveSettings(); applySettings();
            });
        }
        if (elements.setDnd) {
            elements.setDnd.checked = settings.dnd;
            elements.setDnd.addEventListener('change', function () {
                settings.dnd = this.checked; saveSettings();
            });
        }
        if (elements.setCinematic) {
            elements.setCinematic.checked = settings.cinematic;
            elements.setCinematic.addEventListener('change', function () {
                settings.cinematic = this.checked; saveSettings(); applySettings();
            });
        }
        if (elements.setFps) {
            elements.setFps.checked = settings.fps;
            elements.setFps.addEventListener('change', function () {
                settings.fps = this.checked; saveSettings(); applySettings();
            });
        }
        if (elements.settingsCloseBtn) {
            elements.settingsCloseBtn.addEventListener('click', function () {
                if (elements.hudSettingsOverlay) elements.hudSettingsOverlay.style.display = 'none';
                fetch('https://bs_hud/closeSettings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                });
            });
        }
        applySettings();
    }

    // =============================================
    // KOMPASS
    // =============================================
    function getHeadingDir(deg) {
        // GTA V heading läuft gegen den Uhrzeigersinn: 0=N, 90=W, 180=S, 270=O
        const directions = ['N', 'NW', 'W', 'SW', 'S', 'SO', 'O', 'NO', 'N'];
        return directions[Math.round((360 - deg) / 45)];
    }

    // =============================================
    // STATUS BAR UPDATE
    // =============================================
    function updateBar(fillEl, valueEl, barEl, value, thresholdLow) {
        if (!fillEl || !valueEl) return;
        const clamped = Math.max(0, Math.min(100, value));
        const oldValue = parseFloat(valueEl.textContent) || 0;

        fillEl.style.width = clamped + '%';
        valueEl.textContent = Math.round(clamped);

        if (barEl && Math.abs(clamped - oldValue) > 5) {
            barEl.classList.remove('changed');
            void barEl.offsetWidth;
            barEl.classList.add('changed');
            setTimeout(() => barEl.classList.remove('changed'), 600);
        }

        if (barEl) {
            barEl.classList.toggle('low', clamped <= (thresholdLow || 20));
        }
    }

    // Hilfsfunktion für Finanzen
    function formatMoney(amount) {
        if (amount == null) return '$0';
        return '$' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function updateMoneyBox(container, valueEl, newValue) {
        if (!container || !valueEl) return;
        const currentStr = valueEl.textContent.replace(/[^0-9]/g, '');
        const current = parseInt(currentStr) || 0;
        if (current !== newValue) {
            valueEl.textContent = formatMoney(newValue);
            container.classList.remove('changed');
            void container.offsetWidth;
            container.classList.add('changed');
            setTimeout(() => container.classList.remove('changed'), 600);
        }
    }

    // =============================================
    // NUI MESSAGE HANDLER
    // =============================================
    window.addEventListener('message', function (event) {
        const data = event.data;

        if (data.type === 'updateHud') {

            // Player Info (Money, Job, ID)
            if (elements.jobName) elements.jobName.textContent = data.jobName || 'Arbeitslos';
            if (elements.jobRank) elements.jobRank.textContent = data.jobRank || '';
            if (elements.playerId) elements.playerId.textContent = data.playerId || '0';

            updateMoneyBox(elements.cashContainer, elements.cashValue, data.cash || 0);
            updateMoneyBox(elements.bankContainer, elements.bankValue, data.bank || 0);

            if (elements.blackMoneyContainer) {
                if (data.blackMoney > 0) {
                    elements.blackMoneyContainer.style.display = 'flex';
                    updateMoneyBox(elements.blackMoneyContainer, elements.blackMoneyValue, data.blackMoney);
                } else {
                    elements.blackMoneyContainer.style.display = 'none';
                }
            }

            // Gesundheit (immer sichtbar)
            updateBar(elements.healthFill, elements.healthValue, elements.healthBar, data.health, 25);

            if (!settings.compact) {
                // Rüstung
                if (elements.armorBar) {
                    if (data.armor > 0) {
                        elements.armorBar.style.display = 'flex';
                        updateBar(elements.armorFill, elements.armorValue, elements.armorBar, data.armor, 15);
                    } else {
                        elements.armorBar.style.display = 'none';
                    }
                }

                // Hunger & Durst
                updateBar(elements.hungerFill, elements.hungerValue, elements.hungerBar, data.hunger, 25);
                updateBar(elements.thirstFill, elements.thirstValue, elements.thirstBar, data.thirst, 25);

                // Stress
                if (elements.stressBar) {
                    if (data.stress > 0 || !settings.stressAutohide) {
                        elements.stressBar.style.display = 'flex';
                        updateBar(elements.stressFill, elements.stressValue, elements.stressBar, data.stress, 0);
                    } else {
                        elements.stressBar.style.display = 'none';
                    }
                }
                // Oxygen
                if (elements.oxygenBar) {
                    if (data.oxygen < 100) {
                        elements.oxygenBar.style.display = 'flex';
                        updateBar(elements.oxygenFill, elements.oxygenValue, elements.oxygenBar, data.oxygen, 20);
                    } else {
                        elements.oxygenBar.style.display = 'none';
                    }
                }

                // Weapons
                if (elements.weaponContainer) {
                    if (data.hasWeapon) {
                        elements.weaponContainer.style.display = 'flex';
                        if (elements.weaponAmmo) elements.weaponAmmo.textContent = data.weaponAmmo;
                    } else {
                        elements.weaponContainer.style.display = 'none';
                    }
                }
            }

            // Kompass & Straße
            if (settings.compass) {
                if (elements.streetName) elements.streetName.textContent = data.street || '';
                if (elements.zoneName) elements.zoneName.textContent = data.zone || '';
                if (elements.compassDegree) elements.compassDegree.textContent = Math.round(data.heading) + '°';
                if (elements.compassDir) elements.compassDir.textContent = getHeadingDir(data.heading);
            }

            // Waypoint GPS
            if (elements.waypointRow) {
                if (data.waypoint >= 0) {
                    elements.waypointRow.style.display = 'flex';
                    if (elements.waypointDistance) {
                        elements.waypointDistance.textContent = data.waypoint >= 1000
                            ? (data.waypoint / 1000).toFixed(1) + ' km'
                            : data.waypoint + ' m';
                    }
                } else {
                    elements.waypointRow.style.display = 'none';
                }
            }

            // Speedometer
            if (elements.speedo) {
                if (data.inVehicle) {
                    if (speedoTimeout) { clearTimeout(speedoTimeout); speedoTimeout = null; }
                    elements.speedo.style.display = 'block';
                    elements.speedo.classList.remove('hidden');

                    if (elements.speedoSpeed) elements.speedoSpeed.textContent = data.speed;
                    if (elements.speedoGear) {
                        elements.speedoGear.textContent = data.gear === 0 ? 'R' : (data.speed === 0 ? 'N' : data.gear);
                    }
                    if (elements.speedoFuel) elements.speedoFuel.style.width = data.fuel + '%';
                    if (elements.speedoRpm) elements.speedoRpm.style.width = (data.rpm * 100) + '%';

                    if (elements.vLights) elements.vLights.classList.toggle('active', !!data.lights);
                    if (elements.vEngine) elements.vEngine.classList.toggle('active', data.engine < 60);
                    if (elements.vCruise) elements.vCruise.classList.toggle('active', !!data.cruise);
                    if (elements.vNitro) elements.vNitro.classList.toggle('active', !!data.nitro);

                    if (elements.speedoSpeed) {
                        if (data.speed > 180) elements.speedoSpeed.style.color = '#ff4757';
                        else if (data.speed > 120) elements.speedoSpeed.style.color = '#ffa502';
                        else elements.speedoSpeed.style.color = '#ffffff';
                    }
                } else {
                    if (!elements.speedo.classList.contains('hidden')) {
                        elements.speedo.classList.add('hidden');
                        if (speedoTimeout) clearTimeout(speedoTimeout);
                        speedoTimeout = setTimeout(() => {
                            if (elements.speedo.classList.contains('hidden')) elements.speedo.style.display = 'none';
                            speedoTimeout = null;
                        }, 400);
                    }
                }
            }

        } else if (data.type === 'initData') {
            Locales = data.locales || {};
            if (elements.seatbeltText && !elements.seatbeltIndicator.classList.contains('on')) {
                elements.seatbeltText.textContent = Locales['seatbelt_off'] || 'Nicht angeschnallt';
            }

        } else if (data.type === 'toggleHud') {
            if (elements.hud) {
                elements.hud.classList.toggle('hidden', !data.show);
            }

        } else if (data.type === 'seatbelt') {
            if (elements.seatbeltIndicator) {
                elements.seatbeltIndicator.classList.toggle('on', data.active);
                elements.seatbeltIndicator.classList.toggle('off', !data.active);
                if (elements.seatbeltText) {
                    elements.seatbeltText.textContent = data.active ? (Locales['seatbelt_on'] || 'Angeschnallt') : (Locales['seatbelt_off'] || 'Nicht angeschnallt');
                }
            }

        } else if (data.type === 'voiceRange') {
            const mode = data.mode;
            const segs = [elements.voiceSeg1, elements.voiceSeg2, elements.voiceSeg3];
            const activeCount = mode === 'whisper' ? 1 : mode === 'normal' ? 2 : 3;
            segs.forEach((seg, i) => {
                if (!seg) return;
                seg.className = 'voice-seg';
                if (i < activeCount) seg.classList.add('active', mode);
            });
            if (elements.voiceModeText) {
                const labels = { whisper: 'Flüstern', normal: 'Normal', shout: 'Schreien' };
                elements.voiceModeText.textContent = labels[mode] || mode;
            }

        } else if (data.type === 'openSettings') {
            if (elements.hudSettingsOverlay) elements.hudSettingsOverlay.style.display = 'flex';

            // pma-voice sendet {talking, usingRadio} ohne type-Feld
        } else if (typeof data.talking !== 'undefined') {
            if (elements.micDot) {
                const isTalking = data.talking || data.usingRadio;
                elements.micDot.classList.toggle('talking', isTalking);
                elements.micDot.classList.toggle('radio', !!data.usingRadio);
            }

        } else if (data.type === 'notify') {
            if (settings.dnd) return; // DND aktiviert = Keine Benachrichtigungen
            if (!elements.notificationsContainer) return;

            const notifyEl = document.createElement('div');
            notifyEl.className = 'notify-item type-' + (data.notifyType || 'normal');

            let icon = '🔔';
            if (data.notifyType === 'success') icon = '✅';
            if (data.notifyType === 'error') icon = '❌';

            notifyEl.innerHTML = `<strong>${icon}</strong> &nbsp; ${data.message}`;
            elements.notificationsContainer.appendChild(notifyEl);

            // Animate in
            requestAnimationFrame(() => {
                notifyEl.classList.add('show');
            });

            // Animate out
            setTimeout(() => {
                notifyEl.classList.remove('show');
                notifyEl.classList.add('hide');
                setTimeout(() => notifyEl.remove(), 400);
            }, data.time || 5000);
        }
    });

    // =============================================
    // DRAG & DROP (Edit Mode)
    // =============================================
    function initDragAndDrop() {
        const draggables = [
            { el: elements.playerInfoContainer, key: 'bs_hud_pos_info' },
            { el: document.querySelector('.direction-container'), key: 'bs_hud_pos_compass' },
            { el: elements.weaponContainer, key: 'bs_hud_pos_weapon' },
            { el: elements.speedo, key: 'bs_hud_pos_speedo' },
            { el: elements.healthBar, key: 'bs_hud_pos_health' },
            { el: elements.armorBar, key: 'bs_hud_pos_armor' },
            { el: elements.hungerBar, key: 'bs_hud_pos_hunger' },
            { el: elements.thirstBar, key: 'bs_hud_pos_thirst' },
            { el: elements.stressBar, key: 'bs_hud_pos_stress' },
            { el: elements.oxygenBar, key: 'bs_hud_pos_oxygen' },
            { el: elements.seatbeltIndicator, key: 'bs_hud_pos_seatbelt' },
            { el: elements.voiceBarContainer, key: 'bs_hud_pos_voice' }
        ];

        // Restore saved positions
        draggables.forEach(item => {
            if (!item.el) return;
            const saved = localStorage.getItem(item.key);
            if (saved) {
                const coords = JSON.parse(saved);
                item.el.classList.add('draggable');
                item.el.style.left = coords.x + 'px';
                item.el.style.top = coords.y + 'px';
                item.el.style.bottom = 'auto'; // Disable flex/bottom based anchors
                item.el.style.right = 'auto';
                item.el.style.margin = '0';
            }
        });

        if (!elements.editModeBtn) return;

        elements.editModeBtn.addEventListener('click', () => {
            isEditMode = !isEditMode;
            document.body.classList.toggle('edit-mode-active', isEditMode);
            elements.editModeBtn.textContent = isEditMode ? 'SAVE & EXIT EDIT MODE' : 'EDIT MODE (DRAG & DROP)';

            if (isEditMode) {
                // First pass: Force display to calculate flex coordinates for hidden elements
                const hiddenEls = [];
                draggables.forEach(item => {
                    if (item.el && !item.el.classList.contains('draggable') && window.getComputedStyle(item.el).display === 'none') {
                        item.el.style.display = 'flex';
                        hiddenEls.push(item.el);
                    }
                });

                // Second pass: Read layout coordinates
                draggables.forEach(item => {
                    if (item.el && !item.el.classList.contains('draggable')) {
                        const rect = item.el.getBoundingClientRect();
                        item.el.dataset.rectLeft = rect.left;
                        item.el.dataset.rectTop = rect.top;
                    }
                });

                // Third pass: Apply fixed positioning coordinates
                draggables.forEach(item => {
                    if (item.el) {
                        if (!item.el.classList.contains('draggable')) {
                            item.el.style.left = item.el.dataset.rectLeft + 'px';
                            item.el.style.top = item.el.dataset.rectTop + 'px';
                            item.el.style.bottom = 'auto';
                            item.el.style.right = 'auto';
                            item.el.style.margin = '0';
                        }
                        item.el.classList.add('draggable');
                    }
                });

                // Cleanup inline display logic
                hiddenEls.forEach(el => el.style.display = '');

            } else {
                // SAVE ALL elements to lock them out of flex layout permanently
                draggables.forEach(item => {
                    if (item.el && item.el.style.left) {
                        localStorage.setItem(item.key, JSON.stringify({
                            x: parseInt(item.el.style.left, 10) || 0,
                            y: parseInt(item.el.style.top, 10) || 0
                        }));
                    }
                });

                fetch('https://bs_hud/closeSettings', { method: 'POST', body: JSON.stringify({}) }).catch(() => { });
                if (elements.hudSettingsOverlay) elements.hudSettingsOverlay.style.display = 'none';
            }
        });

        let activeDrag = null;
        let offsetX = 0;
        let offsetY = 0;

        document.addEventListener('mousedown', (e) => {
            if (!isEditMode) return;
            const target = e.target.closest('.draggable');
            if (!target) return;

            activeDrag = draggables.find(item => item.el === target);
            if (!activeDrag) return;

            const rect = target.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isEditMode || !activeDrag) return;
            activeDrag.el.style.left = (e.clientX - offsetX) + 'px';
            activeDrag.el.style.top = (e.clientY - offsetY) + 'px';
            activeDrag.el.style.bottom = 'auto';
            activeDrag.el.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (!isEditMode || !activeDrag) return;
            localStorage.setItem(activeDrag.key, JSON.stringify({
                x: parseInt(activeDrag.el.style.left, 10) || 0,
                y: parseInt(activeDrag.el.style.top, 10) || 0
            }));
            activeDrag = null;
        });
    }

    // Init
    if (elements.seatbeltIndicator) elements.seatbeltIndicator.classList.add('off');

    // Standard Voice Range: Normal (2 Segmente)
    if (elements.voiceSeg1) elements.voiceSeg1.classList.add('active', 'normal');
    if (elements.voiceSeg2) elements.voiceSeg2.classList.add('active', 'normal');

    initSettings();
    initDragAndDrop();

    // =============================================
    // MOCK DATA (BROWSER TEST MODE)
    // =============================================
    // Wenn 'invokeNative' nicht existiert, sind wir im normalen Browser (außerhalb von FiveM)
    if (typeof window.invokeNative === 'undefined') {
        console.log("[BS HUD] Browser Test Mode aktiviert!");
        // Setze wechselnde Hintergrundbilder für besseren Kontrast
        const bgImages = [
            "https://i.ytimg.com/vi/F2YHgtOD80s/maxresdefault.jpg",
            "https://i.imgur.com/PgIyy8X.jpeg",
            "https://images.unsplash.com/photo-1572139196518-1aff88d41595?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Neon Streets
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeIXEx1weM9HC4xBLHRQ88o7-I5IHa6vponQ&s", // Mountains
            "https://breadfish.de/wcf/attachment/21945-1-png/"  // Cars at night
        ];

        let currentBg = 0;
        document.body.style.setProperty('transition', 'background 1s ease', 'important');
        document.body.style.setProperty('background', `url("${bgImages[currentBg]}") center/cover no-repeat`, 'important');

        setInterval(() => {
            currentBg = (currentBg + 1) % bgImages.length;
            document.body.style.setProperty('background', `url("${bgImages[currentBg]}") center/cover no-repeat`, 'important');
        }, 30000);

        setTimeout(() => {
            // Sende Initialisierungsdaten
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'initData',
                    locales: { job_unemployed: 'Arbeitslos', seatbelt_on: 'Angeschnallt', seatbelt_off: 'Nicht angeschnallt' }
                }
            }));

            // Aktiviere HUD
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'toggleHud', show: true }
            }));

            // Sende Fake-Spielerdaten
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'updateHUD',
                    health: 150, armor: 50, hunger: 75, thirst: 40, stress: 25, oxygen: 80,
                    inVehicle: true, speed: 135, rpm: 0.7, gear: 4, fuel: 65, cruise: true, nitro: true, engine: 90, lights: true,
                    street: 'Alta St', zone: 'Downtown Vinewood', heading: 245, waypoint: 1250,
                    cash: 25000, bank: 1500000, blackMoney: 4500,
                    jobName: 'LSPD', jobRank: 'Officer II', playerId: 1337,
                    hasWeapon: true, weaponAmmo: 30
                }
            }));

            // Sende Seatbelt Status
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'seatbelt', active: true }
            }));

            // Sende Test-Notification
            setTimeout(() => {
                window.dispatchEvent(new MessageEvent('message', {
                    data: { type: 'notify', notifyType: 'success', message: 'Willkommen im Browser Test Modus!', time: 5000 }
                }));
            }, 1000);

            // Settings Menü per Escape-Taste simulieren
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    window.dispatchEvent(new MessageEvent('message', { data: { type: 'openSettings' } }));
                }
            });
            console.log("[BS HUD] Drücke ESCAPE, um die HUD Einstellungen zu öffnen!");
        }, 500);
    }
})();
