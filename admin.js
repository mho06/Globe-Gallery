const uploadForm = document.getElementById("uploadForm");
const artworksContainer = document.getElementById("artworksContainer");
const imagePreview = document.getElementById("imagePreview");

// Load artworks from localStorage
let artworks = JSON.parse(localStorage.getItem("globeGalleryArtworks")) || [];

// Preview image
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

function saveArtworks() {
  localStorage.setItem("globeGalleryArtworks", JSON.stringify(artworks));
}

function renderArtworks() {
  artworksContainer.innerHTML = "";
  artworks.forEach((artwork, index) => {
    const artDiv = document.createElement("div");
    artDiv.classList.add("artwork-item");

    artDiv.innerHTML = `
      <img src="${artwork.imageData}" alt="${artwork.title}" />
      <div class="artwork-details">
        <strong>${artwork.title}</strong> <br/>
        <em>${artwork.category}</em> <br/>
        <p>${artwork.description}</p>
        ${artwork.inShop 
          ? `<p><strong>Price:</strong> $${artwork.price.toFixed(2)}</p>` 
          : `<p><strong>Status:</strong> For Display Only</p>`
        }
      </div>
      <div class="artwork-actions">
        <button class="edit-btn" onclick="editArtwork(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteArtwork(${index})">Delete</button>
      </div>
    `;

    artworksContainer.appendChild(artDiv);
  });
}


function deleteArtwork(index) {
  if (confirm("Are you sure you want to delete this artwork?")) {
    artworks.splice(index, 1);
    saveArtworks();
    renderArtworks();
  }
}

function editArtwork(index) {
  const artwork = artworks[index];

  const newTitle = prompt("Edit Title:", artwork.title);
  if (newTitle !== null && newTitle.trim() !== "") {
    artwork.title = newTitle.trim();
  }

  const newCategory = prompt("Edit Category:", artwork.category);
  if (newCategory !== null && newCategory.trim() !== "") {
    artwork.category = newCategory.trim();
  }

  const newDescription = prompt("Edit Description:", artwork.description);
  if (newDescription !== null && newDescription.trim() !== "") {
    artwork.description = newDescription.trim();
  }

  const newInShop = confirm("Should this artwork be available in the shop?");
  artwork.inShop = newInShop;

  if (newInShop) {
    const newPrice = prompt("Edit Price (USD):", artwork.price);
    const priceNum = parseFloat(newPrice);
    if (!isNaN(priceNum) && priceNum >= 0) {
      artwork.price = priceNum;
    }
  } else {
    artwork.price = 0;
  }

  saveArtworks();
  renderArtworks();
}

uploadForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(uploadForm);
  const file = formData.get("imageFile");

  if (!file || !file.type.startsWith("image/")) {
    alert("Please upload a valid image file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const inShop = formData.get("addToShop") === "on";
    const price = inShop ? parseFloat(formData.get("price")) || 0 : 0;

    const newArtwork = {
      title: formData.get("title"),
      category: formData.get("category"),
      description: formData.get("description"),
      price: price,
      imageData: e.target.result,
      inShop: inShop,
    };

    artworks.push(newArtwork);
    saveArtworks();
    renderArtworks();
    uploadForm.reset();
    imagePreview.innerHTML = "";
    document.getElementById("priceContainer").style.display = "none";
  };

  reader.readAsDataURL(file);
});

// Handle price visibility toggle
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
  togglePriceVisibility(); // set initial state
});

// Initial render
renderArtworks();
