import express from 'express'; //importiren exppress
import path from 'path'; // importiren von path (verzeichnes)
import { fileURLToPath } from 'url'; // Macht aus URL einen Dateipfad
import { createRequire } from 'module'; // Erlaubt require in ES-Modulen
import multer from 'multer';   // dateiploads
import fs from 'fs/promises';  // dateisystem
import https from 'https'; // httpps
import session from 'express-session';



let id = 1;
const require = createRequire(import.meta.url);  //require
const { writeFile } = require('fs/promises');   //require
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);  

const { readFile } = require('fs/promises');

//Hier alle pfäde für json dateien
const modellspath = path.join(__dirname, 'data', 'json', 'models.json');  //path zu modells.json
const infopath = path.join(__dirname, 'data', 'json', 'info.json');  //path zu info.json
const userpath = path.join(__dirname, 'data', 'json', 'user.json');  //path zu info.json
 
//server variablen
const app = express();
const port = 1000;

// Https key
const httpsOptions = { 
  key: await fs.readFile(path.join(__dirname, 'ssl', 'key.pem')),
  cert: await fs.readFile(path.join(__dirname, 'ssl', 'cert.pem'))
};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());  //endert zu json vormat
app.use(express.urlencoded({ extended: false })); //macht name in form sichbar
app.use('/models/file/', express.static(path.join(__dirname, 'sites','models','file'))); // gibt die modelle frei
app.use('/picture/', express.static(path.join(__dirname, 'sites','picture'))); 

// Session Middleware hinzufügen
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 50 * 60 * 60 * 1000 // 50 Stunden Gültigkeit
  }
}));

async function writeToFile(fileName, data) {    // Datei schreiben writeToFile(pfad, dateiinhalt);
  try {
    const jsonData = JSON.stringify(data, null, 2); 
    await writeFile(fileName, jsonData);
  } catch (error) {
    console.error(`Got an error trying to write the file: ${error.message}`);
  }
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'sites', 'models', 'file'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });


async function initId() { // sorgt das id immer so groß ist wie die anzal der modelle
  try {
    const fileData = await fs.readFile(modellspath, 'utf-8');
    const models = JSON.parse(fileData);
    id = models.length > 0 ? Math.max(...models.map(m => m.id)) + 1 : 1;
  } catch (error) {
    console.error('Fehler beim Initialisieren der ID:', error);
    id = 1;
  }
}


app.get('/', async (req, res) => {
  try {
    const jsonData = await fs.readFile(modellspath, 'utf-8');
    const models = JSON.parse(jsonData);


    res.render(path.resolve("sites/index.ejs"), { models, userFound: req.session.user || null});
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Laden der Modelle");
  }
});

app.get('/modelldet', async (req, res) => {
  try {
    const jsonData = await fs.readFile(modellspath, 'utf-8');
    const models = JSON.parse(jsonData);
    const id = parseInt(req.query.id); 
    const model = models.find(m => m.id === id); 


    res.render(path.resolve("sites/modelldet.ejs"), { model, id, userFound: req.session.user || null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Laden der Modelle");
  }
});

app.get('/crateaccount',  (req, res) => {
  res.render(path.resolve("sites/crateaccount.ejs"),{userFound: req.session.user || null});
});

app.post('/createlogin', async (req, res) => {
  try {
    const jsonData = await fs.readFile(userpath, 'utf-8');
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const users = JSON.parse(jsonData);

    // Überprüfen, ob die E-Mail oder der Benutzername bereits existieren
    const existingUser = users.find(user => user.email === email || user.user === username);
    if (existingUser) {
      // Wenn der Benutzer existiert, sende eine Fehlermeldung
      return res.render(path.resolve("sites/crateaccount.ejs"), { 
        userFound: null,
        errorMessage: "E-Mail oder Benutzername bereits vergeben.",
        email,
        username 
      });
    }

    // Wenn der Benutzer nicht existiert, neuen Benutzer hinzufügen
    users.push({ email, user: username, password });
    await writeToFile(userpath, users);

    // Erfolgreiche Account-Erstellung
    res.render(path.resolve("sites/login.ejs"), { userFound: null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Erstellen des Accounts");
  }
});


app.get('/like', async (req, res) => {
  const auswahl = req.query.like;
  const id = parseInt(req.query.id);

  // Sicherstellen, dass der Benutzer eingeloggt ist
  if (!req.session.user) {
    return res.status(403).send("Du musst eingeloggt sein, um zu liken.");
  }

  const jsonData = await fs.readFile(modellspath, 'utf-8');
  const models = JSON.parse(jsonData);

  const model = models.find(m => m.id === id);
  if (!model) {
    return res.status(404).send("Modell nicht gefunden");
  }

  // Überprüfen, ob der Benutzer das Modell bereits geliked hat
  if (!model.likes) {
    model.likes = {}; // Initialisiere das Likes-Objekt, falls nicht vorhanden
  }

  if (auswahl === "on") {
    if (!model.likes[req.session.user.email]) { // Überprüfen, ob der Benutzer es noch nicht gelikt hat
      model.likes[req.session.user.email] = true;
      model.like += 1; // Erhöhe den Like-Zähler
      await writeToFile(modellspath, models);
    }
  } else if (auswahl === "off") {
    if (model.likes[req.session.user.email]) { // Überprüfen, ob der Benutzer es entliken kann
      delete model.likes[req.session.user.email];
      model.like -= 1; // Verringere den Like-Zähler
      await writeToFile(modellspath, models);
    }
  }

  res.render(path.resolve("sites/modelldet.ejs"), { model, id, userFound: req.session.user || null });
});

app.get('/download', async (req, res) => {
  const id = parseInt(req.query.id);
  const file = req.query.file;

  const jsonData = await fs.readFile(modellspath, 'utf-8');
  const models = JSON.parse(jsonData);

  const model = models.find(m => m.id === id);
  if (!model) {
    return res.status(404).send("Modell nicht gefunden");
  }

  // prüfen ob Datei auch zu dem Modell gehört
  if (!model.dataFiles.includes(file)) {
    return res.status(404).send("Datei nicht gefunden");
  }

  if (!model.download) model.download = 0;
  model.download += 1;

  await writeToFile(modellspath, models); // Download-Zähler speichern

  res.download(path.resolve("sites/models/file/" + file));
});


app.post('/index', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let models = [];
  try {
    const jsonData = await fs.readFile(modellspath, 'utf-8');
    models = JSON.parse(jsonData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Laden der Modelle");
    return;
  }
  try {
    const userData = await fs.readFile(userpath, 'utf-8');
    const users = JSON.parse(userData);
    const userFound = users.find(u => u.email === email && u.password === password);

    if (userFound) {
      // Speichern des Benutzers in der Session
      req.session.user = {
        email: userFound.email,
        username: userFound.user,
        password: userFound.password
      };

      res.render(path.resolve("sites/index.ejs"), { models, userFound: req.session.user });
    } else {
      res.render(path.resolve("sites/login.ejs"));
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Überprüfen der Benutzer");
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Fehler beim Logout");
    }
    res.redirect('/');
  });
});



app.post('/create', upload.fields([
  { name: 'picture', maxCount: 10 },
  { name: 'file', maxCount: 10 }
]), async (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const userb = req.body.user;  // Benutzername
  const download = 0;
  const like = 0;

  // Hier sicherstellen, dass userb als String gespeichert wird
  const userbString = Array.isArray(userb) ? userb[0] : userb;

  const pictureFiles = req.files.picture ? req.files.picture.map(file => file.filename) : [];
  const dataFiles = req.files.file ? req.files.file.map(file => file.filename) : [];
  
  try {
    const fileData = await readFile(modellspath, 'utf-8');
    let models = [];

    try {
      models = JSON.parse(fileData);
    } catch {
      console.warn("Leere oder fehlerhafte JSON – neue Liste.");
    }

    id = id + 1;

    models.push({ id, name, description, pictureFiles, dataFiles, userb: userbString, like, download });
    await writeToFile(modellspath, models);

    res.render(path.resolve("sites/index.ejs"), { models, userFound: req.session.user || null });
  } catch (error) {
    console.error(error);
    res.status(500).send("Fehler beim Speichern.");
  }
});



  app.get('/profile', async (req, res) => {
    try {
      const username = req.query.username;
      const userData = await fs.readFile(userpath, 'utf-8');
      const users = JSON.parse(userData);
  
      const user = users.find(u => u.user === username);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      // Lade die Modelle des Benutzers
      const jsonData = await fs.readFile(modellspath, 'utf-8');
      const models = JSON.parse(jsonData);
      const userModels = models.filter(model => model.userb === username);
  
      // Render Profilseite mit den Benutzerinformationen und den Modellen
      res.render(path.resolve("sites/profile.ejs"), {
        user,
        userModels,
        modelCount: userModels.length,
        userFound: req.session.user || null
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Fehler beim Laden des Profils");
    }
  });

  
  app.get('/login', (req, res) => {
    res.render(path.resolve("sites/login.ejs"),{userFound: null});
  });

  app.get('/crateaccount',  (req, res) => {
    res.render(path.resolve("sites/crateaccount.ejs"), { 
      userFound: req.session.user || null, 
      errorMessage: null, 
      email: '', 
      username: ''
    });
  });
  

  app.get('/modells', async (req, res) => {
    try {
      const sort = req.query.sort || 'newest';
      const search = (req.query.search || '').toLowerCase(); // Suchbegriff klein schreiben für Vergleich
      const jsonData = await fs.readFile(modellspath, 'utf-8');
      let models = JSON.parse(jsonData);
  
      // Wenn ein Suchbegriff vorhanden ist, filtern
      if (search) {
        models = models.filter(m => 
          m.name.toLowerCase().includes(search) || 
          (m.description && m.description.toLowerCase().includes(search))
        );
      }
  
      // Sortieren
      let sortedModels = [...models];
      if (sort === 'oldest') {
        // nichts tun
      } else if (sort === 'likes') {
        sortedModels.sort((a, b) => (b.like || 0) - (a.like || 0));
      } else {
        // newest
        sortedModels.reverse();
      }
  
      res.render(path.resolve("sites/modells.ejs"), { 
        models: sortedModels,
        search, 
        userFound: req.session.user || null,
        nothingFound: sortedModels.length === 0 
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Fehler beim Laden der Modelle");
    }
  });



app.get('/comunity', (req, res) => {
    res.render(path.resolve("sites/comunity.ejs"),{userFound: req.session.user || null});
  })
 

 app.get('/cratemodell', (req, res) => {
    res.render(path.resolve("sites/cratemodell.ejs"),{userFound: req.session.user || null});
    
  
  })

  app.get('/js/index.js', (req, res) => {
    res.sendFile(path.resolve("sites/js/index.js"));
  })

  app.get('/js/main.js', (req, res) => {
    res.sendFile(path.resolve("sites/js/main.js"));
  });

  app.get('/js/model-viewer.js', (req, res) => {
    res.sendFile(path.resolve("sites/js/model-viewer.js"));
  })


app.get('/js/languare.js', (req, res) => {
  res.sendFile(path.resolve("sites/js/languare.js"));
})

app.get('/main.css', (req, res) => {
    res.sendFile(path.resolve("sites/main.css"));
  })

  app.get('/header.css', (req, res) => {
    res.sendFile(path.resolve("sites/header.css"));
  })





  initId().then(() => {
    https.createServer(httpsOptions, app).listen(port, () => {
      console.log(`HTTPS-Server läuft auf Port ${port}`);
    });
  });
