const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de la connexion à la base de données MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // Assurez-vous que le mot de passe est correct
    database: 'weather_db'
});

// Connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL.');
});

// Route pour recevoir les données des capteurs
app.post('/api/weather', (req, res) => {
    const { temperature_ambiante, humidite_ambiante, humidite_sol, temperature_sol_0_5m, temperature_sol_1m, luminosite } = req.body;

    if (!temperature_ambiante || !humidite_ambiante || !humidite_sol || !temperature_sol_0_5m || !temperature_sol_1m || !luminosite) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const query = 'INSERT INTO weather_data (temperature_ambiante, humidite_ambiante, humidite_sol, temperature_sol_0_5m, temperature_sol_1m, luminosite) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [temperature_ambiante, humidite_ambiante, humidite_sol, temperature_sol_0_5m, temperature_sol_1m, luminosite];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'insertion des données :', err);
            return res.status(500).json({ error: 'Erreur lors de l\'insertion des données.' });
        }
        res.status(200).json({ message: 'Données reçues et stockées avec succès.' });
    });
});

// Route pour récupérer les données des capteurs
app.get('/api/weather', (req, res) => {
    const query = 'SELECT * FROM weather_data ORDER BY id DESC'; // Assurez-vous que `id` est la clé primaire dans votre table

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des données :', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
        }
        res.status(200).json(results);
    });
});

// Servir les fichiers statiques depuis le répertoire 'public'
app.use(express.static('public'));

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
});
