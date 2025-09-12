export type Employee = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Admin' | 'Manager' | 'Employee';
  departmentId: string;
};

export type Department = {
  id: string;
  name: string;
  leadId: string;
};

export type Role = {
  name: 'Admin' | 'Manager' | 'Employee';
  permissions: string[];
};
