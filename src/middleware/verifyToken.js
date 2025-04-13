export const verifyToken = (req, reply) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
        return reply.status(401).send({ message: 'Token expired' });
    }   
    if (!decoded) {
        return reply.status(401).send({ message: 'Unauthorized' });
    }
    return true;

}
