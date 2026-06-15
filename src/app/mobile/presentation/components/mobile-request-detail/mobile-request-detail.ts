import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { MobileRequestService } from '../../../application/mobile-request';
import { NotificationService } from '../../../../shared/application/notification';

@Component({
  selector: 'app-mobile-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, TranslatePipe],
  templateUrl: './mobile-request-detail.html',
  styleUrls: ['./mobile-request-detail.css'],
})
export class MobileRequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(MobileRequestService);
  private notification = inject(NotificationService);

  request: any = null;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.requestService.getRequestById(id).subscribe({
        next: (data) => {
          this.request = data;
          this.loading = false;
        },
        error: () => {
          this.notification.error('Error al cargar solicitud');
          this.router.navigate(['/mobile/requests']);
        },
      });
    }
  }

  accept(): void {
    if (this.request) {
      this.requestService.acceptRequest(this.request.id);
      this.router.navigate(['/mobile/requests']);
    }
  }

  reject(): void {
    if (this.request) {
      this.requestService.rejectRequest(this.request.id);
      this.router.navigate(['/mobile/requests']);
    }
  }
}
