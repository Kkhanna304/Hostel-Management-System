import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-students.html'
})
export class AdminStudents implements OnInit, OnDestroy {
  students: any[] = [];
  rooms: any[] = [];
  search = '';
  filter = 'all';
  private refreshTimer: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
    this.refreshTimer = setInterval(() => this.loadData(false), 12000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimer);
  }

  getHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  loadData(showError = true) {
    this.http.get<any[]>(`${environment.apiUrl}/api/students`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.students = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        if (showError) alert('Failed to load students');
      }
    });

    this.http.get<any[]>(`${environment.apiUrl}/api/rooms`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.rooms = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });
  }

  getStudentRoom(studentId: string) {
    return this.rooms.find((room) => room.occupants?.some((occupant: any) => occupant._id === studentId));
  }

  filteredStudents() {
    const term = this.search.toLowerCase().trim();

    return this.students.filter((student) => {
      const matchesSearch = !term ||
        student.name?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term);
      const room = this.getStudentRoom(student._id);
      const matchesFilter =
        this.filter === 'all' ||
        (this.filter === 'assigned' && room) ||
        (this.filter === 'unassigned' && !room);

      return matchesSearch && matchesFilter;
    });
  }

  deleteStudent(studentId: string) {
    if (!confirm('Delete this student?')) return;

    this.http.delete(`${environment.apiUrl}/api/students/${studentId}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.students = this.students.filter((student) => student._id !== studentId);
        this.cdr.detectChanges();
      },
      error: (err) => alert(err.error?.message || 'Failed to delete student')
    });
  }
}
