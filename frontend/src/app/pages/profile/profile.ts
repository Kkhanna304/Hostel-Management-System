import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  profile: any = {};
  name = '';
  email = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getProfile();
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }

  getProfile() {
    this.http.get<any>(`${environment.apiUrl}/api/students/profile`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.profile = res;
        this.name = res.name;
        this.email = res.email;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        alert('Failed to load profile');
      }
    });
  }

  updateProfile() {
    this.http.put<any>(`${environment.apiUrl}/api/students/profile`, {
      name: this.name,
      email: this.email
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.profile = res.user;
        alert('Profile updated');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Failed to update profile');
      }
    });
  }
}
