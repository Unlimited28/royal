import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AssociationsService } from '../associations/associations.service';
import { RolesService } from '../roles/roles.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private associationsService: AssociationsService,
    private rolesService: RolesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await user.comparePassword(pass)) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !(await user.comparePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get role slugs for this user
    const roles = await this.rolesService.findByIds(user.roles);
    const roleSlugs = roles.map((r: any) => r.slug);

    // Role-based passcode validation
    if (roleSlugs.includes('superadmin')) {
      if (loginDto.passcode !== this.configService.get('SUPERADMIN_PASSCODE')) {
        throw new ForbiddenException('Invalid superadmin passcode');
      }
    } else if (roleSlugs.includes('president')) {
      if (loginDto.passcode !== this.configService.get('PRESIDENT_PASSCODE')) {
        throw new ForbiddenException('Invalid president passcode');
      }
    }

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto) {
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
      throw new BadRequestException('Invalid association name');
    }

    const roleDoc = await this.rolesService.findBySlug(role);
    if (!roleDoc) {
      throw new BadRequestException('Invalid role');
    }

    const newUser = await this.usersService.create({
      ...userData,
      organization: association._id,
      rank: 'Candidate', // Initial rank
      status: 'active',
      roles: [roleDoc._id],
    });

    // If role is president, update association
    if (role === 'president') {
        await this.associationsService.updatePresident(association._id.toString(), newUser._id.toString());
        // Update user's role/rank? The PRD says president is a role.
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
      roles: roleSlugs
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
      }
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.refreshTokens?.includes(token)) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Remove old token and generate new ones
      user.refreshTokens = user.refreshTokens.filter(t => t !== token);
      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(user: UserDocument, token: string) {
    user.refreshTokens = user.refreshTokens?.filter(t => t !== token) || [];
    await user.save();
    return { message: 'Logged out successfully' };
  }
}
