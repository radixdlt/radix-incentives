import { DashboardLayout } from '~/app/dashboard/components/dashboard-layout';
import { PreviewBlockWrapper } from '~/components/PreviewBlockWrapper';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PreviewBlockWrapper>
      <DashboardLayout>{children}</DashboardLayout>
    </PreviewBlockWrapper>
  );
}
