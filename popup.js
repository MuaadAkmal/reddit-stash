document.getElementById('stashButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    const title = tabs[0].title;
    
    chrome.storage.sync.get({ stashedLinks: [] }, (data) => {
      const stashedLinks = data.stashedLinks || [];
      stashedLinks.push({ 
        url,
        pageUrl: url,
        text: "",
        title,
        timestamp: new Date().toISOString()
      });
      chrome.storage.sync.set({ stashedLinks });
      displayStashedLinks();
    });
  });
});

document.getElementById('openSidebarButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      try {
        if (chrome.sidePanel) {
          chrome.sidePanel.open({ tabId: tabs[0].id }).catch(error => {
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
  });
});

function displayStashedLinks() {
  chrome.storage.sync.get({ stashedLinks: [] }, (data) => {
    const stashList = document.getElementById('stashList');
    stashList.innerHTML = '';
    
    if (!Array.isArray(data.stashedLinks) || data.stashedLinks.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-message';
      emptyMsg.textContent = 'No stashed items yet';
      stashList.innerHTML = '';
      stashList.appendChild(emptyMsg);
      return;
    }
    
    // Display the 5 most recent items
    const recentItems = [...data.stashedLinks]
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 5);
    
    recentItems.forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title || item.url;
      a.title = item.url; // Show full URL on hover
      a.target = '_blank';
      li.appendChild(a);
      stashList.appendChild(li);
    });
  });
}

document.addEventListener('DOMContentLoaded', displayStashedLinks);