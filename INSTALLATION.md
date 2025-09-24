# Installation Guide

## Quick Setup

1. **Open Chrome Extensions Page**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Or go to Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `chrome-extractor` folder
   - The extension should appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Search Results Extractor"
   - Click the pin icon to keep it visible

## Testing the Extension

1. **Test Google Search Extraction**
   - Go to Google.com
   - Search for any query (e.g., "Chrome extensions")
   - Click the extension icon in your toolbar
   - Click "Extract Current Page Results"
   - You should see a green notification
   - Check the popup to see the count increase

2. **Test Multiple Pages**
   - Navigate to page 2 of search results
   - Extract again
   - Repeat for more pages

3. **Test CSV Export**
   - Click "Export All to CSV"
   - A CSV file should download
   - Open the CSV to verify the data

## Troubleshooting

**Extension not loading:**
- Make sure all files are in the same folder
- Check that manifest.json is valid
- Refresh the extensions page

**No results extracted:**
- Make sure you're on a Google search results page
- Try refreshing the page and extracting again
- Check browser console for errors (F12)

**CSV export not working:**
- Make sure you have some extracted data
- Check browser download settings
- Try a different browser if issues persist

## File Structure Verification

Make sure your folder contains:
```
chrome-extractor/
├── manifest.json
├── background.js
├── content-google.js
├── content-reddit.js
├── popup.html
├── popup.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
└── INSTALLATION.md
```

## Next Steps

Once the Google extraction is working:
1. Test with different search queries
2. Test with multiple pages
3. Verify CSV export format
4. Ready to add Reddit functionality
