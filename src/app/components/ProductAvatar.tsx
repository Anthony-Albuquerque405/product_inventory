import React from "react";

interface ProductAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const gradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-purple-500 to-fuchsia-600",
  "from-cyan-500 to-blue-600",
];

export default function ProductAvatar({ name, size = "md" }: ProductAvatarProps) {
  // Pegar as iniciais (ex: "Coca Cola" -> "CC")
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  // Escolher o gradiente com base no nome
  const gradientIndex = name.length % gradients.length;
  const gradient = gradients[gradientIndex];

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-xl",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-tr ${gradient} text-white font-bold shadow-sm shadow-black/10 shrink-0 ${sizeClasses[size]}`}
    >
      {initials}
    </div>
  );
}
