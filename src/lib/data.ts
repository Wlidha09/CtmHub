

import type { Employee, Department, Role, PagePermissions } from '@/lib/types';

export const departments: Omit<Department, 'leadId'>[] = [
  { id: 'd1', name: 'Engineering' },
  { id: 'd2', name: 'Human Resources' },
  { id: 'd3', name: 'Design' },
  { id: 'd4', name: 'Sales' },
];

export const employees: Employee[] = [
  { id: 'e1', name: 'Olivia Martinez', email: 'olivia.martinez@loophub.com', phoneNumber: '+1-202-555-0196', avatarUrl: 'https://picsum.photos/seed/avatar1/100/100', role: 'Manager', departmentId: 'd1', status: 'active', startDate: '2022-01-15' },
  { id: 'e2', name: 'Benjamin Carter', email: 'benjamin.carter@loophub.com', phoneNumber: '+1-202-555-0164', avatarUrl: 'https://picsum.photos/seed/avatar2/100/100', role: 'Employee', departmentId: 'd1', status: 'active', startDate: '2022-03-01' },
  { id: 'e3', name: 'Sophia Nguyen', email: 'sophia.nguyen@loophub.com', phoneNumber: '+1-202-555-0118', avatarUrl: 'https://picsum.photos/seed/avatar3/100/100', role: 'Employee', departmentId: 'd1', status: 'active', startDate: '2023-05-20' },
  { id: 'e4', name: 'Liam Rodriguez', email: 'liam.rodriguez@loophub.com', phoneNumber: '+1-202-555-0153', avatarUrl: 'https://picsum.photos/seed/avatar4/100/100', role: 'Manager', departmentId: 'd2', status: 'active', startDate: '2021-08-10' },
  { id: 'e5', name: 'Ava Johnson', email: 'ava.johnson@loophub.com', phoneNumber: '+1-202-555-0142', avatarUrl: 'https://picsum.photos/seed/avatar5/100/100', role: 'RH', departmentId: 'd2', status: 'active', startDate: '2021-09-01' },
  { id: 'e6', name: 'Noah Williams', email: 'noah.williams@loophub.com', phoneNumber: '+1-202-555-0187', avatarUrl: 'https://picsum.photos/seed/avatar6/100/100', role: 'Manager', departmentId: 'd3', status: 'active', startDate: '2022-02-28' },
  { id: 'e7', name: 'Isabella Brown', email: 'isabella.brown@loophub.com', phoneNumber: '+1-202-555-0131', avatarUrl: 'https://picsum.photos/seed/avatar7/100/100', role: 'Employee', departmentId: 'd3', status: 'inactive', startDate: '2023-11-01' },
  { id: 'e8', name: 'Mason Jones', email: 'mason.jones@loophub.com', phoneNumber: '+1-202-555-0169', avatarUrl: 'https://picsum.photos/seed/avatar8/100/100', role: 'Manager', departmentId: 'd4', status: 'active', startDate: '2020-12-05' },
  { id: 'e9', name: 'Harper Garcia', email: 'harper.garcia@loophub.com', phoneNumber: '+1-202-555-0125', avatarUrl: 'https://picsum.photos/seed/avatar9/100/100', role: 'Employee', departmentId: 'd4', status: 'active', startDate: '2023-02-15' },
  { id: 'e10', name: 'Ethan Miller', email: 'ethan.miller@loophub.com', phoneNumber: '+1-202-555-0158', avatarUrl: 'https://picsum.photos/seed/avatar10/100/100', role: 'Employee', departmentId: 'd4', status: 'active', startDate: '2023-07-22' },
  { id: 'e11', name: 'Dev User', email: 'dev@loophub.com', phoneNumber: '+1-202-555-0100', avatarUrl: 'https://picsum.photos/seed/avatar11/100/100', role: 'Dev', departmentId: 'd1', status: 'active', startDate: '2020-01-01' },
  { id: 'e12', name: 'Owner User', email: 'owner@loophub.com', phoneNumber: '+1-202-555-0101', avatarUrl: 'https://picsum.photos/seed/avatar12/100/100', role: 'Owner', departmentId: 'd1', status: 'active', startDate: '2020-01-01' },
];

export const departmentData: Department[] = [
    { id: 'd1', name: 'Engineering', leadId: 'e1' },
    { id: 'd2', name: 'Human Resources', leadId: 'e4' },
    { id: 'd3', name: 'Design', leadId: 'e6' },
    { id: 'd4', name: 'Sales', leadId: 'e8' },
];

export const appPages = [
  'Dashboard',
  'Employees',
  'Departments',
  'Availability',
  'Roles',
  'Leave Request',
  'Manage Leave',
  'Holidays',
  'Candidates',
  'Tickets',
  'Book a Room',
  'Manage Rooms',
];


export const initialRoles: Role[] = [
  {
    name: 'Dev',
    isCore: true,
    permissions: appPages.reduce((acc, page) => {
      acc[page] = { view: true, create: true, edit: true, delete: true };
      return acc;
    }, {} as { [key: string]: any }),
  },
  {
    name: 'Owner',
    isCore: true,
    permissions: appPages.reduce((acc, page) => {
      acc[page] = { view: true, create: true, edit: true, delete: true };
      return acc;
    }, {} as { [key: string]: any }),
  },
  {
    name: 'RH',
    isCore: true,
    permissions: appPages.reduce((acc, page) => {
      acc[page] = { view: true, create: true, edit: true, delete: true };
      if (page === 'Roles') {
        acc[page] = { view: true, create: false, edit: false, delete: false };
      }
      return acc;
    }, {} as { [key: string]: any }),
  },
  {
    name: 'Manager',
    isCore: true,
    permissions: appPages.reduce((acc, page) => {
      acc[page] = { view: false, create: false, edit: false, delete: false };
      if (['Dashboard', 'Employees', 'Availability', 'Leave Request', 'Holidays', 'Candidates', 'Tickets'].includes(page)) {
        acc[page] = { view: true, create: true, edit: true, delete: false };
      }
       if (page === 'Dashboard') {
        acc[page] = { view: true, create: false, edit: false, delete: false };
      }
      if (page === 'Book a Room') {
        acc[page] = { view: true, create: true, edit: true, delete: true };
      }
       if (page === 'Manage Rooms') {
        acc[page] = { view: true, create: true, edit: true, delete: true };
      }
      return acc;
    }, {} as { [key:string]: any }),
  },
  {
    name: 'Employee',
    isCore: true,
    permissions: appPages.reduce((acc, page) => {
      acc[page] = { view: false, create: false, edit: false, delete: false };
      if (['Dashboard', 'Availability', 'Leave Request'].includes(page)) {
        acc[page] = { view: true, create: true, edit: false, delete: false };
      }
      if (page === 'Dashboard') {
        acc[page] = { view: true, create: false, edit: false, delete: false };
      }
      if (page === 'Book a Room') {
        acc[page] = { view: true, create: true, edit: true, delete: true };
      }
      if (page === 'Manage Rooms') {
        acc[page] = { view: true, create: true, edit: true, delete: true };
      }
      return acc;
    }, {} as { [key: string]: any }),
  },
];


export async function getEmployeeById(id: string): Promise<Employee | undefined> {
    return employees.find(e => e.id === id);
};
export const getDepartmentById = (id: string) => departmentData.find(d => d.id === id);
export const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown';
