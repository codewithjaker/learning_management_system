// import { Router } from 'express';
// import { authController } from '../controllers/auth.controller';
// import { validate } from '../middlewares/validation.middleware';
// import { registerSchema, loginSchema } from '../validations/auth.validation';
// import { authenticate } from '../middlewares/auth.middleware';

// const router = Router();

// router.post('/register', validate(registerSchema), authController.register);
// router.post('/login', validate(loginSchema), authController.login);
// router.get('/me', authenticate, authController.getMe);



// export default router;

 import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import {
  registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema,
  verifyOtpSchema, resendOtpSchema, resetPasswordSchema, changePasswordSchema,
  verifyEmailSchema, resendVerificationSchema,
} from '../validations/auth.validation';

const router = Router();

// Public
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', validate(resendOtpSchema), authController.resendOtp);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), authController.resendVerification);

// Protected
router.use(authenticate);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.post('/change-password', validate(changePasswordSchema), authController.changePassword);
router.get('/sessions', authController.getUserSessions);
router.delete('/sessions/:id', authController.revokeSession);

export default router;