import { MiddlewareHandler } from 'hono';

class Cat {
  static newTransaction(type: string, name: string) {
    return {
      complete: function () {},
      logError: function (error: any) {},
      setStatus: function () {},
    };
  }

  static STATUS = {
    SUCCESS: 'success',
    FAIL: 'fail',
  };

  constructor() {}
}

export const loggerMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const currentPath = c.req.path
      .split('/')
      .map((part) => {
        // uuid 替换
        if (/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(part)) {
          return ':uuid';
        }
        return part;
      })
      .join('/');
    const t = Cat.newTransaction('URL', currentPath);
    try {
      await next();
      t.complete();
    } catch (e) {
      t.logError(e);
      t.setStatus(Cat.STATUS.FAIL);
      t.complete();
      c.status(500);
      c.body(e.message); // "Internal Server Error"
    }
  };
};
