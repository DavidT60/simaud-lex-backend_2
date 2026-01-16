import { Injectable, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import CourierClient from "@trycourier/courier";
import { UserService } from "../user/user.service";
import { hashPassword, comparePassword } from "../common/until/bycryp.pss";
import { CustomError } from "../common/exceptions/custom-exceptions.filter";
import { VerificationCode } from "./verification-code.entity";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
    @InjectRepository(VerificationCode)
    private verificationRepo: Repository<VerificationCode>
  ) {}

  async sendVerificationCode(email: string) {
    // Check if user already exists
    const user = await this.userService.findOneEmail(email);
    if (user) {
      throw new CustomError(
        "El correo ya está registrado",
        "EMAIL_EXISTS",
        HttpStatus.CONFLICT
      );
    }

    // Generate code
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 min expiry

    // Save code
    await this.verificationRepo.save({
      email,
      code,
      expiresAt,
    });

    // Send email
    await this.sendEmail(email, code);

    return { message: "Código enviado correctamente" };
  }

  async singin(credentials: {
    email: string;
    password: string;
    name: string;
    code: string;
  }) {
    // Validate Code
    const validCode = await this.verificationRepo.findOne({
      where: {
        email: credentials.email,
        code: credentials.code,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!validCode) {
      throw new CustomError(
        "Código inválido o expirado",
        "INVALID_CODE",
        HttpStatus.BAD_REQUEST
      );
    }

    // Hash password
    let _credentials: any = { ...credentials };
    delete _credentials.code;
    _credentials["password"] = await hashPassword(_credentials["password"]);

    // Create User
    const create = await this.userService.singin(_credentials);

    // Clean up used codes
    await this.verificationRepo.delete({ email: credentials.email });

    return {
      access_token: this.jwt.sign({
        sub: create.id,
        email: create.email,
        role: create.role,
      }),
      user: create,
    };
  }

  private async sendEmail(email: string, code: string) {
    const courier = new CourierClient({ apiKey: process.env.COURIER_AUTH_TOKEN });

    try {
      const { requestId } = await courier.send.message({
        message: {
          to: {
            email: email,
          },
          content: {
            version: "2020-01-01",
            elements: [
              {
                type: "text",
                content: `
                  <h1>Verification Code</h1>
                  <p>Your verification code is: <strong>${code}</strong></p>
                  <p>This code expires in 15 minutes.</p>
                  <p>That message is a critical security warning:Never share verification code.</p>
                `,
                format: "html"
              } as any
            ]
          },
          routing: {
            method: "all",
            channels: ["email"],
          },
        },
      });
      console.log('Email sent via Courier. RequestId:', requestId);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new CustomError("Error sending email", "EMAIL_SEND_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(credentials: { email: string; password: string }) {
    const user = await this.userService.findOneEmail(credentials.email);
    if (!user) {
      throw new CustomError(
        "Password is incorrect",
        "PASSWORD_MISMATCH",
        HttpStatus.UNAUTHORIZED
      );
    }

    let _comparing = await comparePassword(credentials.password, user.password);

    if (!_comparing) {
      throw new CustomError(
        "Password is incorrect",
        "PASSWORD_MISMATCH",
        HttpStatus.UNAUTHORIZED
      );
    }

    return {
      access_token: this.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  }

  async sendPasswordResetCode(email: string) {
    const user = await this.userService.findOneEmail(email);
    if (!user) {
      throw new CustomError(
        "Correo no registrado",
        "USER_NOT_FOUND",
        HttpStatus.NOT_FOUND
      );
    }

    // Generate code
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Save code
    await this.verificationRepo.save({
      email,
      code,
      expiresAt,
    });

    // Send email
    await this.sendEmail(email, code);

    return { message: "Código de recuperación enviado" };
  }

  async resetPassword(data: {
    email: string;
    code: string;
    newPassword: string;
  }) {
    // Validate Code
    const validCode = await this.verificationRepo.findOne({
      where: {
        email: data.email,
        code: data.code,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!validCode) {
      throw new CustomError(
        "Código inválido o expirado",
        "INVALID_CODE",
        HttpStatus.BAD_REQUEST
      );
    }

    // Update Password
    const user = await this.userService.findOneEmail(data.email);
    if (!user) {
      throw new CustomError(
        "User not found",
        "USER_NOT_FOUND",
        HttpStatus.NOT_FOUND
      );
    }

    const hashedPassword = await hashPassword(data.newPassword);
    // We need to access the repo directly or add a method in UserService to update password by email/id without old password check
    // Ideally reuse userService.updatePassword but that requires old password.
    // Let's assume we can save the user with new password using repo if available or use userService.
    // Since userService.updatePassword checks current password, we can't use it.
    // We will access userService repo if public or add a method.
    // Checking UserService... it has repo private.
    // I'll add a method `resetUserPassword` to UserService.
    await this.userService.resetUserPassword(user.id, hashedPassword);

    // Clean up code
    await this.verificationRepo.delete({ email: data.email });

    return { message: "Contraseña actualizada correctamente" };
  }
}
