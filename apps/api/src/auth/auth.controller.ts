// ============================================================
// Auth Controller — Login, Register & Google OAuth Endpoints
// ============================================================

import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';
import { AuthService } from './auth.service';

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['FARMER', 'FPO', 'BUYER', 'ADMIN'])
  role?: 'FARMER' | 'FPO' | 'BUYER' | 'ADMIN';
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

class GoogleAuthDto {
  @IsOptional()
  @IsString()
  idToken?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  googleSubId?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsIn(['FARMER', 'FPO', 'BUYER', 'ADMIN'])
  role?: 'FARMER' | 'FPO' | 'BUYER' | 'ADMIN';
}

class RequestOtpDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn(['LOGIN', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'SENSITIVE_ACTION'])
  purpose?: 'LOGIN' | 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'SENSITIVE_ACTION';
}

class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;

  @IsOptional()
  @IsIn(['LOGIN', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'SENSITIVE_ACTION'])
  purpose?: 'LOGIN' | 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'SENSITIVE_ACTION';
}

class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email/password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('otp/request')
  @ApiOperation({ summary: 'Request a 6-digit Email OTP login code' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.email, dto.purpose || 'LOGIN');
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify Email OTP code and resolve canonical user identity' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp, dto.purpose || 'LOGIN');
  }

  @Post('password/forgot')
  @ApiOperation({ summary: 'Initiate password reset request via Email OTP' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Set new password using verified Email OTP' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  @Post('google/verify')
  @ApiOperation({ summary: 'Verify Google OAuth identity and resolve canonical user' })
  async googleVerify(@Body() dto: GoogleAuthDto) {
    return this.authService.loginWithGoogle(dto);
  }

  @Get('config')
  @ApiOperation({ summary: 'Public auth configuration metadata' })
  getAuthConfig() {
    return {
      demoMode: process.env.DEMO_MODE !== 'false',
      googleAuthEnabled: Boolean(process.env.GOOGLE_CLIENT_ID),
      googleClientId: process.env.GOOGLE_CLIENT_ID || undefined,
      otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
      otpLength: parseInt(process.env.OTP_LENGTH || '6', 10),
      resendCooldownSeconds: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10),
    };
  }
}

