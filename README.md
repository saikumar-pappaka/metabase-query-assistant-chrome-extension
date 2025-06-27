# Metabase Query Assistant - Chrome Extension

A Chrome extension that converts plain text queries to MBQL/SQL using OpenAI GPT models.

## 🚀 Features

- **🔍 Smart Query Generation**: Convert natural language to MBQL and SQL
- **🎯 Context-Aware**: Uses current Metabase page context for better results
- **📊 Multiple Formats**: Generate MBQL, SQL, or both
- **🎨 Modern UI**: Clean, responsive floating interface
- **📋 Copy Functionality**: Easy copy-to-clipboard for generated queries
- **⚡ Real-time Processing**: Loading states and comprehensive error handling

## 📦 Installation

### 1. Download Extension
```bash
git clone https://github.com/saikumar-pappaka/metabase-query-assistant-chrome-extension.git
cd metabase-query-assistant-chrome-extension
```

### 2. Install in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the downloaded extension folder
5. Note the extension ID for backend configuration

### 3. Backend Setup
This extension requires a Django REST API backend. See the backend setup section below.

## 🎯 Usage

1. **Navigate to Metabase**: Go to any Metabase page (question, dashboard, etc.)
2. **Find the Floating Button**: Look for the purple gradient chat icon in the bottom-right corner
3. **Open Query Assistant**: Click the floating button to open the modal
4. **Enter Your Query**: Type your request in plain English
   - Example: "Show me sales by region for the last 3 months where revenue > $10,000"
5. **Select Format**: Choose MBQL, SQL, or both
6. **Generate**: Click "Generate Query" and wait for results
7. **Copy & Use**: Copy the generated query and paste into Metabase

## ⚙️ Configuration

### API Endpoint
Update the API endpoint in `content.js`:
```javascript
// Line 4 in content.js
this.apiEndpoint = 'https://your-api-domain.com/api/query-assistant/';
```

### CORS Configuration
Add your extension ID to your Django backend CORS settings:
```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "chrome-extension://your-extension-id-here",
]
```

## 🔧 Backend Requirements

This extension requires a Django REST API backend with:
- OpenAI integration for query generation
- CORS headers configured for Chrome extension
- POST endpoint at `/api/query-assistant/`

### Backend Request Format
```json
{
  "query": "Show me sales by region for the last 3 months",
  "format": "both",
  "context": {
    "url": "https://metabase.company.com/question/123",
    "timestamp": "2024-06-27T12:30:31Z",
    "user_agent": "Mozilla/5.0..."
  }
}
```

### Expected Response Format
```json
{
  "request_id": 1,
  "processing_time": 2.34,
  "mbql": {
    "database": 1,
    "type": "query",
    "query": {
      "source-table": 1,
      "aggregation": [["sum", ["field", 10]]],
      "breakout": [["field", 5]]
    }
  },
  "sql": "SELECT region, SUM(revenue) FROM sales WHERE date BETWEEN '2024-03-01' AND '2024-05-31' GROUP BY region",
  "explanation": "This query aggregates sales revenue by region for the specified time period."
}
```

## 🎨 UI Components

### Floating Button
- **Position**: Bottom-right corner of Metabase pages
- **Design**: Purple gradient circle with chat icon
- **Behavior**: Hover effects and smooth animations
- **Trigger**: Click to open query assistant modal

### Modal Interface
- **Header**: Gradient background with close button
- **Context Info**: Shows current page URL and instructions
- **Query Input**: Large textarea for natural language input
- **Format Selection**: Dropdown for MBQL/SQL/Both
- **Results**: Formatted display with copy functionality

## 🛠️ Development

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── content.js            # Main functionality
├── styles.css            # UI styling
├── background.js         # Service worker
├── popup.html            # Extension popup
├── popup.js              # Popup functionality
└── README.md             # This file
```

### Testing
1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click the reload button on your extension
4. Test on Metabase pages
5. Check browser console for any errors

### Debugging
- **Content Script**: Right-click page → Inspect → Console
- **Popup**: Right-click extension icon → Inspect popup
- **Background**: Go to `chrome://extensions/` → Click "service worker"

## 🔒 Security Features

- **Host Permissions**: Limited to necessary domains
- **Content Security**: No external script loading
- **CORS Protection**: Configured for specific backend domains
- **Input Validation**: Client-side query validation

## 📱 Responsive Design

- **Desktop**: Full-featured modal interface
- **Mobile**: Responsive layout with stacked buttons
- **Tablet**: Optimized spacing and touch targets

## 🐛 Troubleshooting

### Extension Not Loading
- ✅ Check that Developer mode is enabled
- ✅ Verify manifest.json syntax
- ✅ Look for errors in Chrome Extensions page

### Floating Button Not Appearing
- ✅ Ensure you're on a Metabase page
- ✅ Check that content script is injected
- ✅ Verify URL patterns in manifest.json

### API Connection Issues
- ✅ Verify API endpoint URL in content.js
- ✅ Check CORS configuration in backend
- ✅ Ensure backend is running and accessible

### CORS Errors
- ✅ Add extension ID to backend CORS settings
- ✅ Install django-cors-headers in backend
- ✅ Check Network tab in browser DevTools

## 🔄 Updates

To update the extension:
1. Pull latest changes from repository
2. Go to `chrome://extensions/`
3. Click reload button on the extension
4. Test functionality on Metabase pages

## 📄 License

Internal company use only.

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify backend API is responding correctly
4. Contact the development team for assistance

---

**Repository**: [metabase-query-assistant-chrome-extension](https://github.com/saikumar-pappaka/metabase-query-assistant-chrome-extension)

**Version**: 1.0.0

**Last Updated**: June 2024