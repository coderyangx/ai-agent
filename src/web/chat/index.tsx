import { useEffect, useRef, useState, useCallback } from 'react';
import { Bot, Sun, Moon, Zap } from 'lucide-react';
import { useScroll, motion } from 'motion/react';
import { ScrollArea } from '../components/scroll-area';
import SplitText from '../components/split-text';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Switch } from '../components/switch';
import { Label } from '../components/label';
import { Button } from '../components/button';

import { useTheme } from '../utils/theme';
import { getCookie } from '../config';
import { set } from 'zod';
// import { ContentCard } from '@/components/shadcn/ContentCard';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  timestamp: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  timestamp: string;
}

const cookie = getCookie();

export default function ChatContainer() {
  const streamMode = JSON.parse(localStorage.getItem('isStreamMode')) || false;

  const { scrollYProgress, scrollXProgress } = useScroll();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamMode, setIsStreamMode] = useState(streamMode);
  const [streamContent, setStreamContent] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  // 滚动到底部的函数
  const scrollToBottom = useCallback(() => {
    if (!shouldScrollRef.current) return;

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // 监听消息变化和流内容变化，滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamContent, scrollToBottom]);

  // 监听滚动事件，判断用户是否手动滚动
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    const handleScroll = () => {
      if (!scrollArea) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      // 如果用户滚动到接近底部（20px误差范围内），则继续自动滚动
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 20;
      shouldScrollRef.current = isNearBottom;
    };
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamContent('');
    // 强制滚动到底部
    shouldScrollRef.current = true;

    if (isStreamMode) {
      // 流式输出模式
      await handleStreamMode(userMessage.content);
    } else {
      // 普通模式
      await handleNormalMode(userMessage.content);
    }
  };

  // 处理普通输出
  const handleNormalMode = async (content: string) => {
    try {
      const conversation = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: content,
        },
      ];
      console.log('调用 chat 接口:', conversation);

      // 调用AI /api/agent/chat
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'X-Time': new Date().toLocaleString(),
          'X-Timestamp': new Date().getTime().toString(),
          'Custom-Name': 'yang',
          Cookie: cookie,
        },
        body: JSON.stringify({ messages: conversation }),
      });

      const data = await response.json();
      const aiResponse = data.message || data.content || data.response || '';
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，发生了一些错误。请稍后再试。',
        role: 'system',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理流式输出
  // const handleStreamMode = async (content: string) => {
  //   try {
  //     // 创建一个空的助手消息占位
  //     const placeholderId = (Date.now() + 1).toString();
  //     const timestamp = new Date().toLocaleTimeString();

  //     const conversation = [
  //       ...messages.map((msg) => ({
  //         role: msg.role,
  //         content: msg.content,
  //       })),
  //       {
  //         role: 'user' as const,
  //         content: content,
  //       },
  //     ];
  //     // 添加一个空的助手消息，用于显示流式内容
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         id: placeholderId,
  //         content: '',
  //         role: 'assistant',
  //         timestamp,
  //       },
  //     ]);

  //     // 调用流式API  fetch 可以直接返回流式数据
  //     const response = await fetch('/api/agent/stream', {
  //       method: 'POST',
  //       body: JSON.stringify({ messages: conversation }),
  //     });

  //     // 基于 fetch 响应体的 getReader 方法，可以读取流式数据
  //     const reader = response.body?.getReader();
  //     const decoder = new TextDecoder();
  //     let accumulatedContent = '';

  //     while (true) {
  //       const { done, value } = await reader.read();
  //       // console.log('流式数据:', value);
  //       if (done) break;
  //       const chunk = decoder.decode(value, { stream: true }); // 解码
  //       console.log('接收到数据块:', chunk);

  //       const lines = chunk.split('\n\n'); // 处理SSE格式

  //       for (const line of lines) {
  //         if (line.startsWith('data: ')) {
  //           const data = line.substring(6); // 移除 'data: ' 前缀
  //           if (data === '[DONE]') {
  //             break;
  //           }
  //           try {
  //             const parsed = JSON.parse(data);
  //             console.log('解析后的数据:', parsed);
  //             if (parsed.content) {
  //               accumulatedContent += parsed.content;
  //               setStreamContent(accumulatedContent); // 更新消息内容
  //               // 更新现有消息
  //               setMessages((prev) =>
  //                 prev.map((msg) =>
  //                   msg.id === placeholderId ? { ...msg, content: accumulatedContent } : msg
  //                 )
  //               );
  //             }
  //           } catch (e) {
  //             console.error('解析SSE数据失败', e);
  //           }
  //         }
  //       }
  //     }
  //     // response.blob().then((blob) => {
  //     //   const reader = new FileReader();
  //     //   reader.onload = (e) => {
  //     //     const content = e.target?.result as string;
  //     //     console.log("流式数据:", content);
  //     //     // 将流式数据添加到 messages 中
  //     //     setMessages((prev) => [
  //     //       ...prev,
  //     //       {
  //     //         id: (Date.now() + 1).toString(),
  //     //         content: content,
  //     //         role: "assistant",
  //     //         timestamp: new Date().toLocaleTimeString(),
  //     //       },
  //     //     ]);
  //     //   };
  //     //   reader.readAsText(blob);
  //     // });
  //   } catch (error) {
  //     const errorMessage: Message = {
  //       id: (Date.now() + 1).toString(),
  //       content: '抱歉，流式输出发生错误。请稍后再试。',
  //       role: 'system',
  //       timestamp: new Date().toLocaleTimeString(),
  //     };
  //     setMessages((prev) => [...prev, errorMessage]);
  //   } finally {
  //     setIsLoading(false);
  //     setStreamContent('');
  //   }
  // };

  // 修改 handleStreamMode 中的处理逻辑
  // 处理流式输出
  const handleStreamMode = async (content: string) => {
    try {
      // 创建一个空的助手消息占位
      const placeholderId = (Date.now() + 1).toString();
      const timestamp = new Date().toLocaleTimeString();

      const conversation = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: content,
        },
      ];

      // 添加一个空的助手消息，用于显示流式内容
      setMessages((prev) => [
        ...prev,
        {
          id: placeholderId,
          content: '',
          role: 'assistant',
          timestamp,
        },
      ]);
      setIsLoading(true);

      // 调用流式API
      const response = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: {
          'X-Time': new Date().toLocaleString(),
          'X-Timestamp': new Date().getTime().toString(),
          'Custom-Name': 'yang',
          Cookie: cookie,
        },
        body: JSON.stringify({ messages: conversation }),
      });

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }
      setIsLoading(false);

      const decoder = new TextDecoder();
      let accumulatedContent = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          console.log('接收到数据块:', chunk);
          // 处理可能包含多个 JSON 对象的数据块
          const lines = chunk.split('\n');
          console.log('lines', lines);
          for (const line of lines) {
            // 如果不是 JSON，则当作文本内容处理
            console.log('处理文本内容:', line);
            // 累积文本内容
            accumulatedContent += line;
            setStreamContent(accumulatedContent);
            // 实时更新消息内容
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === placeholderId ? { ...msg, content: accumulatedContent } : msg
              )
            );
          }
        }
      } finally {
        reader.releaseLock();
      }
      console.log('最终累积内容:', accumulatedContent);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，流式输出发生错误。请稍后再试。',
        role: 'system',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamContent('');
    }
  };

  const handleBot = () => {
    fetch('/api')
      .then((res) => res.json())
      .then((data) => {
        console.log('测试接口: ', data);
      });

    fetch('/api/agent/recommend', {
      method: 'POST',
      headers: {
        Cookie: cookie,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: '帮我推荐一些高评分科幻电影',
          },
        ],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('recommend: ', data);
      });
  };

  const handleSwitchMode = () => {
    setIsStreamMode(!isStreamMode);
    localStorage.setItem('isStreamMode', JSON.stringify(!isStreamMode));
  };

  const copyMessage = async (content: string) => {
    try {
      console.log('复制:', content);
      await navigator.clipboard.writeText(content);
      // 这里可以添加toast提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className='flex flex-col h-full max-w-4xl bg-card rounded-lg shadow-lg overflow-hidden border'>
      <div className='flex items-center justify-between px-6 py-4 border-b bg-card'>
        <div className='flex items-center space-x-2'>
          <Bot className='h-5 w-5 text-primary' onClick={handleBot} />
          <SplitText
            text='Agent'
            className='font-semibold text-center'
            delay={100}
            duration={0.6}
            ease='power3.out'
            splitType='chars'
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin='-100px'
            textAlign='center'
            onLetterAnimationComplete={() => {}}
          />
          <div className='h-2 w-2 bg-green-500 rounded-full animate-pulse' />
          {/* 状态指示 */}
          <div className='text-sm text-gray-500'>{isLoading && '正在输入中...'}</div>
        </div>

        <div className='flex items-center space-x-4'>
          {/* 流式输出模式开关 */}
          <div className='flex items-center space-x-2'>
            <Switch id='stream-mode' checked={isStreamMode} onCheckedChange={handleSwitchMode} />
            <Label htmlFor='stream-mode' className='flex items-center space-x-1'>
              <Zap className='h-4 w-4' />
              <span>流式输出</span>
            </Label>
          </div>

          {/* 主题切换 variant='ghost' */}
          <Button variant='ghost' onClick={toggleTheme} className='rounded-full'>
            {theme === 'light' ? (
              <Sun className='h-5 w-5 cursor-pointer' />
            ) : (
              <Moon className='h-5 w-5 cursor-pointer' />
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className='flex-1 px-4' ref={scrollAreaRef}>
        <motion.div
          id='scroll-indicator'
          style={{
            scaleX: scrollYProgress,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            originX: 0,
            backgroundColor: '#eee',
          }}
        />
        {/* <ContentCard /> */}
        <div className='space-y-6'>
          {messages.length === 0 ? (
            // 欢迎界面
            <div className='text-center py-12'>
              <Bot className='h-12 w-12 text-blue-500 mx-auto mb-4' />
              <h2 className='text-xl font-semibold text-foreground mb-2'>欢迎使用 AI 助手</h2>
              <p className='text-muted-foreground'>
                我可以帮助你解答问题、创作内容、编程协助等。请开始对话吧！
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
                id={message.id}
                onCopy={copyMessage}
                onLike={(id) => console.log('点赞:', id)}
                onDislike={(id) => console.log('踩:', id)}
              />
              // <MessageBubble
              //   key={message.id}
              //   content={message.content}
              //   role={message.role}
              //   timestamp={message.timestamp}
              // />
            ))
          )}
          {isLoading && !isStreamMode && (
            <MessageBubble content='' role='assistant' isLoading={true} />
          )}
          <div ref={messagesEndRef} />
          {/* 错误提示 */}
          {/* {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
              <p className='text-red-600 text-sm'>发生错误: {error.message}</p>
            </div>
          )} */}
        </div>
        {/* <div className='space-y-4 py-4'>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              role={message.role}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && !isStreamMode && (
            <MessageBubble content='' role='assistant' isLoading={true} />
          )}
          <div ref={messagesEndRef} />
        </div> */}
      </ScrollArea>

      <div className='p-4 border-t bg-card'>
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
