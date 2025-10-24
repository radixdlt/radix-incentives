import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export function AccountRecoverySuccess({ onClick }: { onClick: () => void }) {
  return (
    <Card className="mx-auto w-fit text-center">
      <CardHeader>
        <CardTitle>Account Recovery Success 🎉</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Your account has been recovered successfully.</p>
        <p className="mb-4">
          Login to continue to your dashboard and continue earning rewards.
        </p>
        <Button onClick={onClick}>Go to Dashboard</Button>
      </CardContent>
    </Card>
  );
}
