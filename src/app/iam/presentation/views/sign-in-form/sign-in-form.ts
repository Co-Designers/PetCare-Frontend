import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../application/iam-store';
import { SignInCommand } from '../../../domain/model/sign-in-command';
import { BaseFormComponent } from '../../../../shared/presentation/components/base-form/base-form';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';

@Component({
  selector: 'app-sign-in-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    TranslatePipe,
    BaseFormComponent,
    LanguageSwitcher,
  ],
  templateUrl: './sign-in-form.html',
  styleUrls: ['./sign-in-form.css'],
})
export class SignInFormComponent extends BaseFormComponent {
  private fb = inject(FormBuilder);
  public store = inject(IamStore);
  private router = inject(Router);

  hidePassword = true;

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  onSubmit() {
    if (this.form.invalid) return;
    const command = new SignInCommand(this.form.value.username!, this.form.value.password!);
    this.store.signIn(command, this.router);
  }

  goToSelectType() {
    this.router.navigate(['/iam/select-type']).then();
  }
}
