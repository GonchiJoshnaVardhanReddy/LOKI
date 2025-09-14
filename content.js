// Content script to detect emails on page
console.log('PhishGuard AI content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    // Extract text content from page
    const textContent = document.body.innerText;
    sendResponse({ content: textContent });
  }
});

// Add context menu option to analyze selected text
document.addEventListener('contextmenu', (event) => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 50) {
    chrome.storage.local.set({ selectedText: selectedText });
  }
});