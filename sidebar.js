function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (e) {
    return "Unknown date";
  }
}

function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

function displayStashedLinks() {
  console.log("Displaying stashed links");

  chrome.storage.sync.get({ stashedLinks: [] }, (data) => {
    console.log("Retrieved data:", data);

    const stashContainer = document.getElementById("stashContainer");
    if (!stashContainer) {
      console.error("Could not find stashContainer element");
      return;
    }

    stashContainer.innerHTML = "";

    if (!Array.isArray(data.stashedLinks) || data.stashedLinks.length === 0) {
      console.log("No stashed links found");
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "empty-message";
      emptyMessage.textContent =
        'No stashed items yet. Right-click on text or links and select "Add to Stash".';
      stashContainer.appendChild(emptyMessage);
      return;
    }

    console.log(`Found ${data.stashedLinks.length} stashed items`);

    // Sort by timestamp, newest first
    const sortedLinks = [...data.stashedLinks].sort((a, b) => {
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });

    sortedLinks.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "card";

      // Add click handler to open the URL
      card.addEventListener("click", () => {
        window.open(item.url, "_blank");
      });

      // Card title
      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = item.title || "Untitled";
      card.appendChild(title);

      // Card text (if available)
      if (item.text && item.text !== item.url) {
        const text = document.createElement("div");
        text.className = "card-text";
        text.textContent = item.text;
        card.appendChild(text);
      }

      // Card URL
      const urlElement = document.createElement("div");
      urlElement.className = "card-url";
      urlElement.textContent = truncateText(item.url, 50);
      urlElement.title = item.url;
      card.appendChild(urlElement);

      // Card timestamp
      const time = document.createElement("div");
      time.className = "card-time";
      time.textContent = formatDate(item.timestamp);
      card.appendChild(time);

      // Delete button with SVG icon
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>`;
      deleteBtn.title = "Delete";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent card click

        // Remove this item
        chrome.storage.sync.get({ stashedLinks: [] }, (data) => {
          if (!Array.isArray(data.stashedLinks)) return;

          // Find the correct index in the actual storage array
          const updatedLinks = data.stashedLinks.filter(
            (_, i) => i !== sortedLinks.indexOf(item)
          );

          chrome.storage.sync.set({ stashedLinks: updatedLinks }, () => {
            console.log("Item deleted, refreshing display");
            displayStashedLinks(); // Refresh display
          });
        });
      });

      card.appendChild(deleteBtn);
      stashContainer.appendChild(card);
    });
  });
}

// Make sure to listen for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Sidebar DOM content loaded");
  displayStashedLinks();
});

// Also listen for storage changes to update the UI in real-time
chrome.storage.onChanged.addListener((changes) => {
  console.log("Storage changed:", changes);
  if (changes.stashedLinks) {
    displayStashedLinks();
  }
});
