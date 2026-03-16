// import { db } from '../db';
// import { users } from '../db/schema/users';
// import { eq } from 'drizzle-orm';
// import { comparePassword, hashPassword } from '../utils/password';
// import { generateToken } from '../utils/jwt';
// import { BadRequestError, UnauthorizedError } from '../utils/errors';
// import type { RegisterInput, LoginInput } from '../validations/auth';

// export class AuthService {
//   async register(data: RegisterInput) {
//     const existingUser = await db.query.users.findFirst({
//       where: eq(users.email, data.email),
//     });
//     if (existingUser) {
//       throw new BadRequestError('Email already registered');
//     }

//     const hashedPassword = await hashPassword(data.password);
//     const [user] = await db
//       .insert(users)
//       .values({
//         ...data,
//         password: hashedPassword,
//       })
//       .returning();

//     const token = generateToken(user.id);
//     return { user, token };
//   }

//   async login(data: LoginInput) {
//     const user = await db.query.users.findFirst({
//       where: eq(users.email, data.email),
//     });
//     if (!user) {
//       throw new UnauthorizedError('Invalid email or password');
//     }

//     const isValid = await comparePassword(data.password, user.password);
//     if (!isValid) {
//       throw new UnauthorizedError('Invalid email or password');
//     }

//     const token = generateToken(user.id);
//     return { user, token };
//   }
// }

// export const authService = new AuthService();

import { db } from '../db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import type { RegisterInput, LoginInput } from '../validations/auth';

export class AuthService {
  async register(data: RegisterInput) {
    // Check if email exists using direct query
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new BadRequestError('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        password: hashedPassword,
      })
      .returning();

    const token = generateToken(user.id);
    return { user, token };
  }

  async login(data: LoginInput) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await comparePassword(data.password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken(user.id);
    return { user, token };
  }
}

export const authService = new AuthService();