function getArtworkIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.has("id") ? parseInt(params.get("id")) : null;
}

// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyBwCwoyzuVPrNQ8kt3yPfkpHLfloQTYHmw",
  authDomain: "globe-gallery-1.firebaseapp.com",
  projectId: "globe-gallery-1",
  storageBucket: "globe-gallery-1.appspot.com",
  messagingSenderId: "20673593446",
  appId: "1:20673593446:web:0ad86df1c323ffed17eda7",
  measurementId: "G-9871ZXVCN6"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function renderCollections() {
  const container = document.getElementById("collectionsContainer");
  const filter = document.getElementById("categoryFilter").value;
  const selectedId = getArtworkIdFromURL(); // this is now the Firestore doc ID

  container.innerHTML = "";

  if (selectedId) {
    // Show full view of selected artwork
    try {
      const doc = await db.collection("artworks").doc(selectedId).get();
      if (!doc.exists) {
        container.innerHTML = "<p>Artwork not found.</p>";
        return;
      }

      const artwork = doc.data();
      document.getElementById("filters").style.display = "none";

      container.innerHTML = `
        <div class="artwork-fullview">
          <div class="image-container">
            <img src="${artwork.imageUrl}" alt="${artwork.title}" class="zoomable" />
          </div>
          <div class="info">
            <h2>${artwork.title}</h2>
            <p>${artwork.description}</p>
            <p><strong>Category:</strong> ${artwork.category}</p>
            ${
              artwork.inShop
                ? `<p><strong>Price:</strong> $${artwork.price.toFixed(2)}</p>`
                : `<p><strong>Status:</strong> For Display Only</p>`
            }
            <a href="collections.html" class="back-link">← Back to all collections</a>
          </div>
        </div>
      `;
    } catch (error) {
      console.error("Error loading artwork:", error);
      container.innerHTML = "<p>Error loading artwork.</p>";
    }

    return;
  }

  // Show filter bar
  document.getElementById("filters").style.display = "block";

  try {
    const snapshot = await db.collection("artworks").orderBy("timestamp", "desc").get();
    const artworks = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(
        art =>
          (filter === "All" || art.category === filter) &&
          ["Coins", "Banknotes", "Arts", "Books", "Paintings", "Photographs"].includes(art.category)
      );

    if (artworks.length === 0) {
      container.innerHTML = "<p>No artworks found for this category.</p>";
      return;
    }

    container.classList.add("artwork-grid");

    artworks.forEach(artwork => {
      const card = document.createElement("div");
      card.classList.add("artwork-card");

      card.innerHTML = `
        <a href="collections.html?id=${artwork.id}">
          <img src="${artwork.imageUrl}" alt="${artwork.title}" />
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
  } catch (error) {
    console.error("Error fetching artworks:", error);
    container.innerHTML = "<p>Error loading artworks.</p>";
  }
}

function getArtworkIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// On page load
document.addEventListener("DOMContentLoaded", () => {
  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", renderCollections);
  }
  renderCollections();
});


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
