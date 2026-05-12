import { getStats, getEntriesOverTime, getThisWeekStats, getCategoryWithStatus, getRecentActivity } from '@/lib/data';
import KPICard from '@/components/widgets/KPICard';
import ApprovalGauge from '@/components/widgets/ApprovalGauge';
import WeekStats from '@/components/widgets/WeekStats';
import CategoryBreakdown from '@/components/widgets/CategoryBreakdown';
import ActivityFeed from '@/components/widgets/ActivityFeed';
import EntriesLineChart from '@/components/charts/EntriesLineChart';
import Card from '@/components/ui/Card';
import { FileText, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const stats = getStats();
  const entriesOverTime = getEntriesOverTime();
  const weekStats = getThisWeekStats();
  const categoryData = getCategoryWithStatus();
  const recentActivity = getRecentActivity(8);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Entries" value={stats.total} icon={<FileText size={18}/>} iconBg="bg-[#2563eb]" />
        <KPICard title="Pending Approval" value={stats.pending} icon={<Clock size={18}/>} iconBg="bg-orange-500" />
        <KPICard title="Approved" value={stats.approved} icon={<CheckCircle size={18}/>} iconBg="bg-green-500" />
        <KPICard title="Approval Rate" value={`${stats.approvalRate}%`} delta="+3.2%" deltaType="up" icon={<TrendingUp size={18}/>} iconBg="bg-purple-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Entries Over Time — Jan to May 2026">
          <EntriesLineChart data={entriesOverTime} />
        </Card>
        <div className="space-y-4">
          <Card title="Approval Rate">
            <ApprovalGauge rate={stats.approvalRate} approvedCount={stats.approved} pendingCount={stats.pending} />
          </Card>
          <Card title="This Week">
            <WeekStats stats={weekStats} />
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Category Breakdown">
          <CategoryBreakdown data={categoryData} />
        </Card>
        <Card className="lg:col-span-2" title="Recent Activity">
          <ActivityFeed entries={recentActivity} />
        </Card>
      </div>
    </div>
  );
}
