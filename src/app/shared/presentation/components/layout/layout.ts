import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../../iam/application/iam-store';
import { AuthenticationSectionComponent } from '../../../../iam/presentation/components/authentication-section/authentication-section';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    AuthenticationSectionComponent,
    LanguageSwitcher,
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class LayoutComponent {
  private iamStore = inject(IamStore);

  isSignedIn = this.iamStore.isSignedIn;
  userRole = this.iamStore.currentUserType;
}
