import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-visitors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitors.html'
})
export class Visitors implements OnInit {
  visitors: any[] = [];
  visitorName = '';
  relation = '';
  visitDate = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getVisitors();
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }

  getVisitors() {
    this.http.get<any[]>(`${environment.apiUrl}/api/visitors/my`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.visitors = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });
  }

  addVisitor() {
    this.http.post(`${environment.apiUrl}/api/visitors`, {
      visitorName: this.visitorName,
      relation: this.relation,
      visitDate: this.visitDate
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        alert('Visitor request submitted');
        this.visitorName = '';
        this.relation = '';
        this.visitDate = '';
        this.getVisitors();
      },
      error: (err) => alert(err.error?.message || 'Failed to submit visitor request')
    });
  }

  isCardExpired(visitor: any) {
    return visitor.idCardExpiresAt && new Date(visitor.idCardExpiresAt).getTime() < Date.now();
  }

  downloadIdCard(visitor: any) {
    if (this.isCardExpired(visitor)) {
      alert('Visitor ID card has expired');
      return;
    }

    this.http.get(`${environment.apiUrl}/api/visitors/${visitor._id}/id-card`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (cardBlob) => {
        const cardUrl = URL.createObjectURL(cardBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = cardUrl;
        downloadLink.download = `visitor-id-${visitor.visitorId || visitor._id}.pdf`;
        downloadLink.click();
        URL.revokeObjectURL(cardUrl);
      },
      error: (err) => alert(err.error?.message || 'Failed to download visitor ID card')
    });
  }

  printIdCard(visitor: any) {
    const printWindow = window.open('', '_blank', 'width=820,height=620');

    if (!printWindow) {
      window.print();
      return;
    }

    const escapeHtml = (value: any) => String(value || '').replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      return entities[char];
    });

    const visitDate = visitor.visitDate ? new Date(visitor.visitDate).toLocaleDateString('en-IN') : '-';
    const validUntil = visitor.idCardExpiresAt ? new Date(visitor.idCardExpiresAt).toLocaleString('en-IN') : '-';

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Visitor ID Card</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; margin: 32px; color: #172033; }
            .card { max-width: 620px; padding: 24px; border: 2px solid #1d65c1; border-radius: 12px; }
            .top { display: flex; justify-content: space-between; border-bottom: 1px solid #dbe6f3; padding-bottom: 14px; }
            .label { color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr) 84px; gap: 16px; align-items: center; padding-top: 18px; }
            .qr { width: 76px; height: 76px; display: grid; place-items: center; border: 1px dashed #94a3b8; border-radius: 8px; font-weight: 700; color: #64748b; }
            h2, h3 { margin: 0; }
            strong { display: block; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="top">
              <div>
                <span class="label">Hostel Name</span>
                <h2>Drowsy Hostel Management</h2>
              </div>
              <h3>Visitor ID</h3>
            </div>
            <div class="grid">
              <div><span class="label">Visitor Name</span><strong>${escapeHtml(visitor.visitorName)}</strong></div>
              <div><span class="label">Student Name</span><strong>${escapeHtml(visitor.student?.name || 'Student')}</strong></div>
              <div class="qr">QR</div>
              <div><span class="label">Visit Date</span><strong>${escapeHtml(visitDate)}</strong></div>
              <div><span class="label">Visitor ID</span><strong>${escapeHtml(visitor.visitorId)}</strong></div>
              <div><span class="label">Valid Until</span><strong>${escapeHtml(validUntil)}</strong></div>
            </div>
          </div>
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
