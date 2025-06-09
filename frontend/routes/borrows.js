var express = require('express');   // Importiert das Express-Framework
var router = express.Router();      // Erstellt eine neue Router-Instanz
const axios = require('axios');     // Importiert das Axios-Modul für HTTP-Anfragen

// Funktion zum Speichern einer Datei auf dem Server
async function saveFile(file) {
  // Verschiebt die Datei in den Ordner 'public/uploads'
  await file.mv('public/uploads/' + file.name);

  // Ermittelt den vollständigen Pfad der Datei auf dem Server
  let filename = process.cwd() + '/public/uploads/' + file.name;

  // Gibt den Dateipfad zurück
  return filename;
}

// Überprüft, ob ein Equipment mit der gegebenen ID existiert
async function equipmentExists(id) {
  // Sendet eine GET-Anfrage an den Backend-Server, um das Equipment abzurufen
  const res = await axios.get(`http://localhost:3000/equipment/${id}`).catch(() => {
    return false; // Gibt 'false' zurück, falls ein Fehler auftritt (z.B. keine Verbindung)
  });

  // Gibt 'true' zurück, wenn der Status der Antwort 200 ist, sonst 'false'
  return res?.status === 200;
}

// Überprüft, ob alle angegebenen Equipment-IDs existieren
async function allEquipmentExists(ids) {
  return Promise.all(
    ids.every(async (id) => {
      // Überprüft, ob jedes einzelne Equipment existiert
      return equipmentExists(id);
    })
  ).catch(() => {
    // Gibt 'false' zurück, falls ein Fehler bei einer der Überprüfungen auftritt
    return false;
  });
}

// --- Routen ---

// Route zum Abrufen aller Ausleihvorgänge
router.get('/', function (req, res, next) {
  // Sendet eine GET-Anfrage an den Backend-Server, um alle Ausleihvorgänge abzurufen
  axios.get('http://localhost:3000/borrows').then((response) => {
    console.log(response.data); // Gibt die empfangenen Daten in der Konsole aus

    // Rendert die 'borrows'-Seite mit den abgerufenen Daten
    res.render('borrows', {
      title: 'Borrow',          // Titel der Seite
      pageName: 'Ausleihvorgänge', // Name der Seite
      posts: response.data      // Die Daten, die an die Seite übergeben werden
    });
  }).catch(error => {
    // Fehlerbehandlung, falls die Anfrage fehlschlägt
    console.error('Error fetching borrows:', error);
    res.status(500).send('Fehler beim Abrufen der Ausleihvorgänge.');
  });
});

// Route zum Abrufen eines einzelnen Ausleihvorgangs anhand seiner ID
router.get('/id/:borrowId', async (req, res) => {
  const borrowId = req.params.borrowId; // Extrahiert die Ausleih-ID aus den URL-Parametern

  try {
    // Sendet eine GET-Anfrage an den Backend-Server, um den Ausleihvorgang abzurufen
    const response = await axios.get(`http://localhost:3000/borrows/${borrowId}`);
    
    // Sendet die abgerufenen Daten als JSON-Antwort
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching borrow by ID:', error); // Protokolliert den Fehler

    // Sendet eine Fehlerantwort an den Client
    res.status(500).send('Fehler beim Abrufen des Ausleihvorgangs.');
  }
});

// Route zum Erstellen eines neuen Ausleihvorgangs
router.post('/post', async (req, res) => {
  // Extrahiert die Daten aus dem Request-Body
  const { id, userid, equipmentids, start, end } = req.body;

  console.log('Received data:', req.body); // Protokolliert die empfangenen Daten

  try {
    // Sendet eine POST-Anfrage an den Backend-Server, um einen neuen Ausleihvorgang zu erstellen
    const response = await axios.post('http://localhost:3000/borrows', {
      id,           // Ausleih-ID
      userid,       // Benutzer-ID
      equipmentids, // Liste der Equipment-IDs
      start,        // Startdatum
      end           // Enddatum
    });

    console.log('Backend response:', response.data); // Protokolliert die Antwort des Backends

    // Sendet die Antwort des Backends an den Client weiter
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating new borrow:', error); // Protokolliert den Fehler

    // Überprüft, ob der Fehler eine Antwort des Servers enthält
    if (error.response) {
      console.error('Error response data:', error.response.data); // Protokolliert die Fehlerdaten
      res.status(error.response.status).json(error.response.data); // Sendet die Fehlerdaten weiter
    } else {
      // Allgemeine Fehlerbehandlung, falls kein spezifischer Serverfehler vorliegt
      console.error('Error response:', error);
      res.status(500).json({ data: 'Fehler beim Erstellen des neuen Ausleihvorgangs.' });
    }
  }
});

// Route zum Aktualisieren eines bestehenden Ausleihvorgangs
router.put('/update', async (req, res) => {
  // Extrahiert die Daten aus dem Request-Body
  const { id, userid, equipmentids, start, end } = req.body;

  try {
    // Sendet eine PUT-Anfrage an den Backend-Server, um den Ausleihvorgang zu aktualisieren
    const response = await axios.put(`http://localhost:3000/borrows/${id}`, {
      userid,       // Benutzer-ID
      equipmentids, // Liste der Equipment-IDs
      start,        // Startdatum
      end           // Enddatum
    });

    // Sendet die Antwort des Backends an den Client weiter
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error updating borrow:', error); // Protokolliert den Fehler

    // Überprüft, ob der Fehler eine Antwort des Servers enthält
    if (error.response) {
      res.status(error.response.status).json(error.response.data); // Sendet die Fehlerdaten weiter
    } else {
      // Allgemeine Fehlerbehandlung, falls kein spezifischer Serverfehler vorliegt
      res.status(500).json({ data: 'Fehler beim Aktualisieren des Ausleihvorgangs.' });
    }
  }
});

// Route zum Löschen eines Ausleihvorgangs anhand seiner ID
router.get('/delete/:id', (req, res) => {
  // Sendet eine DELETE-Anfrage an den Backend-Server, um den Ausleihvorgang zu löschen
  axios.delete(`http://localhost:3000/borrows/${req.params.id}`).then((response) => {
    // Nach erfolgreichem Löschen zur Übersicht der Ausleihvorgänge weiterleiten
    res.redirect('/borrows');
  }).catch(error => {
    // Fehlerbehandlung, falls das Löschen fehlschlägt
    console.error('Error deleting borrow:', error);
    res.status(500).send('Fehler beim Löschen des Ausleihvorgangs.');
  });
});

module.exports = router; // Exportiert den Router zur Verwendung in der Hauptanwendung
