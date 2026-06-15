# UNIT3D Favorite Subtitle Flags

Userscript that shows flag icons for your favorite subtitle languages on UNIT3D torrent search and similar pages. It reads MediaInfo/BDInfo from the API, highlights matches, and supports favorite language selection per user plus API keys per site.

## Install
- Tampermonkey: Dashboard -> Utilities -> *Import from URL*, paste the link and install.
  https://raw.githubusercontent.com/gizeto/unit3d-fav-sub/main/unit3d-fav-sub.js
- Tampermonkey automatically checks the raw `main` branch script for newer versions.

## Setup
- Open any UNIT3D site page.
- In the userscript menu, set your API key for the current domain ("Set API key for this site").
- Optional: set favorite subtitles (comma-separated, case-sensitive). Default is `English`.

## Usage
- Visit search or similar torrents page; matching subtitle languages show as flag icons in torrent rows.
- Uses `/api/torrents/filter` for the current search page.
- If a visible torrent is missing from the filtered API results, the script fetches missing torrents one by one with `/api/torrents/{id}`.
- If the API returns `429 Too Many Requests`, the script stops making requests until navigating to another page.

## Cache
- Parsed subtitle language lists, including empty lists, are cached by site hostname and torrent ID.
- Successful bulk and per-torrent API results are cached immediately.
- Cached entries expire after 30 days. Changing favorite subtitles does not invalidate the cache because all parsed subtitle languages are stored.
- When every visible torrent has a valid cache entry, the script renders from cache without making API requests.
