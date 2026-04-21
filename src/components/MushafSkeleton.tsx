"use client";

import { motion } from "framer-motion";

export default function MushafSkeleton() {
  const rows = [
    "92%", "88%", "95%", "90%", "85%",
    "94%", "89%", "96%", "91%", "87%",
    "93%", "86%", "98%", "89%", "92%"
  ];

  return (
    <div className="w-full h-full grid grid-rows-15 py-2 gap-0 animate-pulse">
      {rows.map((width, i) => (
        <div 
          key={i} 
          className="w-full flex items-center justify-center px-6 lg:px-12"
        >
          <div 
            className="h-3.5 bg-gray-200 rounded-full relative overflow-hidden shadow-sm" 
            style={{ 
              width,
              opacity: 0.7
            }}
          >
            {/* Shimmer Effect */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
