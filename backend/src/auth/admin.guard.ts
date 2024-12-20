import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as process from 'node:process';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Protected Area"');
      throw new UnauthorizedException('Authentication is required');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const [username, password] = Buffer.from(base64Credentials, 'base64')
      .toString('utf8')
      .split(':');

    if (
      username === process.env.ADMIN_AUTH_USERNAME &&
      password === process.env.ADMIN_AUTH_PASSWORD
    ) {
      return true;
    } else {
      response.setHeader('WWW-Authenticate', 'Basic realm="Protected Area"');
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
