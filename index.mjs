import express from 'express'; //importiren exppress
import path from 'path'; // importiren von path (verzeichnes)
import { fileURLToPath } from 'url'; // Macht aus URL einen Dateipfad
import { createRequire } from 'module'; // Erlaubt require in ES-Modulen
import multer from 'multer';   // dateiploads
import fs from 'fs/promises';  // dateisystem
import https from 'https'; // httpps

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


    res.render(path.resolve("sites/index.ejs"), { models,userFound: null});
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


    res.render(path.resolve("sites/modelldet.ejs"), { model, id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Laden der Modelle");
  }
});

app.get('/crateaccount',  (req, res) => {
  res.render(path.resolve("sites/crateaccount.ejs"));
});

app.post('/createlogin', async (req, res) => {
  try {
    const jsonData = await fs.readFile(userpath, 'utf-8');
    const email = req.body.email;
    const user = req.body.username;
    const password = req.body.password;
    const users = JSON.parse(jsonData);
    users.push({ email, user, password });
    await writeToFile(userpath, users);
 


    res.render(path.resolve("sites/login.ejs"));
  } catch (err) {
    console.error(err);
    res.status(500).send("Felser beim estellen vom account");
  }
});

app.get('/like', async (req, res) => {
  const auswahl = req.query.like;
  const id = parseInt(req.query.id);

  const jsonData = await fs.readFile(modellspath, 'utf-8');
  const models = JSON.parse(jsonData);

  const model = models.find(m => m.id === id);
  if (!model) {
    return res.status(404).send("Modell nicht gefunden");
  }

  if (auswahl === "on") {
    // Falls noch kein Like-Zähler vorhanden ist, initialisieren
    if (!model.like) model.like = 0;
    model.like += 1;

    // Datei speichern
    await writeToFile(modellspath, models);
  }

  res.render(path.resolve("sites/modelldet.ejs"), { model, id });
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
        let userEmail = userFound.email;
        let userName = userFound.user;
        let userPassword = userFound.password;

          res.render(path.resolve("sites/index.ejs"), { models , userFound});
      } else {
          res.render(path.resolve("sites/login.ejs"));
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Fehler beim Überprüfen der Benutzer");
    }
});



  app.post('/create', upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'file', maxCount: 1 }
    
  ]), async (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
  
    const pictureFile = req.files.picture ? req.files.picture[0].filename : null;
    const dataFile = req.files.file ? req.files.file[0].filename : null;
    
    try {
      const fileData = await readFile(modellspath, 'utf-8');
      let models = [];
  
      try {
        models = JSON.parse(fileData);
      } catch {
        console.warn("Leere oder fehlerhafte JSON – neue Liste.");
      }
      id = id + 1;
  
      models.push({id , name, description, pictureFile, dataFile });
      await writeToFile(modellspath, models);
  
      res.render(path.resolve("sites/index.ejs"), { models });
    } catch (error) {
      console.error(error);
      res.status(500).send("Fehler beim Speichern.");
    }
  });


  app.get('/login', (req, res) => {
    res.render(path.resolve("sites/login.ejs"))
  })

  app.get('/crateaccount', (req, res) => {
    res.render(path.resolve("sites/crateaccount.ejs"))
  })
  

  app.get('/modells', async (req, res) => {
    try {
      const sort = req.query.sort || 'newest';
      const jsonData = await fs.readFile(modellspath, 'utf-8');
      const models = JSON.parse(jsonData);
  
      let sortedModels = [...models];
  
      if (sort === 'oldest') {
        // Nichts ändern
      } else if (sort === 'likes') {
        sortedModels.sort((a, b) => (b.like || 0) - (a.like || 0));
      } else {
        // newest
        sortedModels.reverse();
      }
  
      res.render(path.resolve("sites/modells.ejs"), { models: sortedModels });
    } catch (err) {
      console.error(err);
      res.status(500).send("Fehler beim Laden der Modelle");
    }
  });



app.get('/comunity', (req, res) => {
    res.render(path.resolve("sites/comunity.ejs"))
  })
 

 app.get('/cratemodell', (req, res) => {
    res.render(path.resolve("sites/cratemodell.ejs"))
  })

  app.get('/js/index.js', (req, res) => {
    res.sendFile(path.resolve("sites/js/index.js"))
  })

app.get('/js/languare.js', (req, res) => {
    res.sendFile(path.resolve("sites/js/languare.js"))
  })

app.get('/main.css', (req, res) => {
    res.sendFile(path.resolve("sites/main.css"))
  })

  app.get('/header.css', (req, res) => {
    res.sendFile(path.resolve("sites/header.css"))
  })


app.get('/picture/logo.png', (req, res) => {
    res.sendFile(path.resolve("sites/picture/logo.png"))
  })

app.get('/picture/accounnt.png', (req, res) => {
    res.sendFile(path.resolve("sites/picture/accounnt.png"))
  })



  initId().then(() => {
    https.createServer(httpsOptions, app).listen(port, () => {
      console.log(`HTTPS-Server läuft auf Port ${port}`);
    });
  });
