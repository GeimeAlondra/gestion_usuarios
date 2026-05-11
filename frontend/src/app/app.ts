import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MangaNavbarComponent } from "./core/layouts/manga-navbar/manga-navbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
