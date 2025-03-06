chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ stashedLinks: [] }, (data) => {
    if (!Array.isArray(data.stashedLinks)) {
      chrome.storage.sync.set({ stashedLinks: [] });
    }
  });

  chrome.contextMenus.create({
    id: "stashLink",
    title: "Add to Stash",
    contexts: ["link", "selection", "page"],
  });

  chrome.contextMenus.create({
    id: "openSidebar",
    title: "Open in sidebar",
    contexts: ["action"],
  });
});

function openSidebar(tabId) {
  try {
    if (chrome.sidePanel) {
      chrome.sidePanel.open({ tabId }).catch((error) => {
        console.error("Side panel error:", error);
        chrome.tabs.create({ url: chrome.runtime.getURL("sidebar.html") });
      });
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL("sidebar.html") });
    }
  } catch (e) {
    console.error("Error opening side panel:", e);
    chrome.tabs.create({ url: chrome.runtime.getURL("sidebar.html") });
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSidebar") {
    openSidebar(tab.id);
    return;
  }

  chrome.storage.sync.get({ stashedLinks: [] }, (data) => {
    const stashedLinks = data.stashedLinks || [];
    const timestamp = new Date().toISOString();

    if (info.linkUrl && info.selectionText) {
      stashedLinks.push({
        url: info.linkUrl,
        pageUrl: tab.url,
        text: info.selectionText,
        title:
          info.selectionText.substring(0, 40) +
          (info.selectionText.length > 40 ? "..." : ""),
        timestamp,
      });
    } else if (info.selectionText) {
      stashedLinks.push({
        url: tab.url,
        pageUrl: tab.url,
        text: info.selectionText,
        title:
          info.selectionText.substring(0, 40) +
          (info.selectionText.length > 40 ? "..." : ""),
        timestamp,
      });
    } else if (info.linkUrl) {
      stashedLinks.push({
        url: info.linkUrl,
        pageUrl: tab.url,
        text: info.linkUrl,
        title: "Link from: " + tab.title,
        timestamp,
      });
    } else {
      stashedLinks.push({
        url: tab.url,
        pageUrl: tab.url,
        text: "",
        title: tab.title,
        timestamp,
      });
    }

    chrome.storage.sync.set({ stashedLinks });
  });
});

chrome.action.onClicked.addListener((tab) => {
  openSidebar(tab.id);
});
