// Log when content script is loaded
console.log("Reddit Stash content script loaded");

// Listen for events from sidebar if needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  sendResponse({ success: true });
});
