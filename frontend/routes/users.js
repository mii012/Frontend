var express = require('express');   // Importiert das Express-Framework
var router = express.Router();      // Erstellt eine neue Router-Instanz
const axios = require('axios');     // Importiert das Axios-Modul für HTTP-Anfragen

// Asynchrone Funktion zum Speichern einer Datei
async function saveFile(file) {
  // Die Datei in den Ordner 'public/uploads' verschieben
  await file.mv('public/uploads/' + file.name);

  // Den vollständigen Pfad der Datei abrufen
  let filename = process.cwd() + '/public/uploads/' + file.name;

  // Den Dateipfad zurückgeben
  return filename;
}

// Route für die Abfrage aller Benutzer
router.get('/', function(req, res, next) {
  // GET-Anfrage an den Backend-Server, um alle Benutzer abzurufen
  axios.get('http://localhost:3000/users')
    .then(response => {
      console.log(response.data); // Daten aus dem Backend-Server protokollieren

      // Die 'users'-Seite rendern und die abgerufenen Benutzerdaten übergeben
      res.render('users', { 
        title: 'User', 
        pageName: 'Benutzer', 
        posts: response.data 
      });
    })
    .catch(error => {
      // Fehlerbehandlung, falls die Anfrage fehlschlägt
      console.error('Error fetching users:', error);
      res.status(500).send('Fehler beim Abrufen der Benutzer.');
    });
});

// Route für die Abfrage eines einzelnen Benutzers anhand seiner ID
router.get('/id/:usernameId', async (req, res) => {
  // Die Benutzer-ID aus den Routenparametern extrahieren
  const usernameId = req.params.usernameId;
  
  try {
    // Asynchrone GET-Anfrage an den Backend-Server
    const response = await axios.get(`http://localhost:3000/users/${usernameId}`);
    
    // Benutzer-Daten als JSON-Antwort senden
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      // Fehlerbehandlung, falls der Server eine Antwort mit einem Fehlerstatus zurückgibt
      console.error('Error response data:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      // Allgemeine Fehlerbehandlung, falls kein spezifischer Serverfehler vorliegt
      console.error('Error fetching article by username:', error);
      res.status(500).send('Fehler beim Abrufen des Benutzers.');
    }
  }
});

// Route für die Abfrage eines Benutzers anhand des Benutzernamens
router.get('/byName', async (req, res) => {
  // Den Benutzernamen aus den Query-Parametern extrahieren
  const username = req.query.username;

  try {
    // Asynchrone GET-Anfrage mit Query-Parametern
    const response = await axios.get(`http://localhost:3000/users/byName`, {
      params: {
        username: username
      }
    });

    console.log('Fetched data:', response.data); // Protokolliert die abgerufenen Daten
    res.json(response.data); // Die abgerufenen Benutzerdaten als JSON-Antwort senden
  } catch (error) {
    if (error.response) {
      // Fehlerbehandlung, falls der Server eine Antwort mit einem Fehlerstatus zurückgibt
      console.error('Error response data:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      // Allgemeine Fehlerbehandlung, falls kein spezifischer Serverfehler vorliegt
      console.error('Error fetching article by username:', error);
      res.status(500).send('Fehler beim Abrufen des Benutzers.');
    }
  }
});

// Route für das Erstellen eines neuen Benutzers
router.post('/post', async (req, res) => {
  // Extrahieren der notwendigen Daten aus dem Request-Body
  const { id, username, email, passwort, rolle, created } = req.body;

  console.log('Received data:', req.body); // Protokollieren der empfangenen Daten

  try {
    // POST-Anfrage zum Erstellen eines neuen Benutzers im Backend
    const response = await axios.post('http://localhost:3000/users', {
      id,               // Benutzer-ID
      username: username, // Benutzername
      email: email,     // E-Mail-Adresse
      password: passwort, // Passwort
      role: rolle,      // Rolle des Benutzers
      created           // Erstellungsdatum
    });

    console.log('Backend response:', response.data); // Protokollieren der Antwort des Backends
    
    // Erfolgreiche Antwort des Backends an den Client weitergeben
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating new equipment:', error); // Protokolliert den Fehler beim Erstellen

    if (error.response) {
      // Fehlerbehandlung, falls der Server eine Antwort mit einem Fehlerstatus zurückgibt
      console.error('Error response data:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      // Allgemeine Fehlerbehandlung, falls kein spezifischer Serverfehler vorliegt
      console.error('Error response:', error);
      res.status(500).json({ data: 'Fehler beim Erstellen des neuen Benutzers.' });
    }
  }
});

// Route für das Aktualisieren eines bestehenden Benutzers
router.put('/update', async (req, res) => {
  // Extrahieren der notwendigen Daten aus dem Request-Body
  const { id, username, email, passwort, rolle } = req.body;

  console.log({ id, username, email, passwort, rolle }); // Protokollieren der aktualisierten Daten

  try {
    // PUT-Anfrage zum Aktualisieren des Benutzers im Backend
    const response = await axios.put(`http://localhost:3000/users/${id}`, {
      username,          // Benutzername
      email,             // E-Mail-Adresse
      password: passwort, // Passwort
      role: rolle        // Rolle des Benutzers
    });

    // Erfolgreiche Antwort des Backends an den Client weitergeben
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error updating user:', error); // Protokolliert den Fehler beim Aktualisieren

    if (error.response) {
      // Fehlerbehandlung, falls der Server eine Antwort mit einem Fehlerstatus zurückgibt
      res.status(error.response.status).json(error.response.data);
    } else {
      // Allgemeine Fehlerbehandlung, falls kein spezifischer Serverfehler vorliegt
      res.status(500).json({ data: 'Fehler beim Aktualisieren des Benutzers.' });
    }
  }
});

// Route für das Löschen eines Benutzers anhand seiner ID
router.get('/delete/:id', (req, res) => {
  // DELETE-Anfrage zum Löschen des Benutzers im Backend
  axios.delete(`http://localhost:3000/users/${req.params.id}`)
    .then(response => {
      // Weiterleitung zur Benutzerübersicht nach erfolgreichem Löschen
      res.redirect('/users');
    })
    .catch(error => {
      // Fehlerbehandlung, falls das Löschen fehlschlägt
      console.error('Error deleting user:', error);
      res.status(500).send('Fehler beim Löschen des Benutzers.');
    });
});

module.exports = router; // Exportiert den Router zur Verwendung in der Hauptanwendung
