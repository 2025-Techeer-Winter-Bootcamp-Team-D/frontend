import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  containerClassName?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  containerClassName,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const springConfig = { stiffness: 100, damping: 12 };

  const x = useMotionValue(0);
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-15, 15]),
    springConfig,
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-25, 25]),
    springConfig,
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const mouseX = event.clientX - rect.left;
    const xValue = mouseX - width / 2;
    x.set(xValue);
  };

  return (
    <div
      className={`relative inline-block ${containerClassName || ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 15,
              },
            }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            style={{
              translateX: translateX,
              rotate: rotate,
            }}
            className="absolute -top-2 left-1/2 z-50 -translate-x-1/2 -translate-y-full"
          >
            <div className="relative">
              {/* 말풍선 꼬리 */}
              <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700" />

              {/* 툴팁 콘텐츠 */}
              <div className="relative min-w-[200px] max-w-[280px] rounded-xl bg-white dark:bg-slate-800 p-4 shadow-xl border border-slate-200 dark:border-slate-700">
                {typeof content === "string" ? (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {content}
                  </p>
                ) : (
                  content
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 트리거 요소 */}
      <span className="relative inline-block">
        {children}
        {/* 밑줄 애니메이션 */}
        <motion.span
          className="absolute bottom-0 left-0 h-[2px] bg-blue-500 dark:bg-blue-400"
          initial={{ width: 0 }}
          animate={{ width: isHovered ? "100%" : 0 }}
          transition={{ duration: 0.2 }}
        />
      </span>
    </div>
  );
};

// 프로필 카드 형태의 툴팁
interface ProfileTooltipProps {
  children: React.ReactNode;
  name: string;
  description: string;
  imageUrl?: string;
  containerClassName?: string;
}

export const ProfileTooltip: React.FC<ProfileTooltipProps> = ({
  children,
  name,
  description,
  imageUrl,
  containerClassName,
}) => {
  return (
    <Tooltip
      containerClassName={containerClassName}
      content={
        <div className="flex flex-col">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={name}
              className="aspect-square w-full rounded-lg object-cover mb-3"
            />
          )}
          <p className="text-base font-bold text-slate-800 dark:text-slate-100">
            {name}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

// 인용문 형태의 툴팁
interface QuoteTooltipProps {
  children: React.ReactNode;
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
  containerClassName?: string;
}

export const QuoteTooltip: React.FC<QuoteTooltipProps> = ({
  children,
  quote,
  author,
  role,
  avatarUrl,
  containerClassName,
}) => {
  return (
    <Tooltip
      containerClassName={containerClassName}
      content={
        <div>
          <blockquote className="mb-3 text-sm text-slate-700 dark:text-slate-300 italic">
            "{quote}"
          </blockquote>
          <div className="flex items-center gap-2">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt={author}
                className="h-6 w-6 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                {author}
              </p>
              {role && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {role}
                </p>
              )}
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

export default Tooltip;
