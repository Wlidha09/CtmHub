

export type AppSettings = {
    projectName: string;
    leaveAccumulationAmount: number;
    logoSvgColor?: string;
    logoTextColor?: string;
    primaryColor?: string;
    backgroundColor?: string;
    accentColor?: string;
};

export type Language = "en" | "fr";

export type UserSettings = {
    language?: Language;
}

export type Employee = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatarUrl: string;
  role: string; // Now a string to accommodate custom roles
  departmentId: string;
  status: 'active' | 'inactive';
  startDate: string;
  birthDate?: string;
  leaveBalance?: number;
  userSettings?: UserSettings;
};

export type Department = {
  id:string;
  name: string;
  leadId: string;
};

export type Permission = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

export type PagePermissions = {
  [page: string]: Permission;
};

export type Role = {
  name: string;
  isCore: boolean; // Core roles cannot be deleted
  permissions: PagePermissions;
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
};

export type Availability = {
  id: string;
  userId: string;
  weekStartDate: string; // YYYY-MM-DD format, always a Monday
  selectedDays: string[]; // Array of day names e.g., ["Tuesday", "Wednesday", "Friday"]
};

export type WeeklySchedule = {
  employeeId: string;
  employeeName: string;
  schedule: { [day: string]: boolean }; // e.g., { "Monday": false, "Tuesday": true, ... }
};

export type MeetingRoom = {
  id: string;
  name: string;
  capacity: number;
  amenities: string[]; // e.g., ['Projector', 'Whiteboard']
};

export type Booking = {
  id: string;
  roomId: string;
  userId: string;
  employeeName: string;
  departmentName: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  date: string; // YYYY-MM-DD
};

