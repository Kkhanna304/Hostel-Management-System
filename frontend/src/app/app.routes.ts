import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login)
  },
  {
    path: 'register',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/register/register').then((m) => m.Register)
  },
  {
    path: 'rooms',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/rooms/rooms').then((m) => m.Rooms)
  },
  {
    path: 'payments',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/payments/payments').then((m) => m.Payments)
  },
  {
    path: 'admin-students',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin-students/admin-students').then((m) => m.AdminStudents)
  },
  {
    path: 'admin-leaves',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin-leaves/admin-leaves').then((m) => m.AdminLeaves)
  },
  {
    path: 'admin-complaints',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin-complaints/admin-complaints').then((m) => m.AdminComplaints)
  },
  {
    path: 'admin-visitors',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin-visitors/admin-visitors').then((m) => m.AdminVisitors)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile)
  },
  {
    path: 'student-fees',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/student-fees/student-fees').then((m) => m.StudentFees)
  },
  {
    path: 'leaves',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/leaves/leaves').then((m) => m.Leaves)
  },
  {
    path: 'complaints',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/complaints/complaints').then((m) => m.Complaints)
  },
  {
    path: 'visitors',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/visitors/visitors').then((m) => m.Visitors)
  },
  {
    path: 'help',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/help/help').then((m) => m.Help)
  },
  {
    path: 'contact',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard)
  }
];
