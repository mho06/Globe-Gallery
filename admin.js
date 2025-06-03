import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.42.3/+esm';

// Supabase config
const SUPABASE_URL = "https://enlujcfoktovgfvxnrqw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubHVqY2Zva3RvdmdmdnhucnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODY2MDYsImV4cCI6MjA2NDQ2MjYwNn0.esnA0u8NZFk-_v1upWFgz__YEFuxJFxiTZpxA9kSo3s";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const uploadForm = document.getElementById("uploadForm");
const artworksContainer = document.getElementById("artworksContainer");
const imagePreview = document.getElementById("imagePreview");

// Preview uploaded image
uploadForm.imageFile.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 150px; max-height: 150px; border-radius: 5px; border: 1px solid #ccc;" />`;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.innerHTML = "";
  }
});

// Save new artwork to Supabase Storage + Database
uploadForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(uploadForm);
  const file = formData.get("imageFile");

  if (!file || !file.type.startsWith("image/")) {
    alert("Please upload a valid image file.");
    return;
  }

  const title = formData.get("title");
  const category = formData.get("category");
  const description = formData.get("description");
  const inShop = formData.get("addToShop") === "on";
  const price = inShop ? parseFloat(formData.get("price")) || 0 : 0;

  try {
    // Upload image to Supabase Storage (no "public/" prefix!)
    const filePath = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('artworks')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL of the image
    const { data: { publicUrl } } = supabase.storage
      .from('artworks')
      .getPublicUrl(filePath);

    // Insert data into Supabase table 'artworks'
    const { error: insertError } = await supabase
      .from('artworks')
      .insert([{
        title,
        category,
        description,
        price,
        inShop,
        imageUrl: publicUrl,
        created_at: new Date().toISOString()
      }]);

    if (insertError) throw insertError;

    alert("Artwork uploaded successfully!");
    uploadForm.reset();
    imagePreview.innerHTML = "";
    document.getElementById("priceContainer").style.display = "none";
    renderArtworks();
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Error uploading artwork.");
  }
});

// Render artworks from Supabase
async function renderArtworks() {
  artworksContainer.innerHTML = "";
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false });


  if (error) {
    console.error("Failed to fetch artworks:", error);
    artworksContainer.innerHTML = "<p>Error loading artworks.</p>";
    return;
  }

  if (!artworks.length) {
    artworksContainer.innerHTML = "<p>No artworks uploaded yet.</p>";
    return;
  }

  artworks.forEach(artwork => {
    const artDiv = document.createElement("div");
    artDiv.classList.add("artwork-item");

    artDiv.innerHTML = `
      <img src="${artwork.imageUrl}" alt="${artwork.title}" />
      <div class="artwork-details">
        <strong>${artwork.title}</strong><br/>
        <em>${artwork.category}</em><br/>
        <p>${artwork.description}</p>
        ${artwork.inShop 
          ? `<p><strong>Price:</strong> $${parseFloat(artwork.price).toFixed(2)}</p>` 
          : `<p><strong>Status:</strong> For Display Only</p>`
        }
      </div>
      <div class="artwork-actions">
        <button class="edit-btn" onclick="editArtwork('${artwork.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteArtwork('${artwork.id}')">Delete</button>
      </div>
    `;
    artworksContainer.appendChild(artDiv);
  });
}

// Edit artwork
async function editArtwork(id) {
  const { data: artwork, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !artwork) return alert("Artwork not found.");

  const newTitle = prompt("Edit Title:", artwork.title);
  const newCategory = prompt("Edit Category:", artwork.category);
  const newDescription = prompt("Edit Description:", artwork.description);
  const newInShop = confirm("Should this artwork be available in the shop?");
  const newPrice = newInShop ? parseFloat(prompt("Edit Price:", artwork.price) || 0) : 0;

  const { error: updateError } = await supabase
    .from('artworks')
    .update({
      title: newTitle,
      category: newCategory,
      description: newDescription,
      inShop: newInShop,
      price: newPrice
    })
    .eq('id', id);

  if (updateError) {
    alert("Failed to update artwork.");
    return;
  }

  alert("Artwork updated.");
  renderArtworks();
}

// Delete artwork
async function deleteArtwork(id) {
  if (!confirm("Are you sure you want to delete this artwork?")) return;

  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id);

  if (error) {
    alert("Failed to delete artwork.");
    return;
  }

  alert("Artwork deleted.");
  renderArtworks();
}

// Toggle price input
document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("addToShopCheckbox");
  const priceInput = document.getElementById("price");
  const priceContainer = document.getElementById("priceContainer");

  const togglePriceVisibility = () => {
    if (checkbox.checked) {
      priceContainer.style.display = "block";
      priceInput.required = true;
    } else {
      priceContainer.style.display = "none";
      priceInput.required = false;
      priceInput.value = "";
    }
  };

  checkbox.addEventListener("change", togglePriceVisibility);
  togglePriceVisibility();
  renderArtworks();
});
