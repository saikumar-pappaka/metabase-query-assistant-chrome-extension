// Background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Query Assistant extension installed');
});

// Handle messages from content script if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabInfo') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      sendResponse({
        url: tabs[0].url,
        title: tabs[0].title
      });
    });
    return true; // Will respond asynchronously
  }
});

// Optional: Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Inject content script if not already injected
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});