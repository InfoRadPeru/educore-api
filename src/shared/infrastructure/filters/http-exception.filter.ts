// ARCHIVO 2 — src/shared/infrastructure/filters/http-exception.filter.ts
// Qué es: Filtro global que intercepta todos los errores de la app.
// Patrón: Chain of Responsibility.
// Por qué: Un único lugar decide cómo se ve cada error en HTTP. Los use cases no saben nada de HTTP. El controller lanza el AppError y este filtro lo convierte.
// Principio SOLID: Single Responsibility — solo convierte errores a HTTP.

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from 'express';
import { AppError } from "@shared/domain/result";

const ERROR_CODE_TO_HTTP: Record<string, HttpStatus> = {
  NOT_FOUND:        HttpStatus.NOT_FOUND,
  CONFLICT:         HttpStatus.CONFLICT,
  UNAUTHORIZED:     HttpStatus.UNAUTHORIZED,
  FORBIDDEN:        HttpStatus.FORBIDDEN,
  VALIDATION_ERROR: HttpStatus.UNPROCESSABLE_ENTITY,
  PLAN_LIMIT_EXCEEDED: HttpStatus.FORBIDDEN,
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx    = host.switchToHttp();
    const res    = ctx.getResponse<Response>();
    const req    = ctx.getRequest<Request>();
    const { status, message } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(
        `[${req.method}] ${req.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    res.status(status).json({
      statusCode: status,
      message,
      path:      req.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): { status: number; message: string } {
    // Errores de validación y HTTP de NestJS
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const message =
        typeof body === 'object' && 'message' in body
          ? Array.isArray((body as any).message)
            ? (body as any).message.join(', ')
            : String((body as any).message)
          : exception.message;
      return { status: exception.getStatus(), message };
    }

    // Errores Prisma (safety net — captura KnownRequestError, ValidationError y similares)
    if (isPrismaError(exception)) {
      const code = (exception as { code?: unknown }).code;
      if (code === 'P2002') {
        return { status: HttpStatus.CONFLICT, message: 'Ya existe un registro con esos datos' };
      }
      if (code === 'P2025') {
        return { status: HttpStatus.NOT_FOUND, message: 'Registro no encontrado' };
      }
      return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error interno del servidor' };
    }

    // Errores de dominio → HTTP
    if (exception instanceof AppError) {
      return {
        status:  ERROR_CODE_TO_HTTP[exception.code] ?? HttpStatus.BAD_REQUEST,
        message: exception.message,
      };
    }

    // Error no controlado — nunca exponer detalles al cliente
    return {
      status:  HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
    };
  }
}

function isPrismaError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.constructor.name.startsWith('PrismaClient');
  }
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    (error as { code: string }).code.startsWith('P')
  );
}