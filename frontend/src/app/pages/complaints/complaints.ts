import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaints.html'
})
export class Complaints implements OnInit {
  complaints: any[] = [];
  message = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getComplaints();
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }

  getComplaints() {
    this.http.get<any[]>(`${environment.apiUrl}/api/complaints/my`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.complaints = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });
  }

  submitComplaint() {
    this.http.post(`${environment.apiUrl}/api/complaints`, {
      message: this.message
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        alert('Complaint submitted');
        this.message = '';
        this.getComplaints();
      },
      error: (err) => alert(err.error?.message || 'Failed to submit complaint')
    });
  }
}
