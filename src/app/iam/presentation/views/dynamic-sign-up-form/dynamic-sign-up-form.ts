import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../application/iam-store';
import { SignUpCommand } from '../../../domain/model/sign-up-command';
import { UserType } from '../../../domain/model/user-type-enum';
import { MobileSubtype } from '../../../domain/model/mobile-subtype-enum';
import { DISTRICTS_LIMA } from '../../../../shared/constants/districts';
import { BaseFormComponent } from '../../../../shared/presentation/components/base-form/base-form';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';

@Component({
  selector: 'app-dynamic-sign-up-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    TranslatePipe,
    LanguageSwitcher,
  ],
  templateUrl: './dynamic-sign-up-form.html',
  styleUrls: ['./dynamic-sign-up-form.css'],
})
export class DynamicSignUpFormComponent extends BaseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(IamStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  userType: UserType | null = null;
  districts = DISTRICTS_LIMA;
  mobileSubtypes = Object.values(MobileSubtype);

  form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      fullName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],

      ownerGroup: this.fb.group({
        district: ['', Validators.required],
      }),

      clinicGroup: this.fb.group({
        clinicName: ['', Validators.required],
        ruc: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
        address: ['', Validators.required],
        clinicType: ['', Validators.required],
      }),

      mobileGroup: this.fb.group({
        mobileSubtype: ['', Validators.required],
        coverageDistricts: [[], Validators.required],
        hasVehicle: [false],
        vehiclePlate: [''],
        specialty: [''],
      }),
    },
    { validators: this.passwordMatchValidator },
  );

  ngOnInit(): void {
    const userTypeParam = this.route.snapshot.queryParamMap.get('userType');

    if (!userTypeParam) {
      this.router.navigate(['/iam/select-type']).then();
      return;
    }

    this.userType = userTypeParam as UserType;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  passwordMatchValidator(group: any) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;

    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const v = this.form.value;
    const userType = this.userType!;

    let command: SignUpCommand;

    if (userType === UserType.OWNER) {
      command = new SignUpCommand(
        v.username!,
        v.password!,
        v.email!,
        userType,
        v.fullName!,
        v.phone!,
        v.ownerGroup?.district ?? undefined,
      );
    } else if (userType === UserType.CLINIC) {
      command = new SignUpCommand(
        v.username!,
        v.password!,
        v.email!,
        userType,
        v.fullName!,
        v.phone!,
        undefined,
        v.clinicGroup?.clinicName ?? undefined,
        v.clinicGroup?.ruc ?? undefined,
        v.clinicGroup?.address ?? undefined,
        v.clinicGroup?.clinicType ?? undefined,
      );
    } else {
      command = new SignUpCommand(
        v.username!,
        v.password!,
        v.email!,
        userType,
        v.fullName!,
        v.phone!,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        (v.mobileGroup?.mobileSubtype as MobileSubtype) ?? undefined,
        v.mobileGroup?.coverageDistricts ?? undefined,
        v.mobileGroup?.hasVehicle ?? undefined,
        v.mobileGroup?.vehiclePlate ?? undefined,
        v.mobileGroup?.specialty ?? undefined,
      );
    }

    this.store.signUp(command, this.router);
  }

  goToSignIn(): void {
    this.router.navigate(['/iam/sign-in']).then();
  }
}
