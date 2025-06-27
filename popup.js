// Popup script for Chrome extension
document.addEventListener('DOMContentLoaded', () => {
  checkCurrentPage();
});

function checkCurrentPage() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentTab = tabs[0];
    const statusDiv = document.getElementById('status');
    
    if (isMetabasePage(currentTab.url)) {
      statusDiv.className = 'status active';
      statusDiv.textContent = '✓ Active on this page';
    } else {
      statusDiv.className = 'status inactive';
      statusDiv.textContent = '✗ Navigate to a Metabase page to use';
    }
  });
}

function isMetabasePage(url) {
  return url.includes('metabase') || 
         url.includes('/question/') || 
         url.includes('/dashboard/');
}