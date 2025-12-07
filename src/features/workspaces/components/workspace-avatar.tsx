import Image from "next/image";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface WorkspaceAvatarProps {
  image?: string;
  name: string;
  className?: string;
}

export const WorkspaceAvatar = ({ image, name, className }: WorkspaceAvatarProps) => {
  if (image) {
    let imageUrl = image;
    if (!image.startsWith("http") && !image.startsWith("data:")) {
      imageUrl = `https://f005.backblazeb2.com/file/WorkNest/${image}`;
    }

    return (
      <div className={cn("relative size-10 rounded-md overflow-hidden", className)}>
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <Avatar className={cn("size-10 rounded-md", className)}>
      <AvatarFallback className="text-white bg-blue-600 font-semibold text-lg uppercase rounded-md">
        {name[0]}
      </AvatarFallback>
    </Avatar>
  );
};
