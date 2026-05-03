import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './payments.html'
})
export class Payments implements OnInit, OnDestroy {

  payments: any[] = [];
  students: any[] = [];

  studentId = '';
  amount: number = 0;
  search = '';
  statusFilter = 'all';
  private refreshTimer: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getPayments();
    this.getStudents();
    this.refreshTimer = setInterval(() => this.getPayments(false), 12000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimer);
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }

  // GET PAYMENTS
  getPayments(showError = true) {
    this.http.get<any[]>(`${environment.apiUrl}/api/payments`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.payments = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        if (showError) alert('Failed to load payments');
      }
    });
  }

  // GET STUDENTS
  getStudents() {
    this.http.get<any[]>(`${environment.apiUrl}/api/students`, {
      headers: this.getHeaders()
    }).subscribe(res => {
      this.students = res;
      this.cdr.detectChanges();
    });
  }

  filteredPayments() {
    const term = this.search.toLowerCase().trim();

    return this.payments.filter((payment) => {
      const matchesSearch = !term ||
        payment.student?.name?.toLowerCase().includes(term) ||
        payment.student?.email?.toLowerCase().includes(term) ||
        payment.feeType?.toLowerCase().includes(term);
      const matchesStatus = this.statusFilter === 'all' || payment.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // ADD PAYMENT
  addPayment() {
    this.http.post(`${environment.apiUrl}/api/payments`, {
      student: this.studentId,
      amount: this.amount
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        alert('Payment record added');
        this.studentId = '';
        this.amount = 0;
        this.getPayments(false);
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Error adding payment');
      }
    });
  }

  updateStatus(paymentId: string, status: string) {
    this.http.put(`${environment.apiUrl}/api/payments/${paymentId}/status`, {
      status
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        const payment = this.payments.find((item) => item._id === paymentId);
        if (payment) {
          payment.status = status;
          payment.paymentDate = status === 'paid' ? new Date() : undefined;
        }
        this.cdr.detectChanges();
        this.getPayments(false);
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Error updating payment status');
      }
    });
  }

  downloadReceipt(paymentId: string) {
    this.http.get(`${environment.apiUrl}/api/payments/${paymentId}/receipt`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (receiptBlob) => {
        const receiptUrl = URL.createObjectURL(receiptBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = receiptUrl;
        downloadLink.download = `receipt-${paymentId}.pdf`;
        downloadLink.click();
        URL.revokeObjectURL(receiptUrl);
      },
      error: (err) => {
        console.log(err);
        alert('Receipt is available only for paid payments');
      }
    });
  }
}
