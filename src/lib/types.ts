export type Employee = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Dev' | 'Owner' | 'RH' | 'Manager' | 'Employee';
  departmentId: string;
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
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
};
