import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  private translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['en', 'es']);
    this.translate.use('en');
  }
}
