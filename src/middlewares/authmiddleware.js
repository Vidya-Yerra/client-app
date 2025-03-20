import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log('Incoming Auth Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided or invalid format');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted Token:', token);

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing in environment variables!');
    return res.status(500).json({ message: 'Internal Server Error' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token (Verified):', decoded);

    // Attach userId to request for further processing
    req.userId = decoded.userId;

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    res.status(401).json({ message: 'Authentication failed.' });
  }
};
