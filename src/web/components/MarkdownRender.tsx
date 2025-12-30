import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// 自定义代码块样式
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match && match[1] ? match[1] : '';

  if (inline) {
    return (
      <code
        className='bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono'
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className='relative rounded-md overflow-hidden'>
      {language && (
        <div className='absolute top-0 right-0 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs rounded-bl-md'>
          {language}
        </div>
      )}
      <pre className='bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto'>
        <code
          className={className ? `text-sm font-mono ${className}` : 'text-sm font-mono'}
          {...props}
        >
          {children}
        </code>
      </pre>
    </div>
  );
};

// 自定义组件映射
const components = {
  code: CodeBlock,
  // 自定义链接在新窗口打开
  a: ({ node, href, children, ...props }: any) => (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-blue-500 hover:underline'
      {...props}
    >
      {children}
    </a>
  ),
  // 自定义表格样式
  table: ({ node, children, ...props }: any) => (
    <div className='overflow-x-auto my-4'>
      <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700' {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ node, children, ...props }: any) => (
    <thead className='bg-gray-100 dark:bg-gray-800' {...props}>
      {children}
    </thead>
  ),
  th: ({ node, children, ...props }: any) => (
    <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wider' {...props}>
      {children}
    </th>
  ),
  td: ({ node, children, ...props }: any) => (
    <td className='px-4 py-2 whitespace-nowrap text-sm' {...props}>
      {children}
    </td>
  ),
  // 自定义列表样式
  ul: ({ node, children, ...props }: any) => (
    <ul className='list-disc pl-5 my-2 space-y-1 text-left' {...props}>
      {children}
    </ul>
  ),
  ol: ({ node, children, ...props }: any) => (
    <ol className='list-decimal pl-5 my-2 space-y-1 text-left' {...props}>
      {children}
    </ol>
  ),
  // 自定义标题样式
  h1: ({ node, children, ...props }: any) => (
    <h1 className='text-2xl font-bold my-4 text-left' {...props}>
      {children}
    </h1>
  ),
  h2: ({ node, children, ...props }: any) => (
    <h2 className='text-xl font-bold my-3 text-left' {...props}>
      {children}
    </h2>
  ),
  h3: ({ node, children, ...props }: any) => (
    <h3 className='text-lg font-bold my-2 text-left' {...props}>
      {children}
    </h3>
  ),
  // 自定义段落样式
  p: ({ node, children, ...props }: any) => (
    <p className='my-2 text-left' {...props}>
      {children}
    </p>
  ),
};

const MarkdownRender = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='markdown-content w-full text-left'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRender;
