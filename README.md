# Piktos

A web-based photo album tool designed with privacy and connection in mind - to store and share photos in a beautiful, minimalist environment free of the noise and distractions of social media. Built with Node.js, Express, and EJS templates.

## Features

- Password-protected albums
- Tag filtering
- Upload tool with metadata input and preview
- Flip between front/back of photos
- CSV metadata import
- Full gallery search and filtering

Future Features in works:
- Editable metadata modal
- User accounts for easy viewing of all albums you have access to

## Personal Use Setup

1. **Clone this repository:**

   ```bash
   git clone https://github.com/yourusername/family-archive.git
   cd family-archive
2. **Install dependencies:**
   ```bash
   npm install
3. **Create a passwords.json file (NOT committed):**
    {
    "lastname": "your-password",
    "event": "another-password"
    }
    Or copy from the provided template:
    cp passwords.template.json passwords.json

4. **Run the server:**
   ```bash
    node server.js
5. **Visit http://localhost:4444**

## ⚠️ Do Not Commit Private Information

The .gitignore file should take care of private information, but just be careful so that you don't accidentally publicly share information and photos that you want to keep private.

Albums that may contain private information:    
- albums/ folder 
- passwords.json 

## 📄 License
This project is licensed under a Personal Use License — see the LICENSE.txt file for details.

Created by Rowan Mitschke