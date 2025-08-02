'use client';
import { useSideBarToggle } from '@/hooks/useSidebarToggle';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function PageWrapper({ children }: { children: ReactNode }) {
  const { toggleCollapse } = useSideBarToggle();
  const bodyStyle = classNames(
    "bg-background flex flex-col  py-4 p-4 h-full w-full"
  );

  return (
    <motion.div
      initial={false}
      animate={{ paddingLeft: toggleCollapse ? "0.0rem" : "0rem" }}
      transition={{ duration: 0.5 }}
      className="transition-all "
    >
      <div className={bodyStyle}>{children}</div>
    </motion.div>
  );
}
