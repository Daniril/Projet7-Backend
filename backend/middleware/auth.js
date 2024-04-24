const jwt = require('jsonwebtoken');
 
// Middleware d'authentification
module.exports = (req, res, next) => {
   try {
        // Récupération du token du front
       const token = req.headers.authorization.split(' ')[1];
        //    Decodage du token grace a jwt
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    //    Test que le userId du front et celui du token correspondent
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};