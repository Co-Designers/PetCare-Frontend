import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-base-form',
  standalone: true,
  template: '',
})
export class BaseFormComponent {
  /**
   * Verifica si un control del formulario es inválido y ha sido tocado.
   * @param form Grupo de formulario
   * @param controlName Nombre del control
   */
  isInvalidControl(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!control && control.invalid && control.touched;
  }
}
