let currentAvatar = null;
let editingCard = null;
const contactList = document.getElementById('contactList');
const searchInput = document.getElementById('searchInput');
const contactForm = document.getElementById('contactForm');
const avatarUpload = document.getElementById('avatarUpload');
const avatarPreview = document.getElementById('avatarPreview');

// Gestion de l'upload d'avatar
avatarUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            avatarPreview.src = e.target.result;
            currentAvatar = file; // Conserver le fichier pour l'envoi
        }
        reader.readAsDataURL(file);
    }
});

// Soumission du formulaire principal
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    addContact();
});

async function addContact() {
    const formData = new FormData();
    formData.append('name', document.getElementById('fullName').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('category', document.querySelector('input[name="category"]:checked').value);
    
    if(avatarUpload.files[0]) {
        formData.append('avatar', avatarUpload.files[0]);
    }

    try {
        const response = await fetch('add_contact.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if(result.status === 'success') {
            renderContacts();
            resetForm();
            showAlert('Contact ajouté avec succès', 'success');
        } else {
            showAlert(result.message, 'error');
        }
    } catch(error) {
        showAlert('Erreur de connexion au serveur', 'error');
    }
}

async function deleteContact(contactId) {
    if(!confirm('Voulez-vous vraiment supprimer ce contact ?')) return;
    
    try {
        const response = await fetch('delete_contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ id: contactId })
        });
        const result = await response.json();
        
        if(result.status === 'success') {
            showAlert('Contact supprimé', 'success');
            renderContacts();
        } else {
            showAlert(result.message, 'error');
        }
    } catch(error) {
        showAlert('Erreur de suppression', 'error');
    }
}

function editContact(contactId) {
    if(editingCard) return;
    
    const contactCard = document.querySelector(`.contact-card[data-id="${contactId}"]`);
    editingCard = contactCard;

    fetch(`get_contact.php?id=${contactId}`)
        .then(response => response.json())
        .then(contact => {
            const editForm = document.createElement('form');
            editForm.className = 'edit-form';
            editForm.innerHTML = `
                <div class="form-row">
                    <input type="text" value="${contact.name}" class="edit-name" required>
                </div>
                <div class="form-row">
                    <input type="tel" value="${contact.phone || ''}" class="edit-phone">
                    <input type="email" value="${contact.email || ''}" class="edit-email">
                </div>
                <div class="form-row">
                    <select class="edit-category">
                        <option value="ami" ${contact.category === 'ami' ? 'selected' : ''}>Ami</option>
                        <option value="famille" ${contact.category === 'famille' ? 'selected' : ''}>Famille</option>
                        <option value="professionnel" ${contact.category === 'professionnel' ? 'selected' : ''}>Professionnel</option>
                    </select>
                </div>
                <div class="form-row">
                    <input type="file" class="edit-avatar" accept="image/*">
                </div>
                <div class="button-group">
                    <button type="submit" class="save-btn">Enregistrer</button>
                    <button type="button" class="cancel-btn">Annuler</button>
                </div>
            `;

            editForm.onsubmit = (e) => {
                e.preventDefault();
                saveChanges(contactId, editForm);
            };

            editForm.querySelector('.cancel-btn').onclick = () => {
                contactCard.classList.remove('editing');
                contactCard.removeChild(editForm);
                editingCard = null;
            };

            contactCard.classList.add('editing');
            contactCard.appendChild(editForm);
        })
        .catch(error => {
            showAlert('Erreur de chargement du contact', 'error');
        });
}

async function saveChanges(contactId, form) {
    const formData = new FormData();
    formData.append('id', contactId);
    formData.append('name', form.querySelector('.edit-name').value);
    formData.append('phone', form.querySelector('.edit-phone').value);
    formData.append('email', form.querySelector('.edit-email').value);
    formData.append('category', form.querySelector('.edit-category').value);
    
    const avatarInput = form.querySelector('.edit-avatar');
    if(avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
    }

    try {
        const response = await fetch('update_contact.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if(result.status === 'success') {
            showAlert('Modifications sauvegardées', 'success');
            renderContacts();
        } else {
            showAlert(result.message, 'error');
        }
    } catch(error) {
        showAlert('Erreur de mise à jour', 'error');
    } finally {
        editingCard = null;
    }
}

function resetForm() {
    contactForm.reset();
    avatarPreview.src = 'uploads/default.png';
    currentAvatar = null;
    document.querySelector('input[name="category"][value="ami"]').checked = true;
}

async function renderContacts() {
    try {
        const response = await fetch(`search_contacts.php?search=${encodeURIComponent(searchInput.value)}`);
        const contacts = await response.json();
        
        contactList.innerHTML = '';
        contacts.forEach(contact => {
            const contactCard = document.createElement('div');
            contactCard.className = 'contact-card';
            contactCard.dataset.id = contact.id;
            contactCard.innerHTML = `
                <div class="context-menu">
                    <div class="menu-item edit" onclick="editContact(${contact.id})">✏️ Modifier</div>
                    <div class="menu-item delete" onclick="deleteContact(${contact.id})">🗑️ Supprimer</div>
                </div>
                <h3>
                    <img src="uploads/${contact.avatar}" alt="Avatar">
                    ${contact.name}
                </h3>
                <div class="contact-info">
                    <div>${contact.phone || 'Non renseigné'}</div>
                    <div>${contact.email || 'Non renseigné'}</div>
                    <div>${contact.category}</div>
                </div>
            `;
            contactList.appendChild(contactCard);
        });
    } catch(error) {
        showAlert('Erreur de chargement des contacts', 'error');
    }
}

function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 3000);
}

// Gestion de la recherche en temps réel
searchInput.addEventListener('input', () => {
    renderContacts();
});

// Chargement initial
renderContacts();