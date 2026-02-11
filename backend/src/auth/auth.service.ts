import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, type OnModuleInit, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AssociationsService } from '../associations/associations.service';
import { RolesService } from '../roles/roles.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { UserDocument } from '@schemas/user.schema';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private associationsService: AssociationsService,
    private rolesService: RolesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    if (!this.configService.get('JWT_SECRET')) {
      console.error('CRITICAL ERROR: JWT_SECRET is not defined in the environment.');
      process.exit(1);
    }
    if (!this.configService.get('SUPERADMIN_PASSCODE') || !this.configService.get('PRESIDENT_PASSCODE')) {
        console.error('CRITICAL ERROR: Admin passcodes are not defined in the environment.');
        process.exit(1);
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await user.comparePassword(pass)) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    console.log(`Login attempt for ${loginDto.email}`);
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
        console.error(`Login failed: User ${loginDto.email} not found`);
        throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) {
        console.error(`Login failed: Invalid password for ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
    }

    // Get role slugs for this user
    const roles = await this.rolesService.findByIds(user.roles);
    const roleSlugs = roles.map((r: any) => r.slug);

    // Role-based passcode validation
    if (roleSlugs.includes('superadmin')) {
      console.log('Validating superadmin passcode...');
      if (loginDto.passcode !== this.configService.get('SUPERADMIN_PASSCODE')) {
        console.error('Invalid superadmin passcode provided:', loginDto.passcode);
        throw new ForbiddenException('Invalid superadmin passcode');
      }
    } else if (roleSlugs.includes('president')) {
      console.log('Validating president passcode...');
      if (loginDto.passcode !== this.configService.get('PRESIDENT_PASSCODE')) {
        console.error('Invalid president passcode provided:', loginDto.passcode);
        throw new ForbiddenException('Invalid president passcode');
      }
    }

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto) {
    console.log('Registering user:', registerDto.email, 'Role:', registerDto.role);
    const { passcode, associationName, role, ...userData } = registerDto;

    // Validate passcode for privileged roles
    if (role === 'superadmin') {
      if (passcode !== this.configService.get('SUPERADMIN_PASSCODE')) {
        throw new ForbiddenException('Invalid superadmin passcode');
      }
    } else if (role === 'president') {
      if (passcode !== this.configService.get('PRESIDENT_PASSCODE')) {
        throw new ForbiddenException('Invalid president passcode');
      }
    }

    const association = await this.associationsService.findByName(associationName);
    if (!association) {
      console.error('Registration failed: Invalid association name', associationName);
      throw new BadRequestException(`Invalid association name: ${associationName}`);
    }

    const roleDoc = await this.rolesService.findBySlug(role);
    if (!roleDoc) {
      throw new BadRequestException('Invalid role');
    }

    const newUser = await this.usersService.create({
      ...userData,
      association: association._id,
      rank: 'Candidate', // Initial rank
      status: 'active',
      roles: [roleDoc._id],
    });

    // If role is president, update association
    if (role === 'president') {
        await this.associationsService.updatePresident(association._id.toString(), newUser._id.toString());
    }

    return this.generateTokens(newUser);
  }

  async generateTokens(user: UserDocument) {
    const roles = await this.rolesService.findByIds(user.roles);
    const roleSlugs = roles.map((r: any) => r.slug);

    const payload = {
      sub: user._id,
      email: user.email,
      userCode: user.userCode,
      roles: roleSlugs,
      associationId: user.association,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN') || '7d',
    });

    // Save refresh token to DB
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userCode: user.userCode,
        rank: user.rank,
        roles: roleSlugs,
      }
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Refresh Token Rotation Hardening
      // If the token is NOT in the active list, it might be a reuse attempt
      if (!user.refreshTokens?.includes(token)) {
        // Reuse detected: invalidate all tokens for this user
        user.refreshTokens = [];
        await user.save();
        throw new UnauthorizedException('Refresh token reuse detected. All sessions invalidated.');
      }

      // Remove used token
      user.refreshTokens = user.refreshTokens.filter(t => t !== token);

      // Generate new pair
      return this.generateTokens(user);
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.rolesService.findByIds(user.roles);
    const roleSlugs = roles.map((r: any) => r.slug);

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userCode: user.userCode,
      rank: user.rank,
      roles: roleSlugs,
      associationId: user.association,
      status: user.status,
    };
  }

  async logout(userPayload: any, token: string) {
    const user = await this.usersService.findById(userPayload.userId);
    if (user) {
      user.refreshTokens = user.refreshTokens?.filter(t => t !== token) || [];
      await user.save();
    }
    return { message: 'Logged out successfully' };
  }
}
