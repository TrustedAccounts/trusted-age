import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // Add the hardcoded userId to the request object
    request.user = {
      id: '673b77b46049df9130d852b5',
    };

    // Allow the request to proceed
    return true;
  }
}
