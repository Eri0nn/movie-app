import { motion } from "framer-motion";

interface LoadingBarProps {
  isLoading: boolean;
}

export function LoadingBar({ isLoading }: LoadingBarProps) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: isLoading ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      style={{ transformOrigin: "0%" }}
      className="fixed top-0 left-0 right-0 h-0.5 bg-primary z-50"
    />
  );
}
