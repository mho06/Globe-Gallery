// Your Firebase config
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
const storage = firebase.storage();
const db = firebase.firestore();

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

// Save new artwork to Firestore + Firebase Storage
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
    // Upload image to Firebase Storage
    const storageRef = storage.ref().child(`artworks/${Date.now()}_${file.name}`);
    await storageRef.put(file);
    const imageUrl = await storageRef.getDownloadURL();

    // Save data to Firestore
    await db.collection("artworks").add({
      title,
      category,
      description,
      price,
      inShop,
      imageUrl,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

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

// Render artworks from Firestore
async function renderArtworks() {
  artworksContainer.innerHTML = "";
  const snapshot = await db.collection("artworks").orderBy("timestamp", "desc").get();
  snapshot.forEach((doc) => {
    const artwork = doc.data();
    const id = doc.id;

    const artDiv = document.createElement("div");
    artDiv.classList.add("artwork-item");

    artDiv.innerHTML = `
      <img src="${artwork.imageUrl}" alt="${artwork.title}" />
      <div class="artwork-details">
        <strong>${artwork.title}</strong><br/>
        <em>${artwork.category}</em><br/>
        <p>${artwork.description}</p>
        ${artwork.inShop 
          ? `<p><strong>Price:</strong> $${artwork.price.toFixed(2)}</p>` 
          : `<p><strong>Status:</strong> For Display Only</p>`
        }
      </div>
      <div class="artwork-actions">
        <button class="edit-btn" onclick="editArtwork('${id}')">Edit</button>
        <button class="delete-btn" onclick="deleteArtwork('${id}')">Delete</button>
      </div>
    `;
    artworksContainer.appendChild(artDiv);
  });
}

// Edit artwork
async function editArtwork(id) {
  const docRef = db.collection("artworks").doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return alert("Artwork not found.");

  const artwork = doc.data();

  const newTitle = prompt("Edit Title:", artwork.title);
  const newCategory = prompt("Edit Category:", artwork.category);
  const newDescription = prompt("Edit Description:", artwork.description);
  const newInShop = confirm("Should this artwork be available in the shop?");
  const newPrice = newInShop ? parseFloat(prompt("Edit Price:", artwork.price) || 0) : 0;

  await docRef.update({
    title: newTitle,
    category: newCategory,
    description: newDescription,
    inShop: newInShop,
    price: newPrice
  });

  alert("Artwork updated.");
  renderArtworks();
}

// Delete artwork
async function deleteArtwork(id) {
  if (!confirm("Are you sure you want to delete this artwork?")) return;
  await db.collection("artworks").doc(id).delete();
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
