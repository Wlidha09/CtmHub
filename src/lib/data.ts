
import type { Employee, Department, Role, PagePermissions } from '@/lib/types';

export const appPages = [
  'Dashboard',
  'Employees',
  'My Profile',
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
  'Settings',
  'Translator'
];


export const initialRoles: Role[] = [
  {
    name: 'Dev',
    isCore: true,
    permissions: appPages.reduce((acc, page) => {
      acc[page] = { view: true, create: true, edit: true, delete: true };
      return acc;
    }, {} as PagePermissions),
  },
  {
    name: 'Owner',
    isCore: true,
    permissions: appPages.reduce((acc, page) => {
      acc[page] = { view: true, create: true, edit: true, delete: true };
      return acc;
    }, {} as PagePermissions),
  },
  {
    name: 'RH',
    isCore: true,
    permissions: appPages.reduce((acc, page) => {
      const allPermissions = { view: true, create: true, edit: true, delete: true };
      if (page === 'Roles') {
        acc[page] = { view: true, create: false, edit: false, delete: false };
      } else {
        acc[page] = allPermissions;
      }
      return acc;
    }, {} as PagePermissions),
  },
  {
    name: 'Manager',
    isCore: true,
    permissions: appPages.reduce((acc, page) => {
      const noPermissions = { view: false, create: false, edit: false, delete: false };
      acc[page] = noPermissions;

      if (['Dashboard', 'My Profile', 'Availability', 'Leave Request'].includes(page)) {
        acc[page] = { view: true, create: true, edit: true, delete: false };
      }
      if (page === 'Holidays' || page === 'Candidates' || page === 'Tickets') {
        acc[page] = { view: true, create: false, edit: false, delete: false };
      }
      if (page === 'Book a Room' || page === 'Manage Rooms') {
        acc[page] = { view: true, create: true, edit: true, delete: true };
      }
      if (page === 'Settings') {
        acc[page] = { view: true, create: false, edit: false, delete: false };
      }
      return acc;
    }, {} as PagePermissions),
  },
  {
    name: 'Employee',
    isCore: true,
    permissions: appPages.reduce((acc, page) => {
      const noPermissions = { view: false, create: false, edit: false, delete: false };
      acc[page] = noPermissions;

      if (['Dashboard', 'My Profile', 'Availability', 'Leave Request'].includes(page)) {
        acc[page] = { view: true, create: true, edit: true, delete: false };
      }
       if (page === 'Book a Room' || page === 'Manage Rooms') {
        acc[page] = { view: true, create: true, edit: true, delete: true };
      }
       if (page === 'Settings') {
        acc[page] = { view: false, create: false, edit: false, delete: false };
      }
      return acc;
    }, {} as PagePermissions),
  },
];
