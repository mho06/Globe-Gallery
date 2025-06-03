 // Initialize Supabase
  const supabaseUrl = 'https://enlujcfoktovgfvxnrqw.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubHVqY2Zva3RvdmdmdnhucnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODY2MDYsImV4cCI6MjA2NDQ2MjYwNn0.esnA0u8NZFk-_v1upWFgz__YEFuxJFxiTZpxA9kSo3s';
  const supabase = supabase.createClient(supabaseUrl, supabaseKey);

  // Check if user is logged in
let currentUser = null;
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
}
checkAuth();


// Helper function to handle protected navigation
function requireAuth(event, url) {
  if (!currentUser) {
    event.preventDefault();
    window.location.href = 'auth.html';
  } else {
    window.location.href = url;
  }
}

// Add auth check to all nav and CTA links
document.addEventListener("DOMContentLoaded", () => {
  // Wait for user check
  checkAuth().then(() => {
    // Select all anchor tags you want to protect
    const protectedLinks = document.querySelectorAll('nav a, .cta-button, .categories a');

    protectedLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.addEventListener('click', (e) => {
        // Skip if anchor is "#" (e.g., not yet implemented)
        if (href === "#" || href.startsWith("#")) return;
        requireAuth(e, href);
      });
    });
  });
});

  function toggleMenu() {
    const menu = document.getElementById("mobileMenu");
    if (menu.style.display === "flex") {
      menu.style.animation = "slideOut 0.3s forwards";
      setTimeout(() => {
        menu.style.display = "none";
        menu.style.animation = "";
      }, 300);
    } else {
      menu.style.display = "flex";
      menu.style.animation = "slideIn 0.3s forwards";
    }
  }

  document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => {
      const menu = document.getElementById("mobileMenu");
      menu.style.animation = "slideOut 0.3s forwards";
      setTimeout(() => {
        menu.style.display = "none";
        menu.style.animation = "";
      }, 300);
    });
  });

  // Render artworks on home page
  async function renderHomeArtworks() {
    const homeContainer = document.getElementById("homeArtworks");
    homeContainer.innerHTML = "<p>Loading artworks...</p>";

    // Fetch artworks from Supabase
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });


    if (error) {
      homeContainer.innerHTML = `<p>Error loading artworks: ${error.message}</p>`;
      return;
    }

    if (!artworks || artworks.length === 0) {
      homeContainer.innerHTML = "<p>No artworks uploaded yet.</p>";
      return;
    }

    homeContainer.innerHTML = "";

    artworks.forEach((artwork) => {
      const card = document.createElement("div");
      card.classList.add("artwork-card");

      const priceDisplay = artwork.forSale && artwork.price
        ? `<p class="price">$${parseFloat(artwork.price).toFixed(2)}</p>`
        : `<p class="price"><em>For Display Only</em></p>`;

      // Supabase storage public URL - assuming image_url contains the full public URL or path you stored
      // If you store just the path, adjust accordingly to generate full URL using supabase.storage.from('bucket').getPublicUrl()
      const imageUrl = artwork.image_url || 'placeholder.jpg';

      card.innerHTML = `
        <a href="#" class="artwork-link" data-id="${artwork.id}">

          <img src="${imageUrl}" alt="${artwork.title}" />
          <div class="details">
            <h3>${artwork.title}</h3>
            <p>${artwork.description}</p>
            <p><strong>Category:</strong> ${artwork.category}</p>
            ${priceDisplay}
          </div>
        </a>
      `;

      homeContainer.appendChild(card);
      // Protect artwork links
card.querySelector('.artwork-link').addEventListener('click', (e) => {
  if (!currentUser) {
    e.preventDefault();
    window.location.href = 'login.html';
  } else {
    window.location.href = `collections.html?id=${artwork.id}`;
  }
});

    });
  }

  document.addEventListener("DOMContentLoaded", renderHomeArtworks);