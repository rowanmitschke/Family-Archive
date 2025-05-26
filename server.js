const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


console.log('✅ Express server is running from:', __dirname);

// Session middleware (only define once!)
app.use(session({
  secret: 'family-archive-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days  
   } // or 'strict'
}));

// Needed to parse form submissions
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index'); // looks for views/index.ejs
  });  

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// GET route for album (shows form or success message)
const fs = require('fs');
let passwords;

if (fs.existsSync('./passwords.json')) {
  passwords = require('./passwords.json');
} else {
  passwords = require('./passwords.template.json');
}


app.get('/albums/:name', (req, res) => {
    const album = req.params.name;
    const albumPath = path.join(__dirname, 'albums', album);
    const metadataPath = path.join(albumPath, 'metadata.json');
  
    // ✅ Make sure this album key exists
    if (!passwords[album]) {
        return res.status(404).send('Album does not exist.');
      }
    
    console.log("Session access:", req.session);
    console.log("Password:", passwords[album])
    console.log("Requested album:", album);
      
    if (!req.session[`access_${album}`]) {
      return res.send(`
        <h2>Enter password for ${album}</h2>
        <form method="POST">
          <input type="password" name="password" required />
          <button type="submit">View Album</button>
        </form>
      `);
    }
  
    // Load metadata
    let photos = [];
    if (fs.existsSync(metadataPath)) {
      const raw = fs.readFileSync(metadataPath, 'utf-8');
      photos = JSON.parse(raw); // Array of objects with { src, tags, description }
    } else {
      const files = fs.readdirSync(albumPath);
      photos = files.filter(file => /\.(jpe?g|png|gif)$/i.test(file))
        .map(file => ({
          src: file,
          tags: {},
          description: ""
        }));
    }
  
    res.render('album', {
      albumName: album,
      photos
    });
  });
  
  

app.use('/albums', express.static(path.join(__dirname, 'albums')));


// POST route to handle password submission
app.post('/albums/:name', (req, res) => {
    const album = req.params.name;
    const password = req.body.password;
  
    if (passwords[album] && password === passwords[album]) {
      req.session[`access_${album}`] = true;
      return req.session.save(() => {
        res.redirect(`/albums/${album}`);
      });
    }
  
    res.send('❌ Incorrect password. <a href="">Try again</a>.');
  });
  

const multer = require('multer');
// Configure multer upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const albumDir = path.join(__dirname, 'albums', req.params.name);
        fs.mkdirSync(albumDir, { recursive: true }); // ensure directory exists
        cb(null, albumDir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + file.originalname;
      cb(null, unique);
    }
  });

const upload = multer({ storage }); // use the storage config defined above

app.post('/albums/:name/upload', upload.fields([{ name: 'front' }, { name: 'back' }]), (req, res) => {
    const album = req.params.name;
    const albumDir = path.join(__dirname, 'albums', album);
    const metadataPath = path.join(albumDir, 'metadata.json');
  
    const front = req.files.front?.[0];
    const back = req.files.back?.[0];
    const date = req.body.date;
    const decade = req.body.decade;
    const surname = req.body.surname;
    const description = req.body.description;
    const people = req.body.people ? JSON.parse(req.body.people) : [];
  
    if (!front) return res.status(400).send('Missing front photo');
  
    // Ensure album folder exists
    fs.mkdirSync(albumDir, { recursive: true });
  
    // Load existing metadata to count current images
    let metadata = [];
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath));
    }
  
    // Generate next image number
    const nextNum = String(metadata.length + 1).padStart(4, '0'); // e.g. 0001
    const baseName = `img_${nextNum}`;
  
    // Build file paths
    const frontFilename = `${baseName}.jpg`;
    const frontPath = path.join(albumDir, frontFilename);
    fs.renameSync(front.path, frontPath);
  
    let backFilename = null;
    if (back) {
      backFilename = `${baseName}_back.jpg`;
      const backPath = path.join(albumDir, backFilename);
      fs.renameSync(back.path, backPath);
    }
  
    metadata.push({
      src: frontFilename,
      tags: { date, decade, surname, people },
      description
    });
  
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    res.sendStatus(200);
  });
  

app.get('/about', (req, res) => {
res.render('about.ejs'); // This will render views/about.ejs
});

app.get('/login', (req, res) => {
res.render('login.ejs'); // This will render views/login.ejs
});
  


// 404 fallback
app.all('*', (req, res) => {
  res.status(404).send(`Path not found: ${req.path}`);
});

app.listen(4444, () => {
  console.log('🚀 Server running at http://localhost:4444');
});

