export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export type Entry = {
  id?: number;
  trackingID: string;
  SPOC_name: string;
  subject: string | null;
  category: string | null;
  subCategory: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  totalHours: string | null;
  studentName: string | null;
  details: string | null;
  createdDate: string | null;
  updatedDate: string | null;
  approvalStatus: ApprovalStatus | string;
  comment: string | null;
  uploadedFileName: string | null;
  approvedBy: string | null;
  ecode: string | null;
};

export type DashboardStats = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  approvalRate: number;
};

export type MonthStats = {
  month: string;
  count: number;
  approved: number;
  pending: number;
  rejected: number;
};

export type WeekStatsData = {
  entries: number;
  approved: number;
  pending: number;
  hours: number;
  faculty: number;
};

export type FilterState = {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export type EntriesResponse = {
  data: Entry[];
  total: number;
  page: number;
  limit: number;
};
