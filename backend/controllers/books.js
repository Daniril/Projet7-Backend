const Book = require('../models/book')
const fs = require('fs');


// Logique métier création d'objet 'livre'
exports.createThing = (req, res, next)=>{
    const bookObject = JSON.parse(req.body.book);
    // Suppression des id du front
    delete bookObject._id;
    delete bookObject._userId;
    // création du nouvel objet
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    // sauvegarde de l'objet
    book.save()
    .then(() => {res.status(201).json({message: 'Objet enregistré'})})
    .catch(error => res.status(400).json({ error }))
};

// Logique métier suppression d'objet 'livre'
exports.deleteThing = (req, res, next) => {
    // Recherche pas id
    Book.findOne({_id : req.params.id})
    .then(book => {
        // Si id du front different de l'id du createur de l'objet
        if(book.userId != req.auth.userId){
            res.status(401).json({message : 'Non-authorisé'})
        // Sinon authorisé à supprimer (suppression de l'objet ET de l'img associée)
        } else {
            const fileName = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${fileName}`, () =>{
                Book.deleteOne({ _id : req.params.id})
                .then(() => res.status(200).json({message : "objet supprimé"}))
                .catch(error => res.status(401).json({ error }));
            })
        }
    })
    .catch(error => res.status(500).json({ error }))
  };

  // Logique métier modifier l'objet 'livre'
exports.modifyThing = (req, res, next) => {
    // Si l'objet contient une img, reconstitution de l'url de l'image, sinon parse du corps de la requête 
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl :`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body};

    delete bookObject._userId;

    // Recherche de l'objet par id
    Book.findOne({_id: req.params.id})
    .then((book) => {
        // Si id du front different de l'id du createur de l'objet
        if(book.userId != req.auth.userId){
            res.status(401).json({message : 'Non-authorisé'});
        } else {
            // Sinon, suppression de l'img
            if(req.file){
                const fileName = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${fileName}`, (err) =>{
                    if (err) throw err;
                })
            }
            // Et update d l'objet
            Book.updateOne({_id: req.params.id}, { ...bookObject, _id: req.params.id})
            .then(() => res.status(200).json({message: 'Objet modifié'}))
            .catch(error => res.status(400).json({error}));
        }
    })
    .catch(error => res.status(400).json({error}))
};

// Logique métier consulter Un seul objet 'livre' recherche par ID
exports.getOneThing = (req, res, next) =>{
    Book.findOne({ _id: req.params.id})
    .then(Book => res.status(200).json(Book))
    .catch(error => res.status(400).json({error}))
};

// Logique métier consulter tous les objets 'livre' recherche de TOUS les objets
exports.getAllThings = (req, res, next) =>{
    Book.find()
    .then(Books => res.status(200).json(Books))
    .catch(error => res.status(400).json({error}))
};

// Logique métier note
exports.rateThing = (req, res, next) => {
    // Creation des objets
    const average = book.averageRating;
    const newRating = { 
        userId : req.auth.userId,
        grade : req.body.rating
                };
    const bookId = req.params.id;
    // Si la note n'est pas comprise entre 0 et 5
    if( newRating.grade > 5 || newRating.grade < 0 ){
        res.status( 400 ).json({ message:"La note doit être comprise entre 0 et 5" })
    } else {
            // Recherche du livre par ID
            Book.findOne({ _id: bookId })
            .then(( book ) => {
                // Si l'id du front a deja noté le livre retourne une erreur
                if( book.ratings.userId === req.auth.userId
                    // book.ratings.map((rating) => rating.userId === req.auth.userId)
                ){
                    return res
                    .status( 401 )
                    .json({ message : 'Non-authorisé' });
                } else {
                // Sinon ajout aux notes de l'objet, puis recalcul de la moyenne et sauvegarde des nouvelles données
                    book.ratings.push( newRating );
                    average = ( average*( book.ratings.length - 1 ) + newRating.grade ) / book.ratings.length;
                    return book.save();
                };
            })
            .catch(error => res
                .status( 400 )
                .json({ error }));
    };
};


// Logique best 3 ratings
// Tri à l'envers des moyennes des notes puis limit des 3 premières
exports.bestRatings = (req, res, next) => {
    Book.find().sort({averageRating: -1}).limit(3)
    .then(Books => res.status(200).json(Books))
    .catch(error => res.status(400).json({error}));
}