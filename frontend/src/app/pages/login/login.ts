import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.http.post<any>(`${environment.apiUrl}/api/auth/login`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {

        // ✅ Save token
        localStorage.setItem('token', res.token);

        // ✅ Save role (IMPORTANT)
        if (res.user && res.user.role) {
          localStorage.setItem('role', res.user.role);
        }

        // ✅ Redirect
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (err) => {
        console.log('Login Error:', err);

        // Better error message
        const message =
          err?.error?.message ||
          err?.error?.msg ||
          'Login failed';

        alert(message);
      }
    });
  }
}
