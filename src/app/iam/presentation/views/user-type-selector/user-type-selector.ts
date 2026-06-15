import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { UserType } from '../../../domain/model/user-type-enum';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';

@Component({
  selector: 'app-user-type-selector',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, TranslatePipe, LanguageSwitcher],
  templateUrl: './user-type-selector.html',
  styleUrls: ['./user-type-selector.css'],
})
export class UserTypeSelectorComponent {
  private router = inject(Router);
  userTypeEnum = UserType;

  selectType(type: UserType) {
    this.router.navigate(['/iam/sign-up'], { queryParams: { userType: type } });
  }
}
