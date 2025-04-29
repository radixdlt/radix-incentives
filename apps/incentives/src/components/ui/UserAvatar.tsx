"use client"; // Assuming this will be used in client components

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { UserRound } from "lucide-react";
import { cn } from "~/lib/utils"; // Corrected path assumption

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-[inherit] bg-secondary text-xs",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

interface UserAvatarProps {
  name?: string | null;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  src,
  size = "md", // Default size matches the previous div
  className,
}) => {
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "";
    const parts = name.split(" ") || [];
    if (parts.length >= 2 && parts[0] && parts[1]) {
      // Ensure parts[0] and parts[1] have characters before accessing [0]
      if (parts[0].length > 0 && parts[1].length > 0) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
    }
    // Ensure name has characters before accessing [0]
    return name.length > 0 ? name[0]?.toUpperCase() : "";
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", // Matches the previous div size
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: 14,
    md: 16, // Adjusted icon size for md avatar
    lg: 20,
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src && <AvatarImage src={src} alt={name || "User"} />}
      <AvatarFallback>
        {name ? (
          getInitials(name)
        ) : (
          <UserRound
            size={iconSizes[size]}
            strokeWidth={2}
            className="opacity-60"
            aria-hidden="true"
          />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export { Avatar, AvatarFallback, AvatarImage, UserAvatar };
