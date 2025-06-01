function getArtworkIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.has("id") ? parseInt(params.get("id")) : null;
}

function renderCollections() {
  const container = document.getElementById("collectionsContainer");
  const filter = document.getElementById("categoryFilter").value;
  const savedArtworks = localStorage.getItem("globeGalleryArtworks");
  const artworks = savedArtworks ? JSON.parse(savedArtworks) : [];
  const selectedId = getArtworkIdFromURL();

  container.innerHTML = "";

  // Full view for single artwork
  if (selectedId !== null && artworks[selectedId]) {
    const artwork = artworks[selectedId];
    document.getElementById("filters").style.display = "none";

    container.innerHTML = `
      <div class="artwork-fullview">
        <div class="image-container">
          <img src="${artwork.imageData}" alt="${artwork.title}" class="zoomable" />
        </div>
        <div class="info">
          <h2>${artwork.title}</h2>
          <p>${artwork.description}</p>
          <p><strong>Category:</strong> ${artwork.category}</p>
          ${artwork.inShop
            ? `<p><strong>Price:</strong> $${artwork.price.toFixed(2)}</p>`
            : `<p><strong>Status:</strong> For Display Only</p>`}
          <a href="collections.html" class="back-link">← Back to all collections</a>
        </div>
      </div>
    `;
    return;
  }

  // Show filter UI
  document.getElementById("filters").style.display = "block";

  // Filter collection categories
  const filtered = artworks.filter(
    art =>
      (filter === "All" || art.category === filter) &&
      ["Coins", "Banknotes", "Arts", "Books", "Paintings", "Photographs"].includes(art.category)
  );

  if (filtered.length === 0) {
    container.innerHTML = "<p>No artworks found for this category.</p>";
    return;
  }

  // Render artwork cards
  container.classList.add("artwork-grid");
  filtered.forEach((artwork, index) => {
    const card = document.createElement("div");
    card.classList.add("artwork-card");
    card.innerHTML = `
      <a href="collections.html?id=${index}">
        <img src="${artwork.imageData}" alt="${artwork.title}" />
        <div class="details">
          <h3>${artwork.title}</h3>
          <p>${artwork.description}</p>
          <p><strong>Category:</strong> ${artwork.category}</p>
          ${
            artwork.inShop
              ? `<p class="price">$${artwork.price.toFixed(2)}</p>`
              : `<p class="price"><em>For Display Only</em></p>`
          }
        </div>
      </a>
    `;
    container.appendChild(card);
  });
}

// Image zoom handler
document.addEventListener("click", function (e) {
  const img = document.querySelector(".zoomable");
  if (img && e.target === img) {
    img.classList.toggle("zoomed");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("categoryFilter").addEventListener("change", renderCollections);
  renderCollections();
});
