'use client';

import {
  Crown,
  Edit,
  MoreHorizontalIcon,
  TimerResetIcon,
  Trash,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

const Dialog = ({
  onConfirm,
  title,
  description,
  actionText,
}: {
  onConfirm: () => void;
  title: string;
  description: string;
  actionText: string;
}) => (
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{title}</AlertDialogTitle>
      <AlertDialogDescription>{description}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={onConfirm}>{actionText}</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
);

export const CompetitionActions = ({
  onEdit,
  onDrawWinners,
  onDelete,
  onExpireParticipants,
}: {
  onEdit: () => void;
  onDrawWinners: () => void;
  onDelete: () => void;
  onExpireParticipants: () => void;
}) => {
  return (
    <ButtonGroup>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More Options">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onEdit}>
              <Edit />
              Edit
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Crown />
                  Draw winners
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <Dialog
                onConfirm={onDrawWinners}
                title="Draw Winners"
                description="Are you sure you want to draw winners for this competition?"
                actionText="Draw winners"
              />
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <TimerResetIcon />
                  Expire participants
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </AlertDialog>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <Dialog
                onConfirm={onDelete}
                title="Delete Competition"
                description="Are you sure you want to delete this competition? This action cannot be undone."
                actionText="Delete"
              />
            </AlertDialog>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
};
