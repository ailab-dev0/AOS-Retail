export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type Category = 'Face to Face class' | 'Online class' | 'Mentoring' | 'Other academic work';
export interface Entry {
  trackingID: string; SPOC_name: string; category: Category;
  subCategory: string; subject: string; date: string;
  createdDate: string; totalHours: string; approvalStatus: ApprovalStatus;
}
export interface FilterState { search: string; category: string; status: string; }
export interface MonthStats { month: string; count: number; approved: number; pending: number; rejected: number; }
export interface DashboardStats { total: number; pending: number; approved: number; rejected: number; approvalRate: number; }
export interface WeekStatsData { entries: number; approved: number; pending: number; hours: number; faculty: number; }
