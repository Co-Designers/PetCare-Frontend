import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { OwnerServiceProviderEntity } from '../../../domain/model/owner-service-provider-entity';

@Component({
  selector: 'app-owner-service-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './owner-service-card.html',
  styleUrls: ['./owner-service-card.css'],
})
export class OwnerServiceCardComponent {
  provider = input.required<OwnerServiceProviderEntity>();
  select = output<OwnerServiceProviderEntity>();

  onSelect(): void {
    this.select.emit(this.provider());
  }
}
