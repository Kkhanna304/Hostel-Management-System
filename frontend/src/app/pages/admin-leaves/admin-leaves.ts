import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-leaves.html'
})
export class AdminLeaves implements OnInit, OnDestroy {
  leaves: any[] = [];
  statusFilter = 'all';
  adminNote = '';
  private refreshTimer: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getLeaves();
    this.refreshTimer = setInterval(() => this.getLeaves(false), 12000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimer);
  }

  getHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  getLeaves(showError = true) {
    this.http.get<any[]>(`${environment.apiUrl}/api/leaves`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.leaves = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        if (showError) alert('Failed to load leaves');
      }
    });
  }

  filteredLeaves() {
    return this.statusFilter === 'all'
      ? this.leaves
      : this.leaves.filter((leave) => leave.status === this.statusFilter);
  }

  updateLeave(leaveId: string, status: string) {
    this.http.put(`${environment.apiUrl}/api/leaves/${leaveId}`, {
      status,
      adminNote: this.adminNote
    }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.adminNote = '';
        this.getLeaves(false);
      },
      error: (err) => alert(err.error?.message || 'Failed to update leave')
    });
  }
}
