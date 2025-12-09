// ==UserScript==
// @name         UNIT3D Favorite Subtitle Flags
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Show flags for favorite subtitle languages on UNIT3D torrents
// @author       gizeto
// @match        */torrents
// @match        */torrents?*
// @match        */torrents/similar/*
// @icon         https://hdinnovations.github.io/HDInnovations/media/favicon.ico
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEYS = {
        FAVORITE_SUBS: 'unit3d_favorite_subs',
        API_KEYS: 'unit3d_api_keys'
    };

    const DEFAULT_FAVORITE_SUBS = ['English'];
    const DEFAULT_API_KEYS = {};

    // Map language names from MediaInfo to country codes for flags
    // Source: https://raw.githubusercontent.com/HDInnovations/UNIT3D/master/app/Helpers/Helpers.php
    const LANG_MAP = {
        'English': 'us', 'English (US)': 'us', 'English (GB)': 'gb', 'English (CA)': 'can', 'English (AU)': 'au',
        'Albanian': 'al', 'Albanian (AL)': 'al',
        'Arabic': 'ae', 'Arabic (001)': 'ae', 'Arabic (AE)': 'ae', 'Arabic (SA)': 'sa', 'Arabic (MA)': 'ma',
        'Armenian': 'am', 'Azerbaijani': 'az', 'Belarusian': 'by', 'Bengali': 'bd',
        'Bosnian': 'ba', 'Bosnian (BA)': 'ba',
        'Bulgarian': 'bg', 'Bulgarian (BG)': 'bg',
        'Burmese': 'mm',
        'Chinese': 'cn', 'Mandarin': 'cn', 'Mandarin (Hans)': 'cn', 'Mandarin (Hant)': 'cn', 'Cantonese': 'cn', 'Cantonese (Hant)': 'cn', 'Chinese (Simplied)': 'cn', 'Chinese (Traditional)': 'cn', 'Chinese (Simplified)': 'cn', 'Chinese-yue-Hant': 'cn', 'Chinese-cmn-Hans': 'cn', 'Chinese-cmn-Hant': 'cn',
        'Chinese (HK)': 'hk', 'Chinese-Hant-HK': 'hk', 'Mandarin (HK)': 'hk', 'Cantonese (HK)': 'hk', 'Chinese-cmn-HK': 'hk',
        'Chinese (Taiwan)': 'tw',
        'Croatian': 'hr', 'Croatian (HR)': 'hr',
        'Czech': 'cz', 'Czech (CZ)': 'cz',
        'Danish': 'dk', 'Danish (DK)': 'dk',
        'Dutch': 'nl', 'Dutch (NL)': 'nl', 'Limburgish': 'nl', 'Dutch (BE)': 'be',
        'Estonian': 'ee', 'Estonian (EE)': 'ee',
        'Finnish': 'fi', 'Finnish (FI)': 'fi',
        'French': 'fr', 'French (FR)': 'fr', 'French (CA)': 'can-qc',
        'Georgian': 'ge',
        'German': 'de', 'German (DE)': 'de', 'German (CH)': 'ch',
        'Greek': 'gr', 'Greek (GR)': 'gr',
        'Hebrew': 'il', 'Hebrew (IL)': 'il',
        'Hindi': 'in', 'Tamil': 'in', 'Telugu': 'in', 'Hindi (IN)': 'in', 'Tamil (IN)': 'in', 'Telugu (IN)': 'in', 'Kannada': 'in', 'Kannada (IN)': 'in', 'Malayalam': 'in', 'Malayalam (IN)': 'in', 'Marathi': 'in', 'Marathi (IN)': 'in',
        'Hungarian': 'hu', 'Hungarian (HU)': 'hu',
        'Icelandic': 'is', 'Icelandic (IS)': 'is',
        'Indonesian': 'id', 'Indonesian (ID)': 'id',
        'Irish': 'ie', 'Irish (IE)': 'ie',
        'Italian': 'it', 'Italian (IT)': 'it',
        'Japanese': 'jp', 'Japanese (JP)': 'jp',
        'Kazakh': 'kz', 'Kazakh (KZ)': 'kz',
        'Korean': 'kr', 'Korean (KR)': 'kr',
        'Latvian': 'lv', 'Latvian (LV)': 'lv',
        'Lithuanian': 'lt', 'Lithuanian (LT)': 'lt',
        'Malay': 'my', 'Malay (MY)': 'my', 'Malay (SG)': 'sg',
        'Macedonian': 'mk', 'Macedonian (MK)': 'mk',
        'Mongolian': 'mn',
        'Norwegian': 'no', 'Norwegian Bokmal': 'no', 'Norwegian (NO)': 'no', 'Norwegian Bokmal (NO)': 'no', 'Norwegian Nynorsk': 'no', 'Norwegian Nynorsk (NO)': 'no',
        'Persian': 'ir',
        'Polish': 'pl', 'Polish (PL)': 'pl',
        'Portuguese': 'pt', 'Portuguese (PT)': 'pt', 'Portuguese (BR)': 'br',
        'Romanian': 'ro', 'Romanian (RO)': 'ro',
        'Russian': 'ru', 'Russian (RU)': 'ru',
        'Serbian': 'rs', 'Serbian-Latn-RS': 'rs', 'Serbian (RS)': 'rs', 'Serbian (Cyrl)': 'rs', 'Serbian (Latn)': 'rs',
        'Sinhala': 'lk',
        'Slovak': 'sk', 'Slovak (SK)': 'sk',
        'Slovenian': 'si', 'Slovenian (SI)': 'si',
        'Spanish': 'es', 'Spanish (ES)': 'es', 'Spanish (CA)': 'es', 'Spanish (EU)': 'es', 'Spanish (150)': 'es',
        'Spanish (Latin America)': 'mx', 'Spanish (LA)': 'mx', 'Spanish (MX)': 'mx',
        'Spanish (AR)': 'ar', 'Spanish (CL)': 'cl', 'Spanish (VE)': 've', 'Spanish (BO)': 'bo', 'Spanish (CO)': 'co', 'Spanish (CR)': 'cr', 'Spanish (DO)': 'do', 'Spanish (EC)': 'ec', 'Spanish (SV)': 'sv', 'Spanish (GT)': 'gt', 'Spanish (HN)': 'hn', 'Spanish (NI)': 'ni', 'Spanish (PA)': 'pa', 'Spanish (PY)': 'py', 'Spanish (PE)': 'pe', 'Spanish (PR)': 'pr', 'Spanish (UY)': 'uy',
        'Basque': 'es-pv', 'Basque (ES)': 'es-pv',
        'Catalan': 'es-ct', 'Catalan (ES)': 'es-ct',
        'Galician': 'es-ga', 'Galician (ES)': 'es-ga',
        'Swedish': 'se', 'Swedish (SE)': 'se',
        'Tagalog': 'ph', 'fil': 'ph', 'fil (PH)': 'ph', 'Filipino': 'ph', 'Filipino (PH)': 'ph',
        'Thai': 'th', 'Thai (TH)': 'th',
        'Turkish': 'tr', 'Turkish (TR)': 'tr',
        'Ukrainian': 'ua', 'Ukrainian (UA)': 'ua',
        'Vietnamese': 'vn', 'Vietnamese (VN)': 'vn',
        'Welsh': 'gb-wls'
    };

    function loadFavoriteSubs() {
        const stored = GM_getValue(STORAGE_KEYS.FAVORITE_SUBS, null);
        if (stored !== null && stored !== undefined) {
            if (typeof stored === 'string') {
                if (!stored.trim()) {
                    return [];
                }
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        return parsed;
                    }
                } catch (e) {
                    // Ignore parse errors and fall back to comma parsing
                }
                return stored.split(',').map(sub => sub.trim()).filter(Boolean);
            }

            if (Array.isArray(stored)) {
                return stored;
            }
        }

        return DEFAULT_FAVORITE_SUBS.slice();
    }

    function loadApiKeys() {
        const stored = GM_getValue(STORAGE_KEYS.API_KEYS, null);
        if (stored !== null && stored !== undefined) {
            if (typeof stored === 'string') {
                if (!stored.trim()) {
                    return {};
                }

                try {
                    const parsed = JSON.parse(stored);
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        return { ...DEFAULT_API_KEYS, ...parsed };
                    }
                } catch (e) {
                    // Ignore parse errors and fall back to defaults
                }
            } else if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
                return { ...DEFAULT_API_KEYS, ...stored };
            }
        }

        return { ...DEFAULT_API_KEYS };
    }

    function saveFavoriteSubs(subs) {
        GM_setValue(STORAGE_KEYS.FAVORITE_SUBS, JSON.stringify(subs));
        CONFIG.FAVORITE_SUBS = subs;
    }

    function saveApiKeys(keys) {
        GM_setValue(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
        CONFIG.API_KEYS = keys;
    }

    function registerMenuCommands() {
        GM_registerMenuCommand('Set favorite subtitles', () => {
            const current = CONFIG.FAVORITE_SUBS.join(', ');
            const input = prompt('Comma-separated favorite subtitles (case-sensitive)', current);
            if (input === null) {
                return;
            }

            const favorites = input.split(',').map(sub => sub.trim()).filter(Boolean);
            saveFavoriteSubs(favorites);
            alert('Favorite subtitles saved. Reload the page to apply.');
        });

        GM_registerMenuCommand('Set API key for this site', () => {
            const hostname = window.location.hostname;
            const currentKeys = { ...CONFIG.API_KEYS };
            const input = prompt(`API key for ${hostname}`, currentKeys[hostname] || '');
            if (input === null) {
                return;
            }

            const trimmed = input.trim();
            if (trimmed) {
                currentKeys[hostname] = trimmed;
            } else {
                delete currentKeys[hostname];
            }

            saveApiKeys(currentKeys);
            alert('API key saved. Reload the page to apply.');
        });
    }

    const CONFIG = {
        FAVORITE_SUBS: loadFavoriteSubs(),
        API_KEYS: loadApiKeys()
    };

    registerMenuCommands();

    const DEBUG_LOG = false;
    function logDebug(...args) {
        if (!DEBUG_LOG) return;
        console.log('Unit3D Favorite Subtitle Flags [debug]', ...args);
    }

    // Helper to get country code from language string
    function getFlagCode(language) {
        // 1. Try exact match
        if (LANG_MAP[language]) {
            const code = LANG_MAP[language];
            logDebug('Flag match exact', language, code);
            return code;
        }

        // 2. Try matching by splitting (e.g. "English (US)" -> "English")
        const baseLang = language.split('(')[0].trim();
        if (LANG_MAP[baseLang]) {
            const code = LANG_MAP[baseLang];
            logDebug('Flag match base', language, '->', baseLang, code);
            return code;
        }

        // 3. Fallback: partial match (careful with this)
        for (const [lang, code] of Object.entries(LANG_MAP)) {
            if (language.includes(lang)) {
                logDebug('Flag match partial', language, '->', lang, code);
                return code;
            }
        }
        logDebug('Flag match failed', language);
        return null;
    }

    // Helper to get API key for current domain
    function getApiKey() {
        const hostname = window.location.hostname;
        return CONFIG.API_KEYS[hostname];
    }

    // Extract TMDB ID and Category ID from URL
    function getPageContext() {
        const url = window.location.href;
        // Pattern: .../similar/[category_id].[tmdb_id]
        const similarMatch = url.match(/similar\/(\d+)\.(\d+)/);
        if (similarMatch) {
            return { categoryId: similarMatch[1], tmdbId: similarMatch[2] };
        }

        // Fallback or other page types could be added here
        return null;
    }

    function parseSubtitles(attributes) {
        const subtitles = new Set();
        logDebug('parseSubtitles start', {
            hasMediaInfo: Boolean(attributes.media_info),
            hasBdInfo: Boolean(attributes.bd_info),
            mediaInfoLength: attributes.media_info ? attributes.media_info.length : 0,
            bdInfoLength: attributes.bd_info ? attributes.bd_info.length : 0
        });

        if (attributes.media_info) {
            // Split MediaInfo into sections (separated by blank lines)
            const sections = attributes.media_info.split(/\n\s*\n/);
            logDebug('MediaInfo sections', sections.length);

            sections.forEach(section => {
                const trimmedSection = section.trim();
                // Check if section starts with "Text" (e.g. "Text", "Text #1")
                if (/^Text/i.test(trimmedSection)) {
                    // Extract Language field from this section
                    const match = /Language\s*:\s*([^\n\r]+)/i.exec(trimmedSection);
                    if (match) {
                        let lang = match[1].trim();
                        // Keep full language string for better flag matching
                        subtitles.add(lang);
                        logDebug('Found subtitle in MediaInfo', lang);
                    } else {
                        logDebug('Text section without language', trimmedSection.slice(0, 120));
                    }
                }
            });
        }

        if (attributes.bd_info) {
            // Regex for BDInfo: "Subtitle: English / ..."
            const regex = /Subtitle\s*:\s*([^\/]+)/gi;
            let match;

            while ((match = regex.exec(attributes.bd_info)) !== null) {
                let lang = match[1].trim();
                // Keep full language string
                subtitles.add(lang);
                logDebug('Found subtitle in BDInfo', lang);
            }
        }

        logDebug('parseSubtitles result', Array.from(subtitles));
        return Array.from(subtitles);
    }

    function injectFlags(torrents) {
        const torrentRows = document.querySelectorAll('.torrent-search--grouped__name');

        torrentRows.forEach(row => {
            const link = row.querySelector('a[href*="/torrents/"]');
            if (!link) return;

            const href = link.getAttribute('href');
            const torrentIdMatch = href.match(/\/torrents\/(\d+)/);
            if (!torrentIdMatch) return;

            const torrentId = torrentIdMatch[1];
            const torrentData = torrents.find(t => t.id == torrentId);

            if (torrentData && torrentData.attributes && (torrentData.attributes.media_info || torrentData.attributes.bd_info)) {
                const subtitles = parseSubtitles(torrentData.attributes);
                const favoriteSubs = subtitles.filter(sub =>
                    CONFIG.FAVORITE_SUBS.some(fav => sub.includes(fav))
                );
                logDebug('Grouped row', torrentId, { subtitles, favoriteSubs });

                if (favoriteSubs.length > 0) {
                    let flagContainer = row.querySelector('.unit3d-flag-container');
                    if (!flagContainer) {
                        flagContainer = document.createElement('span');
                        flagContainer.className = 'unit3d-flag-container';
                        flagContainer.style.marginLeft = '10px';
                        flagContainer.style.display = 'inline-flex';
                        flagContainer.style.alignItems = 'center';
                        flagContainer.style.gap = '3px';
                    } else {
                        flagContainer.innerHTML = '';
                    }

                    favoriteSubs.forEach(sub => {
                        const code = getFlagCode(sub);
                        if (code) {
                            const img = document.createElement('img');
                            img.src = `/img/flags/${code}.png`;
                            img.title = sub;
                            img.style.height = '11px';
                            img.style.verticalAlign = 'middle';
                            flagContainer.appendChild(img);
                        }
                    });

                    if (flagContainer.children.length > 0) {
                        row.style.display = 'flex';
                        row.style.alignItems = 'center';
                        row.style.flexWrap = 'wrap';

                        if (!flagContainer.isConnected) {
                            row.appendChild(flagContainer);
                        }
                    } else if (flagContainer.isConnected) {
                        flagContainer.remove();
                    }
                }
            }
        });
    }

    function toInt(val) {
        const n = parseInt(val, 10);
        return Number.isNaN(n) ? null : n;
    }

    function toBool(val) {
        if (val === null || val === undefined) return null;
        const lower = String(val).toLowerCase();
        if (lower === 'true' || lower === '1') return true;
        if (lower === 'false' || lower === '0') return false;
        return null;
    }

    function buildApiParamsFromSearchUrl() {
        const params = new URLSearchParams(window.location.search);
        const apiParams = {};

        const arrayParamMap = {
            categoryIds: 'categories',
            typeIds: 'types',
            resolutionIds: 'resolutions',
            genreIds: 'genres',
            primaryLanguageNames: 'primaryLanguageNames'
        };

        const booleanKeys = new Set(['doubleup', 'featured', 'refundable', 'stream', 'sd', 'highspeed', 'internal', 'personalRelease', 'alive', 'dying', 'dead', 'notDownloaded']);
        const numericKeys = new Set(['startYear', 'endYear', 'tmdbId', 'imdbId', 'tvdbId', 'malId', 'playlistId', 'collectionId', 'free', 'seasonNumber', 'episodeNumber', 'page', 'perPage']);
        const passthroughKeys = new Set(['name', 'description', 'mediainfo', 'bdinfo', 'uploader', 'keywords', 'file_name', 'sortField', 'sortDirection']);
        const freeValues = [];

        for (const [rawKey, rawVal] of params.entries()) {
            if (rawVal === null || rawVal === undefined || String(rawVal).trim() === '') {
                continue;
            }

            const arrayMatch = rawKey.match(/^(\w+)\[(\d+)\]$/);
            if (arrayMatch) {
                const baseKey = arrayMatch[1];
                const apiKey = arrayParamMap[baseKey];
                if (baseKey === 'free') {
                    freeValues.push(rawVal);
                    continue;
                }
                if (!apiKey) {
                    continue;
                }
                if (!Array.isArray(apiParams[apiKey])) {
                    apiParams[apiKey] = [];
                }
                const numericVal = toInt(rawVal);
                apiParams[apiKey].push(numericVal !== null ? numericVal : rawVal);
                continue;
            }

            if (passthroughKeys.has(rawKey)) {
                apiParams[rawKey] = rawVal;
                continue;
            }

            if (numericKeys.has(rawKey)) {
                const n = toInt(rawVal);
                if (n !== null) {
                    apiParams[rawKey] = n;
                }
                continue;
            }

            if (booleanKeys.has(rawKey)) {
                const b = toBool(rawVal);
                if (b !== null) {
                    apiParams[rawKey] = b;
                }
                continue;
            }

            if (rawKey === 'minSize' || rawKey === 'maxSize') {
                // Handle after loop with multipliers
                continue;
            }
        }

        if (freeValues.length > 0) {
            const firstFree = toInt(freeValues[0]);
            if (firstFree !== null) {
                apiParams.free = firstFree;
            }
        }

        const minSize = toInt(params.get('minSize'));
        const minMultiplier = toInt(params.get('minSizeMultiplier')) || 1;
        if (minSize !== null) {
            apiParams.minSize = minSize * minMultiplier;
        }

        const maxSize = toInt(params.get('maxSize'));
        const maxMultiplier = toInt(params.get('maxSizeMultiplier')) || 1;
        if (maxSize !== null) {
            apiParams.maxSize = maxSize * maxMultiplier;
        }

        if (!('perPage' in apiParams)) {
            apiParams.perPage = 25;
        }

        return apiParams;
    }

    function buildApiQuery(apiParams) {
        const search = new URLSearchParams();
        Object.entries(apiParams).forEach(([key, val]) => {
            if (val === null || val === undefined) {
                return;
            }
            if (Array.isArray(val)) {
                val.forEach(v => {
                    search.append(`${key}[]`, v);
                });
                return;
            }
            search.set(key, val);
        });
        return search.toString();
    }

    function mergeUniqueTorrents(...lists) {
        const map = new Map();
        lists.flat().forEach(torrent => {
            if (torrent && torrent.id !== undefined && torrent.id !== null) {
                map.set(torrent.id, torrent);
            }
        });
        return Array.from(map.values());
    }

    async function fetchFilteredTorrents(apiParams, apiKey) {
        const headers = {
            'Accept': 'application/json'
        };

        if (apiKey) {
            headers.Authorization = `Bearer ${apiKey}`;
        }

        const query = buildApiQuery(apiParams);
        const url = `/api/torrents/filter?${query}`;

        try {
            const response = await fetch(url, { headers });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();
            return json.data || [];
        } catch (e) {
            console.error('Unit3D Favorite Subtitle Flags: Error fetching torrents', e);
            return [];
        }
    }

    async function fetchSearchTorrentsWithExtras(apiParams, apiKey) {
        const page = apiParams.page || 1;
        const requests = [];

        // Current page
        requests.push(fetchFilteredTorrents(apiParams, apiKey));
        logDebug('Queue fetch current page', apiParams);

        // Previous page to cover featured items pinned on later pages
        if (page > 1) {
            const prevParams = { ...apiParams, page: page - 1 };
            requests.push(fetchFilteredTorrents(prevParams, apiKey));
            logDebug('Queue fetch previous page', prevParams);
        }

        // Featured torrents when on first page (or page not specified)
        if (!('page' in apiParams) || page === 1) {
            const featuredParams = { featured: true, perPage: 100 };
            requests.push(fetchFilteredTorrents(featuredParams, apiKey));
            logDebug('Queue fetch featured torrents', featuredParams);
        }

        const results = await Promise.all(requests);
        const merged = mergeUniqueTorrents(...results);
        logDebug('Merged torrents', {
            requests: requests.length,
            beforeMergeCounts: results.map(r => (Array.isArray(r) ? r.length : 0)),
            mergedCount: merged.length
        });
        return merged;
    }

    function injectFlagsIntoSearch(torrents) {
        const rows = document.querySelectorAll('.torrent-search--list__row');

        rows.forEach(row => {
            const torrentId = row.getAttribute('data-torrent-id');
            if (!torrentId) return;

            const torrentData = torrents.find(t => t.id == torrentId);
            if (torrentData && torrentData.attributes && (torrentData.attributes.media_info || torrentData.attributes.bd_info)) {
                const subtitles = parseSubtitles(torrentData.attributes);
                const favoriteSubs = subtitles.filter(sub =>
                    CONFIG.FAVORITE_SUBS.some(fav => sub.includes(fav))
                );
                logDebug('Search row', torrentId, { subtitles, favoriteSubs });

                if (favoriteSubs.length > 0) {
                    const icons = row.querySelector('.torrent-icons');
                    if (!icons) return;

                    let flagContainer = icons.querySelector('.unit3d-flag-container');
                    if (!flagContainer) {
                        flagContainer = document.createElement('span');
                        flagContainer.className = 'unit3d-flag-container';
                        flagContainer.style.display = 'inline-flex';
                        flagContainer.style.alignItems = 'center';
                        flagContainer.style.gap = '3px';
                        flagContainer.style.marginLeft = '6px';
                        icons.appendChild(flagContainer);
                    } else {
                        flagContainer.innerHTML = '';
                    }

                    favoriteSubs.forEach(sub => {
                        const code = getFlagCode(sub);
                        if (code) {
                            const img = document.createElement('img');
                            img.src = `/img/flags/${code}.png`;
                            img.title = sub;
                            img.style.height = '11px';
                            img.style.verticalAlign = 'middle';
                            flagContainer.appendChild(img);
                        }
                    });

                    if (flagContainer.children.length === 0) {
                        flagContainer.remove();
                    }
                }
            }
        });
    }

    function isTorrentDetailsPage() {
        return /\/torrents\/\d+(?:\/|$)/.test(window.location.pathname);
    }

    async function init() {
        if (isTorrentDetailsPage()) {
            return;
        }

        const apiKey = getApiKey();
        if (!apiKey) {
            console.log(`Unit3D Favorite Subtitle Flags: No API Key set for ${window.location.hostname}. Use the Tampermonkey menu "Set API key for this site". Aborting.`);
            return;
        }

        const searchRows = document.querySelectorAll('.torrent-search--list__row');
        const similarRows = document.querySelectorAll('.torrent-search--grouped__name');

        if ((!searchRows || searchRows.length === 0) && (!similarRows || similarRows.length === 0)) {
            console.log('Unit3D Favorite Subtitle Flags: No torrent rows found on this page. Aborting.');
            return;
        }


        if (searchRows && searchRows.length > 0) {
            const apiParams = buildApiParamsFromSearchUrl();
            console.log('Unit3D Favorite Subtitle Flags: Fetching torrents for search', apiParams);
            const torrents = await fetchSearchTorrentsWithExtras(apiParams, apiKey);
            console.log(`Unit3D Favorite Subtitle Flags: Found ${torrents.length} torrents for search (merged).`);
            if (torrents.length > 0) {
                injectFlagsIntoSearch(torrents);
            }
            return;
        }

        const context = getPageContext();
        if (!context) {
            console.log('Unit3D Favorite Subtitle Flags: Could not determine page context (TMDB ID/Category).');
            return;
        }

        console.log(`Unit3D Favorite Subtitle Flags: Fetching torrents for TMDB ${context.tmdbId} (Cat: ${context.categoryId})...`);
        const torrents = await fetchFilteredTorrents({ perPage: 100, tmdbId: context.tmdbId }, apiKey);
        console.log(`Unit3D Favorite Subtitle Flags: Found ${torrents.length} torrents.`);

        if (torrents.length > 0) {
            injectFlags(torrents);
        }
    }

    let lastUrl = null;
    let isProcessing = false;

    async function runForCurrentUrl() {
        if (isProcessing) {
            return;
        }
        isProcessing = true;
        try {
            await init();
        } finally {
            isProcessing = false;
        }
    }

    function onLocationChange() {
        const current = window.location.href;
        if (current === lastUrl) {
            return;
        }
        lastUrl = current;
        runForCurrentUrl();
    }

    function startLocationObserver() {
        lastUrl = window.location.href;
        runForCurrentUrl();

        const origPushState = history.pushState;
        history.pushState = function () {
            const ret = origPushState.apply(this, arguments);
            window.dispatchEvent(new Event('unit3d:locationchange'));
            return ret;
        };

        const origReplaceState = history.replaceState;
        history.replaceState = function () {
            const ret = origReplaceState.apply(this, arguments);
            window.dispatchEvent(new Event('unit3d:locationchange'));
            return ret;
        };

        window.addEventListener('popstate', onLocationChange);
        window.addEventListener('unit3d:locationchange', onLocationChange);

        // Fallback polling in case site manipulates URL without history events
        setInterval(onLocationChange, 1000);
    }

    startLocationObserver();

})();
