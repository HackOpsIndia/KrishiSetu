// ============================================================
// Admin Email Controller — Health, Status & Operational Verification
// ============================================================

import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard, AdminOnly } from '../auth/roles.guard';
import { EmailService } from './email.service';

@ApiTags('Admin Email Operations')
@Controller('api/admin/email')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@AdminOnly()
@ApiBearerAuth()
export class AdminEmailController {
  constructor(private emailService: EmailService) {}

  @Get('health')
  @ApiOperation({ summary: 'Email Service connection and operational health check' })
  async getHealth() {
    return this.emailService.verifyConnection();
  }

  @Post('test')
  @ApiOperation({ summary: 'Send admin operational verification test email' })
  async sendTestEmail(@Body('to') to: string, @Request() req: any) {
    const targetEmail = to || req?.user?.email || 'admin@demo.in';
    return this.emailService.sendTestEmail(targetEmail);
  }
}
