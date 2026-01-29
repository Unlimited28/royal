import { Controller, Get, Post, Param, Request, UseGuards, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateProfile(@Request() req: any, @Body() updateData: UpdateProfileDto) {
    return this.usersService.updateWithScore(req.user.userId, updateData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  findAll() {
    return this.usersService.findAll();
  }

  // Admin Endpoints
  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user role (Super Admin only)' })
  changeRole(@Param('id') id: string, @Body('roleIds') roleIds: string[], @Request() req: any) {
    return this.usersService.changeRole(id, roleIds, req.user.userId, req.user.roles[0]);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user status (Super Admin only)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
    return this.usersService.updateUserStatus(id, status, req.user.userId, req.user.roles[0]);
  }

  @Post(':id/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin reset user password (Super Admin only)' })
  resetPassword(@Param('id') id: string, @Body('newPassword') pass: string, @Request() req: any) {
    return this.usersService.adminResetPassword(id, pass, req.user.userId, req.user.roles[0]);
  }
}
