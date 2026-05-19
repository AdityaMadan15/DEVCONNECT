import jwt from 'jsonwebtoken';

const generateToken = (userId, extraClaims = {}) => {
  return jwt.sign(
    { id: userId, ...extraClaims },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export default generateToken;
