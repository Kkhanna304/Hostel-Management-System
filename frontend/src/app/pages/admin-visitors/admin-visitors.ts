import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-visitors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-visitors.html'
})
export class AdminVisitors implements OnInit, OnDestroy {
  visitors: any[] = [];
  statusFilter = 'all';
  adminNote = '';
  private refreshTimer: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getVisitors();
    this.refreshTimer = setInterval(() => this.getVisitors(false), 12000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimer);
  }

  getHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  getVisitors(showError = true) {
    this.http.get<any[]>(`${environment.apiUrl}/api/visitors`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.visitors = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        if (showError) alert('Failed to load visitors');
      }
    });
  }

  filteredVisitors() {
    return this.statusFilter === 'all'
      ? this.visitors
      : this.visitors.filter((visitor) => visitor.status === this.statusFilter);
  }

  updateVisitor(visitorId: string, status: string) {
    this.http.put(`${environment.apiUrl}/api/visitors/${visitorId}`, {
      status,
      adminNote: this.adminNote
    }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.adminNote = '';
        this.getVisitors(false);
      },
      error: (err) => alert(err.error?.message || 'Failed to update visitor request')
    });
  }
}
