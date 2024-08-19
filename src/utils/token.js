import jwt from "jsonwebtoken";

export const generateToken = ({ payload = {}, secretKey = process.env.SECRET_KEY, /*expiresIn = "1d"*/}) => {
  return jwt.sign(payload, secretKey,/* { expiresIn }*/);
};

export const verifyToken = ({ token, secretKey = process.env.SECRET_KEY }) => {
  try {
    return jwt.verify(token, secretKey); //payload
  } catch (error) {
    return { errorMessage: error.message };
  }
};
