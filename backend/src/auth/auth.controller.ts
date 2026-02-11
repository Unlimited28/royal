import { Controller, Post, Body, Request, UseGuards, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 registrations per minute
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async logout(@Request() req: any, @Body('refreshToken') refreshToken: string) {
    return this.authService.logout(req.user, refreshToken);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMe(@Request() req: any) {
    return this.authService.getMe(req.user.userId);
  }
}
