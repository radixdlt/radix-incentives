import { Trophy } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

type ClaimPrizeCardProps = {
  isWinner: boolean;
  hasClaimed: boolean;
};

export const ClaimPrizeCard: FC<ClaimPrizeCardProps> = ({
  isWinner,
  hasClaimed,
}) => {
  if (!isWinner)
    return (
      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            You did not win this competition
          </CardTitle>
          <CardDescription>Better luck next time!</CardDescription>
        </CardHeader>
      </Card>
    );
  return (
    <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Congratulations! You Won!
        </CardTitle>
        <CardDescription>
          {hasClaimed
            ? 'Your prize has been claimed. Your Arculus card will be shipped soon!'
            : 'You are one of the winners! Claim your Arculus card now.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasClaimed && (
          <Button
            type="button"
            asChild
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Link href="/dashboard/competitions/arculus/claim-price">
              Claim Your Prize
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
