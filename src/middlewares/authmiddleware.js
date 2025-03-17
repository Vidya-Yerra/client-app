import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log('Incoming Auth Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided or invalid format');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted Token:', token);

  try {
    console.log('Incoming token:', token); // Debug
    console.log('JWT_SECRET used to verify:', process.env.JWT_SECRET); // Debug

    // 👇 Decode without verifying, to inspect payload + header
    const decodedUnverified = jwt.decode(token, { complete: true });
    console.log('Decoded Token (Unverified):', decodedUnverified);

    // 👇 Actual verification step
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token (Verified):', decoded);

    // Add user info to request for later use
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (err) {
    console.log('JWT Verification Error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};
