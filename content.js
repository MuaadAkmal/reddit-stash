console.log("Reddit Stash content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  sendResponse({ success: true });
});
