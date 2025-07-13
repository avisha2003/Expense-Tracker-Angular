import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/expense/dashboard/dashboard')
        .then(m => m.Dashboard)
    },
    {
        path: 'expenses',
        loadComponent: () => import('./features/expense/expense-list/expense-list')
        .then(m => m.ExpenseList)
    },
    {
        path: 'expenses/new',
        loadComponent: () => import('./features/expense/expense-form/expense-form')
        .then(m => m.ExpenseForm)
    },

    {
        path: 'expenses/:id/edit',
        loadComponent: () => import('./features/expense/expense-form/expense-form')
        .then(m => m.ExpenseForm)
    }
];
