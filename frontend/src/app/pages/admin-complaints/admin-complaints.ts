import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-complaints.html'
})
export class AdminComplaints implements OnInit, OnDestroy {
  complaints: any[] = [];
  statusFilter = 'all';
  adminNote = '';
  private refreshTimer: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getComplaints();
    this.refreshTimer = setInterval(() => this.getComplaints(false), 12000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimer);
  }

  getHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  getComplaints(showError = true) {
    this.http.get<any[]>(`${environment.apiUrl}/api/complaints`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.complaints = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        if (showError) alert('Failed to load complaints');
      }
    });
  }

  filteredComplaints() {
    return this.statusFilter === 'all'
      ? this.complaints
      : this.complaints.filter((complaint) => complaint.status === this.statusFilter);
  }

  updateComplaint(complaintId: string, status: string) {
    this.http.put(`${environment.apiUrl}/api/complaints/${complaintId}`, {
      status,
      adminNote: this.adminNote
    }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.adminNote = '';
        this.getComplaints(false);
      },
      error: (err) => alert(err.error?.message || 'Failed to update complaint')
    });
  }
}
