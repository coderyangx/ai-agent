import { motion } from 'motion/react';

const LoadingDots = () => {
  return (
    <div className='flex items-center space-x-1'>
      <motion.span
        className='w-1.5 h-1.5 bg-muted-foreground rounded-full'
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0 }}
      />
      <motion.span
        className='w-1.5 h-1.5 bg-muted-foreground rounded-full'
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{
          duration: 0.9,
          delay: 0.3,
          repeat: Infinity,
          repeatDelay: 0,
        }}
      />
      <motion.span
        className='w-1.5 h-1.5 bg-muted-foreground rounded-full'
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{
          duration: 0.9,
          delay: 0.6,
          repeat: Infinity,
          repeatDelay: 0,
        }}
      />
    </div>
  );
};

export default LoadingDots;
