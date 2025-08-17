"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 w-full h-full z-0",
        className
      )}
    >
      <div className="absolute inset-0 h-full w-full bg-isabelline [mask-image:radial-gradient(white,transparent)]" />
    </div>
  );
};
