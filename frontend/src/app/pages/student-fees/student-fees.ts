import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-fees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-fees.html'
})
export class StudentFees implements OnInit {
  payments: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getPayments();
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }

  getPayments() {
    this.http.get<any[]>(`${environment.apiUrl}/api/payments/my`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.payments = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });
  }

  getPendingDues() {
    return this.payments
      .filter((payment) => payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount + (payment.lateFee || 0), 0);
  }

  getPaidTotal() {
    return this.payments
      .filter((payment) => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount + (payment.lateFee || 0), 0);
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
      error: () => alert('Receipt is available only for paid payments')
    });
  }
}
