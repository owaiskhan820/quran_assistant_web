Urdu Word-by-Word Experiment: Technical Brief
This document outlines the technical implementation of the Urdu translation experiment for Mushaf word-by-word tooltips and provides a roadmap for the production-grade implementation.

1. Experimental Implementation Details
Data Fetching
API Endpoint: https://api.quran.com/api/v4/verses/by_page/{page}
Parameters:
words=true: Fetches word-level data.
word_fields=translation: Includes translation objects for each word.
language=ur: Specifically requests the Urdu language data from the Quran.com database.
Typography & Rendering
Font Face: Al Qalam Taj Nastaleeq (TajNastaleeq.ttf).
Optimization Strategy:
Global Preload: Added a <link rel="preload"> in layout.tsx to fetch the large TTF file early.
Pre-activation: Implemented a "Hot Font" useEffect in the app root that calls document.fonts.load('1em UrduNastaleeq') on mount to warm up the browser's font cache.
Display Strategy: Set font-display: block to ensure the complex Nastaleeq characters are rendered correctly without flickering to fallback fonts.
UI Styling
Directionality: Applied direction: rtl and text-align: right to the tooltip container.
Visual Polish: Used text-rendering: optimizeLegibility to assist the browser in preparing complex Urdu ligatures.
2. Production Implementation Roadmap
To transition this from a hardcoded experiment to a robust feature, the following architecture is recommended:

State Management
Introduce a wordLanguage field in AudioContext.
Options: ['en', 'ur', 'bn', 'tr', ...] (based on Quran.com supported languages).
Automated Cache Management
The fetchedPages cache must be indexed by both Page Number and Language.
Current logic: fetchedPages.current.has(pageNumber)
Future logic: fetchedPages.current.has(${language}:${pageNumber})
This ensures that if a user switches languages, the application automatically fetches the new data without requiring a browser refresh.
Dynamic Styling
Use a dynamic font mapping system (e.g., a getFontForLanguage utility).
Arabic/Urdu/Persian: Taj Nastaleeq.
English/French: Standard sans-serif.
UI Entry Point
Add a "Word Meaning Language" toggle in the Media Player's settings menu or the Global Settings drawer.
