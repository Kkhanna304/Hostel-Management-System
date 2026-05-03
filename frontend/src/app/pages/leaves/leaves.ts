import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves.html'
})
export class Leaves implements OnInit {
  leaves: any[] = [];
  fromDate = '';
  toDate = '';
  reason = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getLeaves();
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }

  getLeaves() {
    this.http.get<any[]>(`${environment.apiUrl}/api/leaves/my`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.leaves = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });
  }

  applyLeave() {
    this.http.post(`${environment.apiUrl}/api/leaves`, {
      fromDate: this.fromDate,
      toDate: this.toDate,
      reason: this.reason
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        alert('Leave request submitted');
        this.fromDate = '';
        this.toDate = '';
        this.reason = '';
        this.getLeaves();
      },
      error: (err) => alert(err.error?.message || 'Failed to apply leave')
    });
  }
}
