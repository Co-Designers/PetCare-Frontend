import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private getPanelClass(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'snackbar-success';
      case 'error':
        return 'snackbar-error';
      case 'warning':
        return 'snackbar-warning';
      default:
        return 'snackbar-info';
    }
  }

  /**
   * Muestra un mensaje temporal en la pantalla.
   * @param message Texto del mensaje.
   * @param type Tipo de notificación (define color y acción por defecto).
   * @param duration Duración en milisegundos (por defecto 4000).
   */
  show(message: string, type: NotificationType = 'info', duration: number = 4000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [this.getPanelClass(type)],
    });
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }
}
