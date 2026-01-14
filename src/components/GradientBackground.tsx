"use client";

interface GradientBackgroundProps {
  id: string;
}

// Generate a consistent gradient based on the item id
function generateGradient(id: string): string {
  // Simple hash function to get numbers from string
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  // Generate hue values from hash
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40 + Math.abs((hash >> 8) % 60)) % 360;

  // Create gradient with good saturation and medium lightness for readability
  const color1 = `hsl(${hue1}, 70%, 35%)`;
  const color2 = `hsl(${hue2}, 65%, 25%)`;

  // Randomize angle based on hash
  const angle = Math.abs((hash >> 4) % 180);

  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
}

export function GradientBackground({ id }: GradientBackgroundProps) {
  const gradient = generateGradient(id);

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{ background: gradient }}
    />
  );
}
