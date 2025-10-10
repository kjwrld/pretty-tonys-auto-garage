"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      offset="80px"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "border-2 border-black shadow-none uppercase tracking-wider text-xs",
          success: "bg-white text-black border-red-500",
          info: "bg-white text-black",
          error: "bg-red-500 text-white border-red-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
