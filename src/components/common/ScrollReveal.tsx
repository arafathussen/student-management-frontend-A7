"use client";

import React, { ReactNode } from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  once?: boolean;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.55,
  yOffset = 32,
  direction = "up",
  once = true,
  ...rest
}: ScrollRevealProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: yOffset };
      case "down":
        return { opacity: 0, y: -yOffset };
      case "left":
        return { opacity: 0, x: yOffset };
      case "right":
        return { opacity: 0, x: -yOffset };
      case "none":
        return { opacity: 0 };
      default:
        return { opacity: 0, y: yOffset };
    }
  };

  const getTargetPosition = () => {
    switch (direction) {
      case "up":
      case "down":
        return { opacity: 1, y: 0 };
      case "left":
      case "right":
        return { opacity: 1, x: 0 };
      case "none":
        return { opacity: 1 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={getTargetPosition()}
      viewport={{ once, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Apple / Linear style smooth ease-out
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Container for automatically staggering lists of cards or items
export function ScrollRevealGroup({
  children,
  className = "",
  staggerDelay = 0.1,
  once = true,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
} & HTMLMotionProps<"div">) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({
  children,
  className = "",
  yOffset = 28,
  duration = 0.5,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  yOffset?: number;
  duration?: number;
} & HTMLMotionProps<"div">) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} {...rest}>
      {children}
    </motion.div>
  );
}
