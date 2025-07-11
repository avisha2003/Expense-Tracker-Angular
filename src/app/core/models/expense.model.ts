export interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  paymentMethod: PaymentMethod;
  tags?: string[];
  notes?: string;
}

export enum ExpenseCategory {
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  SHOPPING = 'Shopping',
  HEALTH = 'Health',
  OTHER = 'Other',
}

export enum PaymentMethod {
  CASH = 'Cash',
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  BANK_TRANSFER = 'Bank Transfer',
  PAYPAL = 'PayPal',
  OTHER = 'Other',
}