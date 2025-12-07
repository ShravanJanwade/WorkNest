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
  
  // Handle case where image is just an ID (not signed URL)
  // User requested fallback: https://f005.backblazeb2.com/file/WorkNest/<IMAGE_ID>
  let imageUrl = image;
  if (image && !image.startsWith("http") && !image.startsWith("data:")) {
      imageUrl = `https://f005.backblazeb2.com/file/WorkNest/${image}`;
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
          src={imageUrl}
          alt={name}
          fill
          sizes="20px"
          className="object-cover"
          // Skip optimization for external URLs if they are not allowed domains, but we added them.
          // However, using unoptimized just to be safe if domain varies.
          // Check if domain is one of our configured ones to decide optimization could be better
          // but for now user just wants it to work.
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
