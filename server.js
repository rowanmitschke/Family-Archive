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

// Serve index.html from root
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  console.log('🔍 Attempting to serve:', filePath);
  res.sendFile(filePath);
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// GET route for album (shows form or success message)
const fs = require('fs');

app.get('/albums/:name', (req, res) => {
    const album = req.params.name;
    console.log('📦 Incoming session:', req.session); 
    const albumPath = path.join(__dirname, 'albums', album);
    const metadataPath = path.join(albumPath, 'metadata.json');
  
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
  
    const passwords = require('./passwords.json');
  
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

  const newName = `img_${Date.now()}.jpg`;
  const finalFront = path.join(albumDir, newName);
  const finalBack = back ? path.join(albumDir, newName.replace(/\.jpg$/, '_back.jpg')) : null;

  fs.renameSync(front.path, finalFront);
  if (back) fs.renameSync(back.path, finalBack);

  let metadata = [];
  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath));
  }

  metadata.push({
    src: newName,
    tags: { date, decade, surname, people },
    description
  });

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  res.sendStatus(200);
});


// 404 fallback
app.all('*', (req, res) => {
  res.status(404).send(`Path not found: ${req.path}`);
});

app.listen(4444, () => {
  console.log('🚀 Server running at http://localhost:4444');
});

