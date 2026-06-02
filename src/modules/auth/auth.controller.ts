import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return { success: true, data };
  }

  @Post('refresh')
  async refresh(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }
    const refreshToken = authHeader.split(' ')[1];
    const data = await this.authService.refresh(refreshToken);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(
    @Request() req: import('express').Request & { user: { id: string } },
  ) {
    const data = await this.authService.getProfile(req.user.id);
    return { success: true, data };
  }
}
