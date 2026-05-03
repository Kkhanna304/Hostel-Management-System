import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit, OnDestroy {
  stats: any = {};
  role: string | null = null;
  profile: any = {};
  currentRoom: any = null;
  studentPayments: any[] = [];
  leaves: any[] = [];
  complaints: any[] = [];
  visitors: any[] = [];
  notifications: string[] = [];
  private refreshTimer: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadDashboardData();
    this.refreshTimer = setInterval(() => this.loadDashboardData(false), 10000);
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }

  loadDashboardData(showError = true) {
    this.role = localStorage.getItem('role');

    if (this.role === 'admin') {
      this.http.get(`${environment.apiUrl}/api/dashboard`, {
        headers: this.getHeaders()
      }).subscribe({
        next: (res) => {
          this.stats = res;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
          if (showError) {
            alert('Failed to load dashboard data');
          }
        }
      });
    }

    if (this.role === 'student') {
      this.loadStudentDashboard();
    }
  }

  loadStudentDashboard() {
    this.http.get<any>(`${environment.apiUrl}/api/students/profile`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.profile = res;
        this.loadCurrentRoom();
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });

    this.http.get<any[]>(`${environment.apiUrl}/api/payments/my`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.studentPayments = res;
        this.refreshNotifications();
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });

    this.http.get<any[]>(`${environment.apiUrl}/api/leaves/my`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.leaves = res;
        this.refreshNotifications();
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });

    this.http.get<any[]>(`${environment.apiUrl}/api/complaints/my`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.complaints = res;
        this.refreshNotifications();
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });

    this.http.get<any[]>(`${environment.apiUrl}/api/visitors/my`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.visitors = res;
        this.refreshNotifications();
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });
  }

  loadCurrentRoom() {
    this.http.get<any[]>(`${environment.apiUrl}/api/rooms`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (rooms) => {
        this.currentRoom = rooms.find((room) =>
          room.occupants?.some((occupant: any) => occupant._id === this.profile._id)
        ) || null;
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });
  }

  getRole() {
    return this.role;
  }

  getPendingDues() {
    return this.studentPayments
      .filter((payment) => payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount + (payment.lateFee || 0), 0);
  }

  getTotalPaid() {
    return this.studentPayments
      .filter((payment) => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount + (payment.lateFee || 0), 0);
  }

  getLatest(items: any[]) {
    return items.length > 0 ? items[0] : null;
  }

  refreshNotifications() {
    const notifications: string[] = [];

    if (this.getPendingDues() > 0) {
      notifications.push(`Pending fee due: Rs. ${this.getPendingDues()}`);
    }

    const latestLeave = this.getLatest(this.leaves);
    if (latestLeave && latestLeave.status !== 'pending') {
      notifications.push(`Leave request ${latestLeave.status}`);
    }

    const latestComplaint = this.getLatest(this.complaints);
    if (latestComplaint && latestComplaint.status === 'resolved') {
      notifications.push('Your latest complaint was resolved');
    }

    const latestVisitor = this.getLatest(this.visitors);
    if (latestVisitor && latestVisitor.status !== 'pending') {
      notifications.push(`Visitor request ${latestVisitor.status}`);
    }

    this.notifications = notifications;
  }

  getAdminNotifications() {
    const notifications: string[] = [];

    if (this.stats.pendingPayments > 0) {
      notifications.push(`${this.stats.pendingPayments} pending payment records`);
    }
    if (this.stats.pendingLeaves > 0) {
      notifications.push(`${this.stats.pendingLeaves} leave requests need review`);
    }
    if (this.stats.pendingVisitors > 0) {
      notifications.push(`${this.stats.pendingVisitors} visitor requests need review`);
    }
    if (this.stats.pendingRoomRequests > 0) {
      notifications.push(`${this.stats.pendingRoomRequests} room requests need review`);
    }
    if (this.stats.pendingComplaints > 0) {
      notifications.push(`${this.stats.pendingComplaints} complaints are pending`);
    }

    return notifications;
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
