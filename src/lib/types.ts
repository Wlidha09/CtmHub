export type Employee = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Dev' | 'Owner' | 'RH' | 'Manager' | 'Employee';
  departmentId: string;
};

export type Department = {
  id: string;
  name: string;
  leadId: string;
};

export type Role = {
  name: 'Dev' | 'Owner' | 'RH' | 'Manager' | 'Employee';
  permissions: string[];
};
