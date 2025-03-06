chrome.runtime.onInstalled.addListener(() => {
    // Initialize storage
    chrome.storage.sync.get({ stashedLinks: [] }, (data) => {
      if (!Array.isArray(data.stashedLinks)) {
        chrome.storage.sync.set({ stashedLinks: [] });
      }
    });
  
    // Context menu for page content
    chrome.contextMenus.create({
      id: "stashLink",
      title: "Add to Stash",
      contexts: ["link", "selection", "page"]
    });
    
    // Context menu for extension icon
    chrome.contextMenus.create({
      id: "openSidebar",
      title: "Open in sidebar",
      contexts: ["action"]
    });
  });
  
  // Function to safely open the side panel (with fallback)
  function openSidebar(tabId) {
    // Using the proper method to open side panel
    try {
      if (chrome.sidePanel) {
        chrome.sidePanel.open({ tabId }).catch(error => {
          console.error("Side panel error:", error);
          // Fallback to new tab
          chrome.tabs.create({ url: chrome.runtime.getURL('sidebar.html') });
        });
      } else {
        // Fallback for browsers without side panel support
        chrome.tabs.create({ url: chrome.runtime.getURL('sidebar.html') });
      }
    } catch (e) {
      console.error("Error opening side panel:", e);
      chrome.tabs.create({ url: chrome.runtime.getURL('sidebar.html') });
    }
  }
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Handle opening sidebar from extension icon context menu
    if (info.menuItemId === "openSidebar") {
      openSidebar(tab.id);
      return;
    }
    
    // Handle stashing content
    chrome.storage.sync.get({ stashedLinks: [] }, (data) => {
      const stashedLinks = data.stashedLinks || [];
      const timestamp = new Date().toISOString();
      
      // Case 1: Selected text with a link
      if (info.linkUrl && info.selectionText) {
        stashedLinks.push({ 
          url: info.linkUrl,
          pageUrl: tab.url,
          text: info.selectionText,
          title: info.selectionText.substring(0, 40) + (info.selectionText.length > 40 ? '...' : ''),
          timestamp
        });
      }
      // Case 2: Just selected text
      else if (info.selectionText) {
        stashedLinks.push({ 
          url: tab.url,
          pageUrl: tab.url,
          text: info.selectionText,
          title: info.selectionText.substring(0, 40) + (info.selectionText.length > 40 ? '...' : ''),
          timestamp
        });
      }
      // Case 3: Just a link
      else if (info.linkUrl) {
        stashedLinks.push({ 
          url: info.linkUrl,
          pageUrl: tab.url,
          text: info.linkUrl,
          title: "Link from: " + tab.title,
          timestamp
        });
      }
      // Case 4: Current page
      else {
        stashedLinks.push({ 
          url: tab.url,
          pageUrl: tab.url,
          text: "",
          title: tab.title,
          timestamp
        });
      }
      
      chrome.storage.sync.set({ stashedLinks });
    });
  });
  
  // Handle action button click (browser toolbar icon)
  chrome.action.onClicked.addListener((tab) => {
    openSidebar(tab.id);
  });