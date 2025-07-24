import { DashboardLayout } from '~/app/dashboard/components/dashboard-layout';
import { LimitAccessWrapper } from '~/components/LimitAccessWrapper';
import { PreviewBlockWrapper } from '~/components/PreviewBlockWrapper';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LimitAccessWrapper>
      <PreviewBlockWrapper>
        <DashboardLayout>{children}</DashboardLayout>
      </PreviewBlockWrapper>
    </LimitAccessWrapper>
  );
}
