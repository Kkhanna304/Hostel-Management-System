import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html'
})
export class Register {

  name = '';
  email = '';
  password = '';
  role = 'student';

  constructor(private http: HttpClient) {}

  getToken() {
    return localStorage.getItem('token');
  }

  register() {
    this.http.post(`${environment.apiUrl}/api/auth/register`, {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role
    }, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).subscribe({
      next: () => {
        alert('User registered successfully');

        // reset form
        this.name = '';
        this.email = '';
        this.password = '';
        this.role = 'student';
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Registration failed');
      }
    });
  }
}
