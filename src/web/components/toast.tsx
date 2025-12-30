import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

// Toast 类型定义
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

// 全局状态管理
let toastId = 0;
const toastListeners = new Set<(toasts: ToastItem[]) => void>();
let toastQueue: ToastItem[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toastQueue]));
}

function removeToast(id: string) {
  toastQueue = toastQueue.filter((t) => t.id !== id);
  notifyListeners();
}

// 全局 toast 函数
export const toast = {
  success: (message: string, duration = 3000) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastItem = { id, message, variant: 'success', duration };
    toastQueue.push(newToast);
    notifyListeners();
    return id;
  },

  error: (message: string, duration = 4000) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastItem = { id, message, variant: 'error', duration };
    toastQueue.push(newToast);
    notifyListeners();
    return id;
  },

  warning: (message: string, duration = 3500) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastItem = { id, message, variant: 'warning', duration };
    toastQueue.push(newToast);
    notifyListeners();
    return id;
  },

  info: (message: string, duration = 3000) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastItem = { id, message, variant: 'info', duration };
    toastQueue.push(newToast);
    notifyListeners();
    return id;
  },
};

// Toast 变体样式
const toastVariants = {
  success:
    'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100',
  error:
    'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100',
  warning:
    'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
};

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

// 单个 Toast 组件
interface ToastProps {
  toast: ToastItem;
}

function ToastComponent({ toast: toastItem }: ToastProps) {
  const Icon = iconMap[toastItem.variant];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toastItem.id);
    }, toastItem.duration || 3000);

    return () => clearTimeout(timer);
  }, [toastItem.id, toastItem.duration]);

  return (
    <ToastPrimitives.Root
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
        toastVariants[toastItem.variant]
      )}
    >
      <div className='flex items-center gap-3'>
        <Icon className='h-5 w-5 shrink-0' />
        <ToastPrimitives.Description className='text-sm font-medium'>
          {toastItem.message}
        </ToastPrimitives.Description>
      </div>

      <ToastPrimitives.Close
        className='absolute right-2 top-2 rounded-md p-1 text-current/50 opacity-0 transition-opacity hover:text-current focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100'
        onClick={() => removeToast(toastItem.id)}
      >
        <X className='h-4 w-4' />
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  );
}

// Toast 容器组件
export function ToastContainer() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    toastListeners.add(setToasts);
    return () => {
      toastListeners.delete(setToasts);
    };
  }, []);

  return (
    <ToastPrimitives.Provider swipeDirection='right'>
      {toasts.map((toastItem) => (
        <ToastComponent key={toastItem.id} toast={toastItem} />
      ))}
      <ToastPrimitives.Viewport className='fixed top-0 z-[100] flex max-h-[40px] w-full flex-col-reverse p-1 sm:top-5 sm:right-0 sm:flex-col md:max-w-[180px]' />
    </ToastPrimitives.Provider>
  );
}
