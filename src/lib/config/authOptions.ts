import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
// import { verifyTokenService } from "@/components/common/auth/service/2fa";
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        captcha: { label: 'Captcha', type: 'text' },
        twoFaCode: { label: 'Two Factor Code', type: 'text' },
      },
      async authorize (credentials, req) {
        if (!credentials) { return null; }
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        if (!secretKey) {
          throw new Error('Server configuration error');
        }

        // const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${credentials.captcha}`;

        // try {
        //   const captchaResponse = await fetch(verificationUrl, {
        //     method: "POST",
        //   });

        //   if (!captchaResponse.ok) {
        //     throw new Error(
        //       `reCAPTCHA verification failed with status: ${captchaResponse.status}`
        //     );
        //   }

        //   const captchaData = await captchaResponse.json();
        //   if (!captchaData.success || captchaData.score < 0.5) {
        //     throw new Error("reCAPTCHA verification failed");
        //   }
        // } catch (error) {
        //   console.error("reCAPTCHA verification error:", error);
        //   throw new Error(
        //     "Failed to verify reCAPTCHA. Please try again later."
        //   );
        // }

        if (!credentials?.email || !credentials.password) {
          throw new Error('Missing email or password');
        }

        // Extract device and IP from the request
        const device = req.headers?.['user-agent'] ?? 'unknown';
        const ipAddress
          = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ?? 'unknown';

        // Check Staff First
        const staff = await prisma.staff.findUnique({
          where: { email: credentials.email },
        });

        if (staff?.password) {
          if (!staff.isActive) { throw new Error('Staff account inactive'); }
          if (staff.twoFactorEnabled && !credentials.twoFaCode) {
            throw new Error('Two-factor authentication required');
          }
          // if (staff.twoFactorEnabled && credentials.twoFaCode) {
          //   if (staff.twoFactorSecret) {
          //     const result = await verifyTokenService(
          //       staff.twoFactorSecret,
          //       credentials.twoFaCode
          //     );
          //     if (!result.success) {
          //       throw new Error("Invalid two-factor code");
          //     }
          //   }
          // }
          if (await bcrypt.compare(credentials.password, staff.password)) {
            return {
              id: staff.id,
              name: `${staff.firstName} ${staff.lastName}`,
              email: staff.email,
              role: staff.role,
              profileImage: staff.profileImage ?? '',
              userType: 'staff',
              device,
              ipAddress,
            };
          }
        }

        // If not staff, check Customer
        const customer = await prisma.customer.findUnique({
          where: { email: credentials.email },
        });

        if (customer) {
          if (!customer.isActive) { throw new Error('Customer account inactive'); }
          if (bcrypt.compareSync(credentials.password, customer.password)) {
            return {
              id: customer.id,
              name: `${customer.firstName} ${customer.lastName}`,
              email: customer.email,
              role: 'customer',
              profileImage: '',
              userType: 'customer',
              device,
              ipAddress,
            };
          }
        }

        throw new Error('Invalid credentials');
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt ({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.profileImage
          = user.userType === 'staff' ? user.profileImage ?? '' : '';
        token.userType = user.userType;
        token.exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 1 hour expiration

        await prisma.session.create({
          data: {
            staffId: user.userType === 'staff' ? user.id : null,
            customerId: user.userType === 'customer' ? user.id : null,
            device: user.device,
            ipAddress: user.ipAddress,
            loginTime: new Date(),
            isActive: true,
          },
        });
      }

      return token;
    },
    async session ({ session, token }) {
      const user = await (token.userType === 'staff'
        ? prisma.staff.findUnique({ where: { id: token.id } })
        : prisma.customer.findUnique({ where: { id: token.id } }));

      if (!user?.isActive) {
        throw new Error('User no longer exists or is inactive');
      }

      session.user = {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: 'role' in user ? user.role : 'customer',
        profileImage:
          token.userType === 'staff' && 'profileImage' in user
            ? user.profileImage ?? ''
            : '',
        userType: token.userType,
        // device: token.device || "unknown",
        // ipAddress: token.ipAddress || "unknown",
      };

      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
