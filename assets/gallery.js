// Filtering state
let tagCategory = null;
let tagValue = null;

function showTags() {
  const tagBar = document.getElementById('tag-bar');
  tagBar.innerHTML = '';

  if (!tagCategory) {
    ["decade", "surname", "people"].forEach(category => {
      const btn = document.createElement('button');
      btn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      btn.className = "tag-pill";
      btn.onclick = () => {
        tagCategory = category;
        tagValue = null;
        showTags();
        showPhotos();
      };
      tagBar.appendChild(btn);
    });
  } else if (!tagValue) {
    let values = [];
    if (tagCategory === "decade") {
      values = Array.from(new Set(photos.map(p => p.tags.decade).filter(Boolean))).sort();
    } else if (tagCategory === "surname") {
      values = Array.from(new Set(photos.map(p => p.tags.surname).filter(Boolean))).sort();
    } else if (tagCategory === "people") {
      values = Array.from(new Set(photos.flatMap(p => p.tags.people || []))).sort();
    }

    const backBtn = document.createElement('button');
    backBtn.textContent = "← Categories";
    backBtn.className = "tag-pill";
    backBtn.onclick = () => {
      tagCategory = null;
      tagValue = null;
      showTags();
      showPhotos();
    };
    tagBar.appendChild(backBtn);

    values.forEach(val => {
      const btn = document.createElement('button');
      btn.textContent = val;
      btn.className = "tag-pill";
      btn.onclick = () => {
        tagValue = val;
        showTags();
        showPhotos();
      };
      tagBar.appendChild(btn);
    });
  } else {
    const backBtn = document.createElement('button');
    backBtn.textContent = "← " + tagCategory.charAt(0).toUpperCase() + tagCategory.slice(1);
    backBtn.className = "tag-pill";
    backBtn.onclick = () => {
      tagValue = null;
      showTags();
      showPhotos();
    };
    tagBar.appendChild(backBtn);

    const valBtn = document.createElement('button');
    valBtn.textContent = tagValue;
    valBtn.className = "tag-pill active-tag";
    tagBar.appendChild(valBtn);
  }
}

function randomAngle() {
  return (Math.random() * 2 - 1).toFixed(2);
}

const TARGET_AREA = 50000;
function resizeToArea(img, area = TARGET_AREA) {
  img.onload = function() {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const aspect = img.naturalWidth / img.naturalHeight;
    const height = Math.sqrt(area / aspect);
    const width = aspect * height;
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
  };
}

function createModal(photo) {
    const modal = document.createElement('div');
    modal.id = "photo-modal";
    modal.style.position = "fixed";
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.85)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = 10000;
  
    const container = document.createElement('div');
    container.style.position = "relative";
    container.style.maxWidth = "90%";
    container.style.maxHeight = "90%";
    container.style.background = "#fff";
    container.style.padding = "1em";
    container.style.borderRadius = "1em";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "flex-start";
    container.style.overflowY = "auto";
  
    const img = document.createElement('img');
    img.src = photo.src;
    img.style.maxWidth = "100%";
    img.style.maxHeight = "70vh";
    img.style.alignSelf = "center";
    img.style.marginBottom = "1em";
  
    const infoRow = document.createElement('div');
    infoRow.style.display = "flex";
    infoRow.style.alignItems = "flex-start";
    infoRow.style.width = "100%";
    infoRow.style.gap = "1em";
  
    // ✅ Check for back photo
    const hasBack = photos.some(p =>
      p.src === photo.src.replace(/\.jpg$/, '_back.jpg')
    );
  
    // 🌀 Only show flip button if back exists
    if (hasBack) {
      const flipBtn = document.createElement('button');
      flipBtn.textContent = "↺ Flip";
      flipBtn.style.position = "absolute";
      flipBtn.style.fontSize = "1em";
      flipBtn.style.top = "1em";
      flipBtn.style.left = "1em";
      flipBtn.onclick = () => {
        const isBack = img.src.includes('_back');
        const base = photo.src.replace(/_back\.\w+$/, '').replace(/\.\w+$/, '');
        img.src = isBack ? base + ".jpg" : base + "_back.jpg";
      };
      infoRow.appendChild(flipBtn);
    }
  
    const infoBlock = document.createElement('div');
    infoBlock.style.flex = "1";
  
    const desc = document.createElement('p');
    desc.textContent = photo.description || '';
    desc.style.marginBottom = "1em";
    desc.style.fontSize = "1.5em";
    desc.style.fontWeight = "bold";
  
    infoBlock.appendChild(desc);
  
    if (photo.tags) {
      for (let key in photo.tags) {
        const line = document.createElement('div');
        line.textContent = `${key}: ${Array.isArray(photo.tags[key]) ? photo.tags[key].join(', ') : photo.tags[key]}`;
        infoBlock.appendChild(line);
      }
    }
  
    infoRow.appendChild(infoBlock);
  
    const closeBtn = document.createElement('span');
    closeBtn.textContent = "✖";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "0.5em";
    closeBtn.style.right = "0.8em";
    closeBtn.style.fontSize = "1.5em";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => modal.remove();
  
    container.appendChild(img);
    container.appendChild(infoRow);
    container.appendChild(closeBtn);
    modal.appendChild(container);
    document.body.appendChild(modal);
  }
  
  
  
  

function showPhotos() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  const filteredPhotos = photos.filter(photo => {
    const filename = photo.src.split('/').pop().toLowerCase();
    if (filename.includes('back')) return false;

    if (tagCategory && tagValue) {
      if (tagCategory === "decade") return photo.tags.decade === tagValue;
      if (tagCategory === "surname") return photo.tags.surname === tagValue;
      if (tagCategory === "people") return (photo.tags.people || []).includes(tagValue);
    }

    return true;
  });

  filteredPhotos.forEach(photo => {
    const imgElem = document.createElement('img');
    imgElem.src = photo.src;
    imgElem.alt = `${photo.tags.surname || ""} ${photo.tags.people ? photo.tags.people.join(", ") : ""} photo`;
    imgElem.style.transform = `rotate(${randomAngle()}deg)`;
    imgElem.style.margin = "10px";
    imgElem.onclick = () => createModal(photo);
    imgElem.onload = function() {
      resizeToArea(imgElem);
    };
    gallery.appendChild(imgElem);
  });

  if (filteredPhotos.length === 0) {
    gallery.innerHTML = "<p style='text-align:center'>No photos for this tag.</p>";
  }
}

// Add pill styling (can be moved to CSS later)
const tagStyle = document.createElement('style');
tagStyle.innerHTML = `
#tag-bar {
  margin: 1rem 0;
  text-align: center;
}
.tag-pill {
  background: #333;
  color: #fff;
  padding: 0.3em 0.9em;
  border-radius: 999px;
  margin: 0.2em;
  font-size: 0.95em;
  cursor: pointer;
  border: 1px solid #555;
}
.tag-pill.active-tag {
  background: #fff;
  color: #000;
  font-weight: bold;
}
`;
document.head.appendChild(tagStyle);

window.addEventListener('DOMContentLoaded', () => {
    showTags();
    showPhotos();
  
    // Upload modal trigger
    const openUploadBtn = document.getElementById('open-upload');
    if (openUploadBtn) {
      openUploadBtn.onclick = () => {
        document.getElementById('upload-modal').style.display = 'flex';
        populateDecadeDropdown();
        populateSurnames();
      };
    }
  
    // Form submission
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
    uploadForm.onsubmit = async function(e) {
        e.preventDefault();
        console.log('Submitting...');

        const formData = new FormData(uploadForm);

        // ⛳ This line right here:
        const album = window.location.pathname.match(/albums\/([^/]+)/)?.[1];

        const res = await fetch(`/albums/${album}/upload`, {
        method: 'POST',
        body: formData
        });

        if (res.ok) {
            alert('Photo uploaded!');
            document.getElementById('upload-modal').style.display = 'none';
            location.reload();  // refresh gallery in-place
          } else {
            alert('Upload failed.');
          }
          
    };
    }

  });
  