 // Initialize Supabase
  const supabaseUrl = 'https://enlujcfoktovgfvxnrqw.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubHVqY2Zva3RvdmdmdnhucnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODY2MDYsImV4cCI6MjA2NDQ2MjYwNn0.esnA0u8NZFk-_v1upWFgz__YEFuxJFxiTZpxA9kSo3s';
  const supabase = supabase.createClient(supabaseUrl, supabaseKey);

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
        <a href="collections.html?id=${artwork.id}">
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
    });
  }

  document.addEventListener("DOMContentLoaded", renderHomeArtworks);