const responseError = (c: any, err: any, title: string) => {
  return c.json(
    {
      error: title || '接口调用失败',
      // @ts-ignore
      details: err?.message,
    },
    500
  );
};

export { responseError };
