
export type Employee = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Dev' | 'Owner' | 'RH' | 'Manager' | 'Employee';
  departmentId: string;
  status: 'active' | 'inactive';
  startDate: string;
  birthDate?: string;
};

export type Department = {
  id:string;
  name: string;
  leadId: string;
};

export type Role = {
  name: 'Dev' | 'Owner' | 'RH' | 'Manager' | 'Employee';
  permissions: string[];
};

export type LeaveRequest = {
  id: string;
  userId: string; // The ID of the employee requesting leave
  leaveType: 'Vacation' | 'Sick Leave' | 'Personal Day' | 'Unpaid Leave' | 'Day off';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Pending RH Approval' | 'Approved' | 'Rejected' | 'Cancelled' | 'Action Required';
  createdAt: Date;
};

export type Ticket = {
  id: string;
  employee: Employee;
  month: string; // e.g., "July 2024"
  calculation: {
    totalDays: number;
    weekendDays: number;
    publicHolidays: number;
    workableDays: number;
    leaveDaysTaken: number;
    netWorkedDays: number;
    leaveDetails: {
      type: LeaveRequest['leaveType'];
      days: number;
      startDate: string; // "MMM d"
      endDate: string; // "MMM d"
    }[];
  };
};

export type Holiday = {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    isPaid: boolean;
}
