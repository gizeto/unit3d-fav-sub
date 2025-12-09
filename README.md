# UNIT3D Favorite Subtitle Flags

Userscript that shows flag icons for your favorite subtitle languages on UNIT3D torrent search and similar pages. It reads MediaInfo/BDInfo from the API, highlights matches, and supports favorite language selection per user plus API keys per site.

## Install
- Tampermonkey: Dashboard → Utilities → *Import from URL*, paste the link and install.
  https://raw.githubusercontent.com/gizeto/unit3d-fav-sub/main/unit3d-fav-sub.js

## Setup
- Open any UNIT3D site page.
- In the userscript menu, set your API key for the current domain ("Set API key for this site").
- Optional: set favorite subtitles (comma-separated, case-sensitive). Default is `English`.

## Usage
- Visit search or similar torrents page; matching subtitle languages show as flag icons in torrent rows.
- Uses `/api/torrents/filter` and does extra fetches to include featured torrents and previous-page pinning.
