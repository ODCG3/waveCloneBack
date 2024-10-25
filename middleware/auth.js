import jwt from 'jsonwebtoken';


export default (req, res, next) => {
    // const token = req.cookies.token ? req.cookies.token : null;
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    //console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        console.error('Token verification failed', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};