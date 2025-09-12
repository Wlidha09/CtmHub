import type { Employee, Department, Role } from '@/lib/types';

export const departments: Omit<Department, 'leadId'>[] = [
  { id: 'd1', name: 'Engineering' },
  { id: 'd2', name: 'Human Resources' },
  { id: 'd3', name: 'Design' },
  { id: 'd4', name: 'Sales' },
];

export const employees: Employee[] = [
  { id: 'e1', name: 'Olivia Martinez', email: 'olivia.martinez@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar1/100/100', role: 'Manager', departmentId: 'd1' },
  { id: 'e2', name: 'Benjamin Carter', email: 'benjamin.carter@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar2/100/100', role: 'Employee', departmentId: 'd1' },
  { id: 'e3', name: 'Sophia Nguyen', email: 'sophia.nguyen@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar3/100/100', role: 'Employee', departmentId: 'd1' },
  { id: 'e4', name: 'Liam Rodriguez', email: 'liam.rodriguez@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar4/100/100', role: 'Manager', departmentId: 'd2' },
  { id: 'e5', name: 'Ava Johnson', email: 'ava.johnson@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar5/100/100', role: 'RH', departmentId: 'd2' },
  { id: 'e6', name: 'Noah Williams', email: 'noah.williams@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar6/100/100', role: 'Manager', departmentId: 'd3' },
  { id: 'e7', name: 'Isabella Brown', email: 'isabella.brown@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar7/100/100', role: 'Employee', departmentId: 'd3' },
  { id: 'e8', name: 'Mason Jones', email: 'mason.jones@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar8/100/100', role: 'Manager', departmentId: 'd4' },
  { id: 'e9', name: 'Harper Garcia', email: 'harper.garcia@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar9/100/100', role: 'Employee', departmentId: 'd4' },
  { id: 'e10', name: 'Ethan Miller', email: 'ethan.miller@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar10/100/100', role: 'Employee', departmentId: 'd4' },
  { id: 'e11', name: 'Dev User', email: 'dev@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar11/100/100', role: 'Dev', departmentId: 'd1' },
  { id: 'e12', name: 'Owner User', email: 'owner@loophub.com', avatarUrl: 'https://picsum.photos/seed/avatar12/100/100', role: 'Owner', departmentId: 'd1' },
];

export const departmentData: Department[] = [
    { id: 'd1', name: 'Engineering', leadId: 'e1' },
    { id: 'd2', name: 'Human Resources', leadId: 'e4' },
    { id: 'd3', name: 'Design', leadId: 'e6' },
    { id: 'd4', name: 'Sales', leadId: 'e8' },
];

export const roles: Role[] = [
  {
    name: 'Dev',
    permissions: ['Full access'],
  },
  {
    name: 'Owner',
    permissions: ['Full access, except submit leaves page and Dev role'],
  },
  {
    name: 'RH',
    permissions: ['Full access'],
  },
  {
    name: 'Manager',
    permissions: [
      'Employees page',
      'Candidates page',
      'Send leave requests page',
    ],
  },
  {
    name: 'Employee',
    permissions: ['Submit leave page', 'Leaves request pages (except Dev & Owner)'],
  },
];

export async function getEmployeeById(id: string): Promise<Employee | undefined> {
    // In a real app, this would fetch from a database.
    return employees.find(e => e.id === id);
};
export const getDepartmentById = (id: string) => departmentData.find(d => d.id === id);
export const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown';
