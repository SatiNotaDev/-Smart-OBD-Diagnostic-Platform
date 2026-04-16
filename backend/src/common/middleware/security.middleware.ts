import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Security Middleware - добавляет security headers
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    // Security headers
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Remove powered by header
    response.removeHeader('X-Powered-By');

    next();
  }
}
