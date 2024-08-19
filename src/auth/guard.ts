import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (authorization) {
      const [scheme, token] = authorization.split(' ');
      return scheme.toLowerCase() === 'bearer' && token === '1234';
      // TODO: JWT Decode authorization 토큰이 유저 정보 또는 유저 타입
      // TODO: JWT Encode 로그인 서비스 유저용
      // TODO: JWT Encode 관리자 로그인 관리자용 토큰
      // TODO: JWT Encode 호텔 매니저용 로그인 호텔 매니저용 토큰
    }
    throw new BadRequestException();
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized access');
    }
    return user;
  }
}

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized access');
    }
    return user;
  }
}
