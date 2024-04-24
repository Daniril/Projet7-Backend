const User = require('../models/user');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');

// Creation nouvel utilisateur
exports.signup = (req, res, next) => {
    // hashage 10 fois du mdp
    bcrypt.hash(req.body.password , 10)
    // création de l'utilisateur et sauvegarde des informations
    .then(hash => {
        const user = new User ({
            email : req.body.email,
            password : hash
        })
        user.save()
        .then(() => res.status(201).json({message : 'Utilisateur crée avec succès !'}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};

// Connexion
exports.login = (req, res, next) => {
    // Recherche par email
    User.findOne({ email : req.body.email })
    .then(user => { 
        // Si user n'existe pas
        if (!user) {
            return res.status(401).json({ error: 'Paire identifiant/Mot de passe incorrecte' });
        }
        // Sinon comparaison grace au module bcrypt
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            // Si non ok
            if (!valid) {
                return res.status(401).json({ error: 'Paire identifiant/Mot de passe incorrecte' })
            }
            // Sinon generation d'un token de 24h
            res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    { userId: user._id },
                    'RANDOM_TOKEN_SECRET',
                    { expiresIn: '24h' }
                )
            });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}))
};