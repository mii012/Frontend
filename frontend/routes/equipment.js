var express = require('express');   // Importiert das Express-Framework
var router = express.Router();      // Erstellt eine neue Router-Instanz
const axios = require('axios');     // Importiert das Axios-Modul für HTTP-Anfragen

// Funktion zum Speichern einer Datei auf dem Server
async function saveFile(file) {
  // Verschiebt die Datei in den Ordner 'public/uploads'
  await file.mv('public/uploads/' + file.name);

  // Ermittelt den vollständigen Pfad der Datei
  let filename = process.cwd() + '/public/uploads/' + file.name;

  // Gibt den vollständigen Pfad der Datei zurück
  return filename;
}

// Route zum Abrufen aller Ausleihartikel
router.get('/', function(req, res, next) {
  // Sendet eine GET-Anfrage an den Backend-Server, um alle Ausleihartikel abzurufen
  axios.get('http://localhost:3000/equipment')
    .then(response => {
      console.log(response.data);  // Protokolliert die empfangenen Daten in der Konsole

      // Rendert die 'equipment'-Seite mit den abgerufenen Daten
      res.render('equipment', {
        title: 'Equipment',           // Titel der Seite
        pageName: 'Ausleihartikel',   // Name der Seite
        posts: response.data          // Die abgerufenen Artikel-Daten
      });
    })
    .catch(error => {
      // Fehlerbehandlung, falls die Anfrage fehlschlägt
      console.error('Fehler beim Abrufen der Ausleihartikel:', error);
      res.status(500).send('Fehler beim Abrufen der Ausleihartikel.');
    });
});

// Route zum Abrufen eines einzelnen Artikels anhand seiner ID
router.get('/id/:articleId', async (req, res) => {
  const articleId = req.params.articleId;  // Extrahiert die Artikel-ID aus den URL-Parametern

  try {
    // Sendet eine GET-Anfrage an den Backend-Server, um den Artikel abzurufen
    const response = await axios.get(`http://localhost:3000/equipment/${articleId}`);

    // Sendet die abgerufenen Daten als JSON-Antwort
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      // Protokolliert die Fehlerdaten, wenn der Server eine Antwort mit Fehlercode sendet
      console.error('Error response data:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      // Allgemeine Fehlerbehandlung, falls kein spezifischer Serverfehler vorliegt
      console.error('Error response:', error);
      res.status(500).json({ data: 'Fehler beim Finden des Artikels.' });
    }
  }
});

// Route zum Erstellen eines neuen Artikels
router.post('/post', async (req, res) => {
  // Extrahiert die Daten aus dem Request-Body
  const { id, articlenumber, title, description, count, userid } = req.body;

  // Validiert, dass die Anzahl des Artikels nicht negativ ist
  if (count < 0) {
    // Sendet eine 400-Bad-Request-Antwort, falls die Validierung fehlschlägt
    return res.status(400).json({ data: 'Fehler beim Erstellen des Artikels. Die Menge muss mindestens 0 sein.' });
  }

  console.log('Received data:', req.body);  // Protokolliert die empfangenen Daten

  try {
    // Sendet eine POST-Anfrage an den Backend-Server, um einen neuen Artikel zu erstellen
    const response = await axios.post('http://localhost:3000/equipment', {
      id,             // Artikel-ID
      articlenumber,  // Artikelnummer
      title,          // Titel des Artikels
      description,    // Beschreibung des Artikels
      count,          // Anzahl des Artikels
      userid          // Benutzer-ID, die den Artikel erstellt
    });

    console.log('Backend response:', response.data);  // Protokolliert die Antwort des Backends

    // Sendet die Antwort des Backends an den Client weiter
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating new equipment:', error);  // Protokolliert den Fehler

    // Überprüft, ob der Fehler eine Antwort des Servers enthält
    if (error.response) {
      console.error('Error response data:', error.response.data);  // Protokolliert die Fehlerdaten
      res.status(error.response.status).json(error.response.data);  // Sendet die Fehlerdaten weiter
    } else {
      // Allgemeine Fehlerbehandlung, falls kein spezifischer Serverfehler vorliegt
      console.error('Error response:', error);
      res.status(500).json({ data: 'Fehler beim Erstellen des neuen Artikels.' });
    }
  }
});

// Route zum Aktualisieren eines Artikels
router.put('/update', async (req, res) => {
  // Extrahiert die Daten aus dem Request-Body
  const { id, articlenumber, title, description, count, userid } = req.body;

  // Validiert, dass die Anzahl des Artikels nicht negativ ist
  if (count < 0) {
    // Sendet eine 400-Bad-Request-Antwort, falls die Validierung fehlschlägt
    return res.status(400).json({ data: 'Fehler bei der Aktualisierung des Artikels. Die Menge muss mindestens 0 sein.' });
  }

  try {
    // Sendet eine PUT-Anfrage an den Backend-Server, um den Artikel zu aktualisieren
    const response = await axios.put(`http://localhost:3000/equipment/${id}`, {
      id,             // Artikel-ID
      articlenumber,  // Artikelnummer
      title,          // Titel des Artikels
      description,    // Beschreibung des Artikels
      count,          // Anzahl des Artikels
      userid          // Benutzer-ID, die den Artikel aktualisiert
    });

    // Sendet die Antwort des Backends an den Client weiter
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error updating equipment:', error);  // Protokolliert den Fehler

    // Überprüft, ob der Fehler eine Antwort des Servers enthält
    if (error.response) {
      res.status(error.response.status).json(error.response.data);  // Sendet die Fehlerdaten weiter
    } else {
      // Allgemeine Fehlerbehandlung, falls kein spezifischer Serverfehler vorliegt
      res.status(500).json({ data: 'Fehler beim Aktualisieren des Artikels.' });
    }
  }
});

// Route zum Löschen eines Artikels anhand seiner ID
router.get('/delete/:id', (req, res) => {
  // Sendet eine DELETE-Anfrage an den Backend-Server, um den Artikel zu löschen
  axios.delete(`http://localhost:3000/equipment/${req.params.id}`).then((response) => {
    // Nach erfolgreichem Löschen zur Übersicht der Artikel weiterleiten
    res.redirect('/equipment');
  }).catch(error => {
    // Fehlerbehandlung, falls das Löschen fehlschlägt
    console.error('Error deleting borrow:', error);
    res.status(500).send('Fehler beim Löschen des Artikels.');
  });
});



module.exports = router; // Exportiert den Router zur Verwendung in der Hauptanwendung
