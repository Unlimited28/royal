import { Controller, Get, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateSystemSettingDto } from './dto/system-setting.dto';

@ApiTags('System Settings')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all system settings (Super Admin only)' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Patch(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a system setting (Super Admin only)' })
  update(@Param('key') key: string, @Body() updateDto: UpdateSystemSettingDto, @Req() req: any) {
    return this.settingsService.updateSetting(key, updateDto, req.user.userId, req.user.roles[0]);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a specific setting' })
  getOne(@Param('key') key: string) {
    return this.settingsService.getSetting(key);
  }
}
