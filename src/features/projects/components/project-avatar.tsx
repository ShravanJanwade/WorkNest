import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageIcon } from "lucide-react";

interface ProjectAvatarProps {
  image?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const ProjectAvatar = ({
  image,
  name,
  className,
  fallbackClassName,
}: ProjectAvatarProps) => {
  const isExternal = typeof image === "string" && /^https?:\/\//i.test(image);

  // fallback avatar if no image provided
  if (!image) {
    return (
      <Avatar className={cn("size-5 rounded-md", className)}>
        <AvatarFallback
          className={cn(
            "text-white bg-blue-600 font-semibold text-sm uppercase rounded-md",
            fallbackClassName
          )}
        >
          {name?.[0] || <ImageIcon className="w-3 h-3" />}
        </AvatarFallback>
      </Avatar>
    );
  }

  try {
    return (
      <div
        className={cn(
          "relative size-5 rounded-md overflow-hidden bg-neutral-100 border",
          className
        )}
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes="20px"
          className="object-cover"
          unoptimized={isExternal} // optional: skip optimization for external URLs
        />
      </div>
    );
  } catch {
    // fallback in case next/image fails for a new host
    return (
      <div
        className={cn(
          "relative size-5 rounded-md overflow-hidden bg-neutral-100 border",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      </div>
    );
  }
};
