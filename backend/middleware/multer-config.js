const multer = require('multer');
const path = require('path');

// Types de fichiers acceptés
const MIME_TYPES = {
    'image/jpeg':'jpg',
    'image/jpg':'jpg',
    'image/png':'png'
};

// Configuration de multer
const storage = multer.diskStorage({
    // dossier de destination
    destination: (req, file, callback) =>{
        callback(null, 'images');
    },
    // constitution du nom de fichier
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');