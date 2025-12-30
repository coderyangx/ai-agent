// new gemini-ui
import { useMemo, useState } from 'react';
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import MarkdownRender from '../components/MarkdownRender';
import LoadingDots from '../components/LoadingDots';
import { Button } from '../components/button';
import { motion } from 'motion/react';
import { ToolMessagePart } from '../tools';
import { cn } from '../utils/cn';

// new gemini-ui

interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  timestamp?: string;
  isLoading?: boolean;
  className?: string;
  // 新增的可选功能
  id?: string;
  onCopy?: (content: string) => void;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  // 新的消息parts结构
  parts?: Array<{
    type: 'text' | 'tool-invocation' | 'tool-call' | 'tool-result';
    text?: string;
    toolInvocation?: any;
    toolCallId?: string;
    toolName?: string;
    args?: any;
    result?: any;
    state?: 'calling' | 'finished' | 'failed' | 'success';
  }>;
}

export function MessageBubble(props: MessageBubbleProps) {
  const {
    content,
    role,
    timestamp,
    isLoading = false,
    className,
    id,
    onCopy,
    onLike,
    onDislike,
  } = props;

  const isUser = role === 'user';
  const [showActions, setShowActions] = useState(false);

  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const renderAvatar = useMemo(() => {
    return (
      <Avatar>
        {/* <AvatarImage src='/user-avatar.png' alt='User' /> */}
        <AvatarFallback>
          {isUser ? <User className='h-5 w-5' /> : <Bot className='h-5 w-5' />}
        </AvatarFallback>
      </Avatar>
    );
  }, []);

  const getBubbleStyles = () => {
    switch (role) {
      case 'user':
        return 'bg-primary text-primary-foreground';
      case 'assistant':
        return 'bg-muted text-foreground';
      case 'system':
        return 'bg-secondary text-secondary-foreground italic';
      case 'tool':
        return 'bg-accent text-accent-foreground font-mono text-sm';
      default:
        return 'bg-background text-foreground';
    }
  };

  const handleCopy = async () => {
    onCopy?.(content);
  };

  const containerClasses = `flex w-full items-start gap-3 py-4 ${
    isUser ? 'flex-row-reverse' : 'flex-row'
  } ${className || ''}`;

  // max-w-[80%]
  const bubbleClasses = `relative rounded-lg px-4 py-2 shadow-sm ${getBubbleStyles()} ${
    isUser ? 'rounded-tr-none' : 'rounded-tl-none'
  }`;

  return (
    <motion.div
      className={containerClasses}
      variants={containerVariants}
      initial='initial'
      animate='animate'
      exit='exit'
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {renderAvatar}
      <div className='flex flex-col gap-1'>
        <div className={bubbleClasses}>
          {isLoading ? (
            <LoadingDots />
          ) : (
            <>
              {/* 优先渲染parts */}
              {props.parts && props.parts.length > 0 ? (
                <div className='flex flex-col gap-2'>
                  {props.parts.map((part, index) => {
                    if (part.type === 'text') {
                      return (
                        <div key={index} className='text-part'>
                          <MarkdownRender>{part.text}</MarkdownRender>
                        </div>
                      );
                    }
                    if (part.type.startsWith('tool-')) {
                      return (
                        <div key={index}>
                          <ToolMessagePart part={part} />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                /* 如果没有parts，渲染content */
                <>
                  {isUser ? (
                    <div className='whitespace-pre-wrap break-words text-left'>{content}</div>
                  ) : (
                    <MarkdownRender>{content}</MarkdownRender>
                  )}
                </>
              )}
              <div className='text-xs  mt-1 text-right text-gray-500'>{timestamp || '刚刚'}</div>
              {/* {timestamp && (
                <div className='text-xs text-muted-foreground mt-1 text-right'>
                  {timestamp}
                </div>
              )} */}
            </>
          )}
        </div>

        {/* 新增：操作按钮区域 */}
        {!isLoading && (onCopy || onLike || onDislike) && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 transition-opacity duration-200',
              showActions ? 'opacity-100' : 'opacity-0',
              isUser ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {!isUser && (
              <>
                {onCopy && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700'
                    onClick={handleCopy}
                    title='复制内容'
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                )}
                {onLike && id && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700'
                    onClick={() => onLike(id)}
                    title='点赞'
                  >
                    <ThumbsUp className='h-3 w-3' />
                  </Button>
                )}
                {onDislike && id && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700'
                    onClick={() => onDislike(id)}
                    title='踩'
                  >
                    <ThumbsDown className='h-3 w-3' />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
