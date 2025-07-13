import { ChartModule } from 'primeng/chart';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ExpenseService } from '../../../core/services/expense.service';
import { Expense, ExpenseCategory, PaymentMethod } from '../../../core/models/expense.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MonthlyWiseAmount } from '../../../core/models/monthly-wise-amount.model';
import { CardModule } from 'primeng/card';
import { PaymentMethodWiseAmount } from '../../../core/models/payment-method-wise-amount.model';
import { CategoryWiseAmount } from '../../../core/models/category-wise-amount.model';


@Component({
  selector: 'app-dashboard',
  imports: [ChartModule, ToastModule, CardModule, DatePipe],
  providers: [MessageService],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})

export class Dashboard implements OnInit {

  private expenseService = inject(ExpenseService);
  private messageService = inject(MessageService);

    basicData: any;
    basicOptions: any;
    platformId = inject(PLATFORM_ID);
    currentDateTime = new Date();

    data: any;
  options: any;
   dataPolarArea: any;
  optionsPolarArea: any;


    constructor(private cd: ChangeDetectorRef) {}

     months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  paymentMethods = Object.values(PaymentMethod);
  categories = Object.values(ExpenseCategory);

    ngOnInit() {
      this.loadExpenses();
    }

    private loadExpenses(){
      this.expenseService.getExpenses().subscribe({
      next: (expenses) => {
        
          const monthlyTotal = this.calculateMonthlyExpenses(expenses);
          this.initBarChart(monthlyTotal);
          const paymentMethodWiseAmount =
          this.calculatePaymentMethodWiseAmount(expenses);
          this.initDoughnutChart(paymentMethodWiseAmount);
          const categoryWiseAmount = this.calculateCategoryWiseAmount(expenses);
          this.initPolarAreaChart(categoryWiseAmount);

        
      },
      error: (error) => {
        console.error('Error fetching expenses:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load expenses.',
        });
      },
    });
    }

     private calculateMonthlyExpenses(expenses: Expense[]): MonthlyWiseAmount[] {
    const monthlyTotal = this.months.map((month) => ({
      month,
      total: 0,
    }));

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const monthIndex = expenseDate.getMonth();
      if (this.currentDateTime.getFullYear() === expenseDate.getFullYear()) {
        monthlyTotal[monthIndex].total += expense.amount;
      }
    });
    return monthlyTotal.map((item) => ({
      month: item.month,
      totalAmount: item.total,
    }));
  }



    initBarChart(monthlyTotal: MonthlyWiseAmount[]) {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
            const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

            this.basicData = {
                labels: this.months,
                datasets: [
                    {
                        label: 'Expenses',
                        data: monthlyTotal.map((item) => item.totalAmount),
                        backgroundColor: [
                            'rgba(249, 115, 22, 0.2)',
                            'rgba(6, 182, 212, 0.2)',
                            'rgb(107, 114, 128, 0.2)',
                            'rgba(139, 92, 246, 0.2)',
                            'rgba(249, 115, 22, 0.2)',
                            'rgba(6, 182, 212, 0.2)',
                            'rgb(107, 114, 128, 0.2)',
                            'rgba(139, 92, 246, 0.2)',
                            'rgba(249, 115, 22, 0.2)',
                            'rgba(6, 182, 212, 0.2)',
                            'rgb(107, 114, 128, 0.2)',
                            'rgba(139, 92, 246, 0.2)',
                        ],
                        borderColor: ['rgb(249, 115, 22)',
                           'rgb(6, 182, 212)', 
                           'rgb(107, 114, 128)',
                            'rgb(139, 92, 246)',
                            'rgb(249, 115, 22)',
                           'rgb(6, 182, 212)', 
                           'rgb(107, 114, 128)',
                            'rgb(139, 92, 246)',
                            'rgb(249, 115, 22)',
                           'rgb(6, 182, 212)', 
                           'rgb(107, 114, 128)',
                            'rgb(139, 92, 246)',
                          ],
                        borderWidth: 1,
                    },
                ],
            };

            this.basicOptions = {
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary,
                        },
                        grid: {
                            color: surfaceBorder,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColorSecondary,
                        },
                        grid: {
                            color: surfaceBorder,
                        },
                    },
                },
            };
            this.cd.markForCheck()
        }
    }

     private calculatePaymentMethodWiseAmount(
    expenses: any[]
  ): PaymentMethodWiseAmount[] {
    const paymentMethodWiseAmount = this.paymentMethods.map((method) => ({
      paymentMethod: method,
      totalAmount: 0,
    }));
    expenses.forEach((expense) => {
      const paymentMethodIndex = paymentMethodWiseAmount.findIndex(
        (item) => item.paymentMethod === expense.paymentMethod.name
      );
      if (
        paymentMethodIndex !== -1 &&
        new Date(expense.date).getFullYear() ==
          this.currentDateTime.getFullYear()
      ) {
        paymentMethodWiseAmount[paymentMethodIndex].totalAmount +=
          expense.amount;
      }
    });
    return paymentMethodWiseAmount;
  }

    private calculateCategoryWiseAmount(expenses: any[]): CategoryWiseAmount[] {
    const categoryWiseAmount = this.categories.map((category) => ({
      category: category,
      totalAmount: 0,
    }));
    expenses.forEach((expense) => {
      const categoryIndex = categoryWiseAmount.findIndex(
        (item) => item.category === expense.category.name
      );
      if (
        categoryIndex !== -1 &&
        new Date(expense.date).getFullYear() ==
          this.currentDateTime.getFullYear()
      ) {
        categoryWiseAmount[categoryIndex].totalAmount += expense.amount;
      }
    });
    return categoryWiseAmount;
  }



    initDoughnutChart(paymentMethodWiseAmount: PaymentMethodWiseAmount[]) {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');

      this.data = {
        labels: paymentMethodWiseAmount.map((item) => item.paymentMethod),
        datasets: [
          {
            data: paymentMethodWiseAmount.map((item) => item.totalAmount),
            backgroundColor: [
              documentStyle.getPropertyValue('--p-cyan-500'),
              documentStyle.getPropertyValue('--p-orange-500'),
              documentStyle.getPropertyValue('--p-gray-500'),
              documentStyle.getPropertyValue('--p-red-500'),
              documentStyle.getPropertyValue('--p-green-500'),
              documentStyle.getPropertyValue('--p-indigo-500'),
            ],
            hoverBackgroundColor: [
              documentStyle.getPropertyValue('--p-cyan-400'),
              documentStyle.getPropertyValue('--p-orange-400'),
              documentStyle.getPropertyValue('--p-gray-400'),
              documentStyle.getPropertyValue('--p-red-400'),
              documentStyle.getPropertyValue('--p-green-400'),
              documentStyle.getPropertyValue('--p-indigo-400'),
            ],
          },
        ],
      };

      this.options = {
        cutout: '60%',
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  initPolarAreaChart(categoryWiseAmount: CategoryWiseAmount[]) {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color'
      );

      this.dataPolarArea = {
        datasets: [
          {
            data: categoryWiseAmount.map((item) => item.totalAmount),
            backgroundColor: [
              documentStyle.getPropertyValue('--p-pink-500'),
              documentStyle.getPropertyValue('--p-gray-500'),
              documentStyle.getPropertyValue('--p-orange-500'),
              documentStyle.getPropertyValue('--p-purple-500'),
              documentStyle.getPropertyValue('--p-cyan-500'),
              documentStyle.getPropertyValue('--p-red-500'),
              documentStyle.getPropertyValue('--p-green-500'),
            ],
            label: 'My Expenses',
          },
        ],
        labels: categoryWiseAmount.map((item) => item.category),
      };

      this.optionsPolarArea = {
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          r: {
            grid: {
              color: surfaceBorder,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }


}
