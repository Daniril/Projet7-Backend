const sharp = require('sharp');
const path = require('path');
const fs = require('fs');


const adaptImg = (req, res, next) => {
    // Si requête ne contient pas de fichier img
    if(!req.file){
        return next();
    }
        const fileName = req.file.filename;
        const fileResized = path.join('images', `resized_${fileName}'`);
        // Utilisation de Sharp pour redimensionner à 350px de largeur
        sharp(req.file.path)
            .resize({width : 350})
            .toFile(fileResized)
            // suppression de l'image initiale
            .then(() =>{
                fs.unlink(req.file.path, () => {
                    req.file.filename = `resized_${fileName}'`;
                    next();
                });
            })
            .catch(err => {
                console.log(err);
                return next();
            });
};

module.exports = adaptImg;