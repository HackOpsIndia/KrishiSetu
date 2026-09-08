// ============================================================
// Admin Users Controller — RBAC & User Administration Endpoints
// ============================================================

import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsIn, IsString, IsOptional } from 'class-validator';
import { RolesGuard, AdminOnly } from '../auth/roles.guard';
import { AdminUsersService } from './admin-users.service';

class UpdateRoleDto {
  @IsIn(['FARMER', 'FPO', 'BUYER', 'ADMIN'])
  role: 'FARMER' | 'FPO' | 'BUYER' | 'ADMIN';

  @IsOptional()
  @IsString()
  reason?: string;
}

class UpdateStatusDto {
  @IsIn(['ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING'])
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'PENDING';

  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('Admin User Management')
@Controller('api/admin/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@AdminOnly()
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List platform users with filtering and search' })
  async listUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('provider') provider?: string,
  ) {
    return this.adminUsersService.listUsers({ search, role, status, provider });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Aggregated user registry statistics' })
  async getUserStats() {
    return this.adminUsersService.getUserStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed user profile and audit history' })
  async getUserDetail(@Param('id') id: string) {
    return this.adminUsersService.getUserDetail(id);
  }

  @Get(':id/audit')
  @ApiOperation({ summary: 'Get audit trail for a specific user' })
  async getUserAudit(@Param('id') id: string) {
    return this.adminUsersService.getUserAudit(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role with final-admin protection' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Request() req: any,
  ) {
    const actor = {
      id: req.user?.id || req.user?.sub || 'admin',
      email: req.user?.email || 'admin@demo.in',
    };
    return this.adminUsersService.updateUserRole(id, dto.role, actor, dto.reason);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user account status (active/suspended/disabled)' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Request() req: any,
  ) {
    const actor = {
      id: req.user?.id || req.user?.sub || 'admin',
      email: req.user?.email || 'admin@demo.in',
    };
    return this.adminUsersService.updateUserStatus(id, dto.status, actor, dto.reason);
  }
}
