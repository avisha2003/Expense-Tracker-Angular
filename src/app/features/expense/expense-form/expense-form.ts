import { Component, inject, OnInit, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExpenseService } from '../../../core/models/services/expense.service';
import { MessageService } from 'primeng/api';
import {
  Expense,
  ExpenseCategory,
  PaymentMethod,
} from '../../../core/models/expense.model';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CardModule,
    ReactiveFormsModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    InputTextModule,
    ChipModule,
    TextareaModule,
    CommonModule,
    ButtonModule,
    RouterLink,
    ToastModule,
  ],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.css',
  providers: [MessageService],
})
export class ExpenseForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private expenseService = inject(ExpenseService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  isEditMode = signal(false);
  id = signal<string | null>(null);
  expenseForm!: FormGroup;
  categories = Object.values(ExpenseCategory).map((category) => ({
    name: category,
    code: category,
  }));

  paymentMethods = Object.values(PaymentMethod).map((method) => ({
    name: method,
    code: method,
  }));

  tags = signal<string[]>([]);

  ngOnInit(): void {
    this.initExpenseForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.id.set(idParam);
      this.loadExpense(idParam);
    }
  }

  private initExpenseForm() {
    this.expenseForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0)]],
      date: [new Date(), Validators.required],
      category: [null, Validators.required],
      paymentMethod: [null, Validators.required],
      description: [null, [Validators.required, Validators.minLength(3)]],
      tags: [[]],
      notes: [''],
    });
  }

  private loadExpense(id: string) {
    console.log(`Loading expense with ID: ${id}`);
    this.expenseService.getExpenseById(id).subscribe({
      next: (expense) => {
        console.log('Loaded expense:', expense);
        this.expenseForm.patchValue({
          ...expense,
          date: new Date(expense.date),
        });
        this.tags.update(() => expense.tags || []);
      },
      error: (error) => {
        console.error('Error loading expense:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load expense data.',
        });
      },
    });
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      const expenseData: Expense = {
        ...this.expenseForm.value,
        tags: this.tags(),
        date: this.expenseForm.value.date.toISOString().split('T')[0],
      };

      console.log('Submitting expense data:', expenseData);

      const request$ = this.isEditMode()
        ? this.expenseService.updateExpense(this.id()!, expenseData)
        : this.expenseService.createExpense(expenseData);

      request$.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Expense ${
              this.isEditMode() ? 'updated' : 'created'
            } successfully.`,
          });
          this.expenseForm.reset();
          setTimeout(() => {
            this.router.navigate(['/expenses']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error saving expense:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to ${
              this.isEditMode() ? 'update' : 'create'
            } expense.`,
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields.',
      });
    }
  }

  addtag(tag: string) {
    if (tag && !this.tags().includes(tag)) {
      this.tags.update((prevTags) => [...prevTags, tag]);
    }
  }

  removeTag(tag: string) {
    this.tags.update((prevTags) => prevTags.filter((t) => t !== tag));
  }
}
