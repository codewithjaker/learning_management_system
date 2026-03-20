// jwt.ts
// @ts-nocheck
import jwt from 'jsonwebtoken';

export const generateToken = (userId: number) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
