import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, viewChild, inject } from '@angular/core';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Route, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AnchorService } from '@shared/anchor';
import { ROUTE_ANIMATION } from './app.animation';
import { DEFAULT_THEME, LOCAL_STORAGE_THEME_KEY } from './app.constant';
import { isTheme, Theme } from './app.models';

@Component({
  animations: [ROUTE_ANIMATION],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FlexModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ]
})
export class AppComponent implements OnInit {
  private document = inject<Document>(DOCUMENT);
  private anchorService = inject(AnchorService);
  private router = inject(Router);

  routes: Route[];
  theme = DEFAULT_THEME;
  readonly tabHeader = viewChild('tabHeader', { read: ElementRef });
  private readonly stickyClassName = 'mat-mdc-tab-nav-bar--sticky';

  constructor() {
    this.routes = this.router.config.filter(
      (route) => route.data && route.data['label'],
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.anchorService.interceptClick(event);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const tabHeaderValue = this.tabHeader();
    if (tabHeaderValue == null) return;

    const tabHeader = tabHeaderValue.nativeElement;
    const tabHeaderOffset = Math.ceil(tabHeader.offsetTop);
    const windowOffset = Math.ceil(window.scrollY);
    const hasStickyClass = tabHeader.classList.contains(this.stickyClassName);

    if (!hasStickyClass && windowOffset >= tabHeaderOffset) tabHeader.classList.add(this.stickyClassName);
    if (hasStickyClass && windowOffset < tabHeaderOffset) tabHeader.classList.remove(this.stickyClassName);
  }

  ngOnInit(): void {
    this.anchorService.setOffset([0, 64]);

    const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    this.setTheme(isTheme(storedTheme) ? storedTheme : DEFAULT_THEME);
  }

  handleFragment(): void {
    this.anchorService.scrollToAnchor();
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    const bodyClassList = this.document.querySelector('body')!.classList;
    const removeClassList = /\w*-theme\b/.exec(bodyClassList.value);

    if (removeClassList) bodyClassList.remove(...removeClassList);

    bodyClassList.add(`${ this.theme }-theme`);
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, this.theme);
  }

  getRouteAnimation(outlet: RouterOutlet): string {
    return (
      outlet &&
      outlet.activatedRouteData &&
      (outlet.activatedRouteData['label'] as string)
    );
  }

  toggleTheme(): void {
    this.setTheme(this.theme === Theme.Light ? Theme.Dark : Theme.Light);
  }
}
