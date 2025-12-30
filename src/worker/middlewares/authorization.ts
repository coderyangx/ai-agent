// 公共的基于 AccessToken 鉴权
import { MiddlewareHandler } from 'hono';
// import { URL } from 'node:url';
// import { getAuthUserInfo } from '../services/auth.js';

const AUTH_PATH_PREFIX = ['/analysis-agent/levi/chat'];

const getAuthUserInfo = async (appEnv: string, token: string) => {};

export const authorizationMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const url = new URL(c.req.url);

    if (url.searchParams.get('debug') && process.env.NODE_ENV === 'local') {
      c.set('user', {
        userId: '123',
        userName: 'Test',
        mis: 'test',
      });
      return next();
    }

    if (!AUTH_PATH_PREFIX.some((prefix) => url.pathname.startsWith(prefix))) {
      return next();
    }

    const auth = c.req.header('Authorization') || c.req.query('access_token') || '';
    const token = auth.length > 'Bearer '.length ? auth.replace(/^Bearer/, '').trim() : '';

    const user = await getAuthUserInfo(process.env.APP_ENV, token);

    if (user) {
      c.set('user', user);
      return next();
    }

    // winston.logError('AuthorizationMiddleware: 未授权访问');
    return c.json(
      {
        message: '未授权访问',
      },
      401
    );
  };
};
