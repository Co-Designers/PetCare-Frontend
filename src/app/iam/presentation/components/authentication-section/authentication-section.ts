import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../application/iam-store';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';

@Component({
  selector: 'app-authentication-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    LanguageSwitcher,
  ],
  templateUrl: './authentication-section.html',
  styleUrls: ['./authentication-section.css'],
})
export class AuthenticationSectionComponent {
  private store = inject(IamStore);
  private router = inject(Router);

  // Exponer las señales del store al template
  readonly isSignedIn = this.store.isSignedIn;
  readonly currentUsername = this.store.currentUsername;

  performSignOut(): void {
    this.store.signOut(this.router);
  }
}
