import { Hono } from 'hono';
import { cors } from 'hono/cors';
// import { createRequestHandler } from 'react-router';
// import { serveStatic } from '@hono/node-server/serve-static';
// import { stream as honoStream } from 'hono/streaming';
import { z } from 'zod';
// import { zValidator } from '@hono/zod-validator';
import { streamText, generateText, generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
// import dotenv from 'dotenv';

// dotenv.config();

// console.log('process.env.FRIDAY_API_KEY: ', process?.env?.FRIDAY_API_KEY);

const app = new Hono<{ Bindings: Env }>();

const getModel = createOpenAI({
  apiKey: '21902918114338451458', //  process?.env?.FRIDAY_API_KEY ||
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

// 配置CORS，允许所有来源访问
app.use(
  cors({
    origin: '*', // 允许所有来源访问
  })
);

// API 路由
app.get('/api', (c) => {
  // console.log('c.env: ', c.env.FRIDAY_API_KEY, c.env);
  return c.json({
    code: 200,
    status: 'ok',
    message: 'ai-agent 测试成功',
    env: c.env.FRIDAY_API_KEY || '无法获取 env',
    timestamp: new Date().toISOString(),
  });
});

// 测试接口
app.post('/api/agent/test', async (c) => {
  const body = await c.req.json(); // 前端使用 useChat 时，接收 messages
  let userContent: string;
  if (body.messages && Array.isArray(body.messages)) {
    userContent = body.messages[body.messages.length - 1].content;
  } else if (body.message) {
    userContent = body.message;
  } else {
    return c.json({ error: 'Invalid request format' }, 400);
  }

  return c.json({
    role: 'assistant',
    content: `I am a Hono AI agent. You said: '${userContent}'`,
  });
});

app.post('/api/agent/stream', async (c) => {
  const { messages } = await c.req.json();
  console.log('流式输出: ', messages);
  const result = streamText({
    model: getModel('gpt-4o-mini'),
    messages: messages,
    onChunk: (chunk) => {
      // @ts-ignore
      console.log('hono onChunk: ', chunk.chunk.textDelta);
    },
  });
  // toDataStreamResponse can be used with the `useChat` and `useCompletion` hooks.
  // return result.toDataStreamResponse({
  //   sendReasoning: true,
  // }); // 标准 sse 响应
  return result.toTextStreamResponse(); // 纯文本流响应
  // return honoStream(c, (s) => s.pipe(result.toDataStream()));
});
app.post('/api/agent/gemini-stream', async (c) => {
  const { messages } = await c.req.json();
  console.log('流式输出: ', messages);
  const result = streamText({
    model: getModel('gpt-4o-mini'),
    messages: messages,
    onChunk: (chunk) => {
      console.log('hono onChunk: ', chunk.chunk);
    },
  });
  // toDataStreamResponse can be used with the `useChat` and `useCompletion` hooks.
  // { sendReasoning: true, }
  return result.toDataStreamResponse(); // 标准 sse 响应
  // return honoStream(c, (s) => s.pipe(result.toDataStream()));
});

app.post('/api/agent/chat', async (c) => {
  const { messages } = await c.req.json();
  console.log('普通输出: ', messages);
  const result = await generateText({
    model: getModel('gpt-4o-mini'),
    messages: messages,
  });
  // console.log('普通输出: ', result);
  return c.json({
    message: result.text,
  });
});

app.post('/api/agent/recommend', async (c) => {
  const { messages } = await c.req.json();
  console.log('推荐请求: ', messages);
  const result = await generateObject({
    model: getModel('gpt-4o-mini'),
    system: `
    你是一个电影推荐系统，请严格按照以下规则处理用户请求：
    ## 规则
    1. 仅处理与电影相关的推荐请求（类型、演员、导演、年代、情绪等）
    2. 如果用户输入与电影无关，设置 isValidRequest 为 false
    3. 如果是有效的电影请求，推荐 3-5 部相关电影
    ## 判断标准
    有效请求示例：推荐科幻电影、想看喜剧片、有什么好看的动作片、推荐张艺谋的电影
    无效请求示例：天气怎么样、帮我写代码、今天吃什么、数学题目等
    `,
    prompt: messages[messages.length - 1].content,
    schema: z.object({
      isValidRequest: z.boolean().describe('是否是有效的电影请求'),
      message: z.string().describe('回复消息，如果无效请求则提示用户'),
      movies: z
        .array(
          z.object({
            title: z.string().describe('电影名称'),
            description: z.string().describe('电影描述'),
            rating: z.number().describe('电影评分'),
            year: z.string().optional().describe('上映年份'),
          })
        )
        .optional()
        .describe('推荐的电影列表，仅在有效请求时提供'),
    }),
  });
  // console.log('推荐结果: ', result);
  return c.json({
    isValidRequest: result.object.isValidRequest,
    message: result.object.message,
    movies: result.object.movies || [],
  });
});

// 暴露client端
// app.use('*', serveStatic({ root: './public' }));

// SPA支持
// app.get('*', serveStatic({ path: './public/index.html' }));

// 处理静态资源
// app.get('/assets/*', async (c) => {
//   try {
//     return c.env.ASSETS.fetch(c.req.raw);
//   } catch (error) {
//     console.error('Asset error:', error);
//     return c.notFound();
//   }
// });

// 对于所有其他路由，返回 SPA
// app.get('*', (c) => {
//   const requestHandler = createRequestHandler(
//     () =>
//       import('virtual:react-router/server-build').catch((err) => {
//         console.log('err', err);
//       }),
//     'production' // 强制生产模式以提供静态资源
//   );

//   return requestHandler(c.req.raw, {
//     cloudflare: { env: c.env, ctx: c.executionCtx },
//   });
// });

export default app;

/** 以下是服务端 ssr 逻辑 */
// import { Hono } from "hono";
// import { createRequestHandler } from "react-router";

// const app = new Hono();

// // Add more routes here

// app.get("*", (c) => {
//   const requestHandler = createRequestHandler(
//     () => import("virtual:react-router/server-build"),
//     import.meta.env.MODE,
//   );

//   return requestHandler(c.req.raw, {
//     cloudflare: { env: c.env, ctx: c.executionCtx },
//   });
// });
