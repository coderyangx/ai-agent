import React, { useState } from 'react';
// import { Collapse } from '../components/collapse';
import {
  ChartNoAxesCombinedIcon,
  ChartPieIcon,
  Loader2,
  SearchIcon,
  TriangleAlert,
  Wrench,
  DatabaseIcon,
} from 'lucide-react'; // TODO 统一 icon 库
import clsx from 'clsx';
import type { ToolUIPart, UIMessage } from 'ai';
import './index.less';
import MarkdownRender from '../components/MarkdownRender';

const ToolNameMap = {
  'tool-call': '工具调用',
  'tool-result': '工具结果',
  //
  'query-column-values': '查询列数据',
  'query-data': '数据查询',
  'analysis-data': '数据分析',
  'generate-chart': '图表生成',
  'search-web': '网页搜索',
  'read-dataset-page': '读取数据',
  'python-clean-data': '数据清洗',
};

const ToolIconMap = {
  'tool-call': Wrench,
  'tool-result': Wrench,
  'query-data': DatabaseIcon,
  'query-column-values': DatabaseIcon,
  'analysis-data': ChartNoAxesCombinedIcon,
  'generate-chart': ChartPieIcon,
  'search-web': SearchIcon,
  //
  getWeather: SearchIcon,
};

export function ToolMessagePart({ part }: { message?: UIMessage; part: ToolUIPart }) {
  const [open, setOpen] = useState(false);


  const calling = part.state !== 'output-available' && part.state !== 'output-error';
  const finished = !calling || part.type === 'tool-result';
  const failed = part.state === 'output-error';
  const success = part.state === 'output-available';

  let toolName = part.toolName || part.type.replace('tool-', '');
  let args = part.args;
  let result = part.result;

  console.log('ToolMessagePart: ', part);
  if (toolName === 'generate-chart') {
    return null;
  }

  let ToolIcon = ToolIconMap[toolName] || Wrench;
  if (ToolNameMap[toolName]) {
    toolName = ToolNameMap[toolName];
  }

  const toolMessageTitle = (
    <div
      className={clsx(
        'tool-message-title flex justify-between items-center w-full py-[9px]',
        success && 'text-green-500',
        failed && 'text-red-500',
        !success && !failed && 'text-yellow-500'
      )}
      onClick={() => {
        setOpen(!open);
      }}
    >
      <div className='flex items-center gap-[4px]'>
        {failed && <TriangleAlert className='w-4 h-4' />}
        {calling && <Loader2 className='w-4 h-4 animate-spin' />}
        {success && <ToolIcon className='w-[18px] h-[18px]' />}
        <span className='shrink-0 whitespace-nowrap'>{toolName}</span>
      </div>
    </div>
  );

  // let content = `**输入**\n\`\`\`json\n${JSON.stringify(part.input || '', null, 2)}\n\`\`\``;
  let content = `**输入**\n\`\`\`json\n${JSON.stringify(args || '', null, 2)}\n\`\`\``;

  if (finished) {
    content += `\n**结果**\n\`\`\`json
${JSON.stringify(result || '', null, 2)}
\`\`\``;
    //     content += `\n**结果**\n\`\`\`json
    // ${JSON.stringify(part.output || '', null, 2)}
    // \`\`\``;
  }

  return (
    <div className='tool-part'>
      <div className='tool-call-title'>{toolMessageTitle}</div>
      <MarkdownRender>{content}</MarkdownRender>
    </div>
    // <Collapse
    //   value={open ? ['0'] : []}
    //   className='border border-[#E7E8E9] rounded-[8px] bg-white tool-part'
    //   onChange={(v) => {
    //     setOpen(Array.isArray(v) && v.length > 0);
    //   }}
    // >
    //   <Collapse.Item
    //     code='0'
    //     title={toolMessageTitle}
    //     className='border-1 border-l-0 border-r-0 border-b-0 border-gray-100/90'
    //   >
    //     <div className='tool-message-result overflow-auto'>
    //       {open ? <MarkdownRender>{content}</MarkdownRender> : null}
    //     </div>
    //   </Collapse.Item>
    // </Collapse>
  );
}
