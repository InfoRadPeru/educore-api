// Qué es: Controller HTTP del módulo Auth.
// Principio: Single Responsibility — solo recibe la request, llama al use case y retorna la response. Cero lógica de negocio.
// Por qué lanza el error directamente: El controller recibe un Result. Si falló, lanza el AppError. El HttpExceptionFilter lo intercepta y lo convierte a HTTP. El controller no decide qué status code va, eso es responsabilidad del filtro.

import { ChangePasswordDto } from "@modules/auth/application/dtos/change-password.dto";
import { ForgotPasswordDto } from "@modules/auth/application/dtos/forgot-password.dto";
import { LoginDto } from "@modules/auth/application/dtos/login.dto";
import { LogoutDto } from "@modules/auth/application/dtos/logout.dto";
import { RefreshDto } from "@modules/auth/application/dtos/refresh.dto";
import { RegisterDto } from "@modules/auth/application/dtos/register.dto";
import { ResetPasswordDto } from "@modules/auth/application/dtos/reset-password.dto";
import { SelectContextDto } from "@modules/auth/application/dtos/select-context.dto";
import { ChangePasswordUseCase } from "@modules/auth/application/use-cases/change-password.use-case";
import { ForgotPasswordUseCase } from "@modules/auth/application/use-cases/forgot-password.use-case";
import { LoginUseCase } from "@modules/auth/application/use-cases/login.use-case";
import { LogoutUseCase } from "@modules/auth/application/use-cases/logout.use-case";
import { MeUseCase } from "@modules/auth/application/use-cases/me.use-case";
import { RefreshUseCase } from "@modules/auth/application/use-cases/refresh.use-case";
import { RegisterUseCase } from "@modules/auth/application/use-cases/register.use-case";
import { ResetPasswordUseCase } from "@modules/auth/application/use-cases/reset-password.use-case";
import { SelectContextUseCase } from "@modules/auth/application/use-cases/select-context.use-case";
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseFilters, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HttpExceptionFilter } from "@shared/infrastructure/filters/http-exception.filter";

@ApiTags('Auth')
@UseFilters(HttpExceptionFilter)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase:          LoginUseCase,
    private readonly registerUseCase:       RegisterUseCase,
    private readonly selectContextUseCase:  SelectContextUseCase,
    private readonly refreshUseCase:        RefreshUseCase,
    private readonly logoutUseCase:         LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase:  ResetPasswordUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly meUseCase:             MeUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar colegio + SUPER_ADMIN' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUseCase.execute(dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('select-context')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Elegir contexto cuando hay múltiples asignaciones' })
  async selectContext(@Request() req: any, @Body() dto: SelectContextDto) {
    const result = await this.selectContextUseCase.execute(req.user.sub, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token' })
  async refresh(@Body() dto: RefreshDto) {
    const result = await this.refreshUseCase.execute(dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(@Body() dto: LogoutDto) {
    const result = await this.logoutUseCase.execute(dto);
    if (!result.ok) throw result.error;
    return { message: 'Sesión cerrada correctamente' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.forgotPasswordUseCase.execute(dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.resetPasswordUseCase.execute(dto);
    if (!result.ok) throw result.error;
    return { message: 'Contraseña actualizada correctamente' };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña autenticado' })
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    const result = await this.changePasswordUseCase.execute({
      usuarioId:       req.user.sub,
      currentPassword: dto.currentPassword,
      newPassword:     dto.newPassword,
    });
    if (!result.ok) throw result.error;
    return { message: 'Contraseña actualizada correctamente' };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Perfil del usuario autenticado con contexto actual' })
  async me(@Request() req: any) {
    const result = await this.meUseCase.execute({
      usuarioId:  req.user.sub,
      colegioId:  req.user.colegioId,
      sedeId:     req.user.sedeId,
      rolId:      req.user.rolId,
    });
    if (!result.ok) throw result.error;
    return result.value;
  }
}