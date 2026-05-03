import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './rooms.html'
})
export class Rooms implements OnInit {

  roomNumber = '';
  capacity: number = 0;

  rooms: any[] = [];
  students: any[] = [];
  roomRequests: any[] = [];
  myRoomRequests: any[] = [];

  selectedStudent = '';
  requestReason = '';
  adminNote = '';
  role: string | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadRoomsPageData();
  }

  loadRoomsPageData() {
    this.role = localStorage.getItem('role');
    this.getRooms();

    if (this.role === 'admin') {
      this.getStudents();
      this.getRoomRequests();
    }

    if (this.role === 'student') {
      this.getMyRoomRequests();
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${this.getToken()}`
    };
  }

  getRooms() {
    this.http.get<any[]>(`${environment.apiUrl}/api/rooms`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.rooms = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        alert('Failed to load rooms');
      }
    });
  }

  getStudents() {
    this.http.get<any[]>(`${environment.apiUrl}/api/students`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.students = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        alert('Failed to load students');
      }
    });
  }

  getRoomRequests() {
    this.http.get<any[]>(`${environment.apiUrl}/api/rooms/requests`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.roomRequests = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        alert('Failed to load room requests');
      }
    });
  }

  getMyRoomRequests() {
    this.http.get<any[]>(`${environment.apiUrl}/api/rooms/requests/my`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.myRoomRequests = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  createRoom() {
    if (!this.roomNumber || !this.capacity) {
      alert('Enter room number and capacity');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/rooms`, {
      roomNumber: this.roomNumber,
      capacity: this.capacity
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        alert('Room created');
        this.roomNumber = '';
        this.capacity = 0;
        this.getRooms();
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Error creating room');
      }
    });
  }

  assignStudent(roomId: string) {
    if (!this.selectedStudent) {
      alert('Select a student');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/rooms/assign`, {
      roomId,
      studentId: this.selectedStudent
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        alert('Student assigned');
        this.selectedStudent = '';
        this.getRooms();
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Error assigning student');
      }
    });
  }

  requestRoom(roomId: string) {
    this.http.post(`${environment.apiUrl}/api/rooms/requests`, {
      roomId,
      reason: this.requestReason
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        alert('Room request submitted');
        this.requestReason = '';
        this.getMyRoomRequests();
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Error requesting room');
      }
    });
  }

  reviewRoomRequest(requestId: string, status: string) {
    this.http.put(`${environment.apiUrl}/api/rooms/requests/${requestId}`, {
      status,
      adminNote: this.adminNote
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        alert(`Room request ${status}`);
        this.adminNote = '';
        this.getRoomRequests();
        this.getRooms();
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Error reviewing request');
      }
    });
  }

  removeStudent(roomId: string, studentId: string) {
    this.http.post(`${environment.apiUrl}/api/rooms/remove`, {
      roomId,
      studentId
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        alert('Student removed');
        this.getRooms();
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Error removing student');
      }
    });
  }

  deleteRoom(roomId: string) {
    const confirmDelete = confirm('Are you sure you want to delete this room?');

    if (!confirmDelete) {
      return;
    }

    this.http.delete(`${environment.apiUrl}/api/rooms/${roomId}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        alert('Room deleted');
        this.getRooms();
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Error deleting room');
      }
    });
  }
}
