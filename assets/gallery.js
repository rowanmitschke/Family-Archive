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
    modal.id = 'photo-modal';
    Object.assign(modal.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.9)',
      zIndex: '10000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible'
    });
  
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content'; // we'll style this in CSS
    Object.assign(modalContent.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      borderRadius: '12px',
      padding: '2em',
      maxWidth: '85vw',
      maxHeight: '85vh',
      overflow: 'visible',
      textAlign: 'center',
      position: 'relative'  // important for proper layout
    });
  
    modal.appendChild(modalContent);
  
    let currentIndex = photos.findIndex(p => p.src === photo.src);
    if (currentIndex < 0) return;
  
    function makePreview(p, isMain = false) {
        const img = document.createElement('img');
        img.src = p.src;
        Object.assign(img.style, {
          maxHeight: isMain ? '65vh' : '50vh',
          opacity: isMain ? '1' : '0.3',
          transform: isMain ? 'scale(1)' : 'scale(0.85)',
          cursor: isMain ? 'default' : 'pointer',
          transition: 'all 0.3s ease',
          borderRadius: '8px',
        });
      
        if (!isMain) {
          img.onclick = () => render(photos.indexOf(p));
        }
      
        return img;
      }
      

    function render(index) {
      modalContent.innerHTML = ''; // Clear content
  
      const photoData = photos[index];
      const parts = photoData.src.split('/');
      const filename = parts.pop();
      const albumPath = parts.join('/') + '/';
      const ext = filename.split('.').pop();
      const baseName = filename.replace(/_back\.\w+$/, '').replace(/\.\w+$/, '');
      const frontSrc = `${albumPath}${baseName}.${ext}`;
      const backSrc = `${albumPath}${baseName}_back.${ext}`;
      const hasBack = allPhotos.some(p => p.src === backSrc);
  
      // Header
      const header = document.createElement('div');
      header.innerHTML = `
        <h2 style="margin: 0 0 0.4em;">${photoData.description || 'Untitled'}</h2>
        <div style="font-size: 0.9em; color: #555;">
          ${photoData.tags?.date || 'Unknown date'} · ${photoData.tags?.decade || 'Unknown decade'}
        </div>
      `;
  
      // Flip Button
      const flipBtn = document.createElement('button');
      flipBtn.textContent = '↺ Flip';
      Object.assign(flipBtn.style, {
        position: 'absolute',
        top: '1em',
        right: '1.2em',
        fontSize: '1em',
        padding: '0.4em 0.8em',
        cursor: 'pointer',
        borderRadius: '6px',
        border: 'none',
        background: '#111',
        color: '#fff',
        display: hasBack ? 'block' : 'none'
      });
  
      // Photo Strip container
        const row = document.createElement('div');
            Object.assign(row.style, {
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            width: '100%',
            height: '70vh',
            position: 'relative',
            });

            // Left preview container
            const leftCell = document.createElement('div');
            leftCell.style.display = 'flex';
            leftCell.style.justifyContent = 'flex-end';
            leftCell.style.paddingRight = '2em';

            // Center (main) container
            const centerCell = document.createElement('div');
            centerCell.style.display = 'flex';
            centerCell.style.justifyContent = 'center';

            // Right preview container
            const rightCell = document.createElement('div');
            rightCell.style.display = 'flex';
            rightCell.style.justifyContent = 'flex-start';
            rightCell.style.paddingLeft = '2em';

            // Main image
            const mainImg = makePreview(photoData, true);
            mainImg.style.maxHeight = '65vh';
            mainImg.style.zIndex = '2';
            centerCell.appendChild(mainImg);

            // Flip logic
            let isBack = false;
            flipBtn.onclick = () => {
            isBack = !isBack;
            mainImg.src = isBack ? backSrc : frontSrc;
            };

            // Previews
            function findPreviousValid(index) {
                for (let i = index - 1; i >= 0; i--) {
                  if (!photos[i].src.includes('_back')) return photos[i];
                }
                return null;
              }
              
            function findNextValid(index) {
                for (let i = index + 1; i < photos.length; i++) {
                  if (!photos[i].src.includes('_back')) return photos[i];
                }
                return null;
              }

              const prevPhoto = findPreviousValid(index);
              if (prevPhoto) {
                const prev = makePreview(prevPhoto);
                leftCell.appendChild(prev);
              }
              
              const nextPhoto = findNextValid(index);
              if (nextPhoto) {
                const next = makePreview(nextPhoto);
                rightCell.appendChild(next);
              }
                         
             
            row.appendChild(leftCell);
            row.appendChild(centerCell);
            row.appendChild(rightCell);

  
      
  
      // People tags
      const peopleRow = document.createElement('div');
      if (photoData.tags?.people?.length) {
        peopleRow.textContent = 'People: ' + photoData.tags.people.join(', ');
        Object.assign(peopleRow.style, {
          textAlign: 'center',
          marginTop: '1em',
          color: '#333',
          fontSize: '0.95em'
        });
      }
  
      // Close
      const closeBtn = document.createElement('span');
      closeBtn.textContent = 'X';
      Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '1em',
        left: '1.2em',
        fontSize: '1.5em',
        cursor: 'pointer',
        color: 'black'
      });
      closeBtn.onclick = () => modal.remove();
  
      modalContent.appendChild(header);
      modalContent.appendChild(flipBtn);
      modalContent.appendChild(closeBtn);
      modalContent.appendChild(row);
      modalContent.appendChild(peopleRow);
    }
  
    render(currentIndex);
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
  