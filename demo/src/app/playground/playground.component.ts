import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CodeEditorComponent } from "ngx-codemirror";
import { FlexModule } from '@angular/flex-layout/flex';
import { CodeMirrorThemes } from "@app/constants/const-codemirror-editor-themes";
import { languages } from '@codemirror/language-data';
import { ScrollspyNavLayoutComponent } from '@shared/scrollspy-nav-layout';
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatOption, MatSelectModule } from "@angular/material/select";

@Component({
  selector: 'app-playground',
  imports: [
    CodeEditorComponent,
    FlexModule,
    ScrollspyNavLayoutComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOption,
  ],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PlaygroundComponent implements OnInit, OnDestroy {
  protected readonly CodeMirrorThemes = CodeMirrorThemes;
  protected readonly CodeMirrorLanguages = languages;
  protected selectedTheme = this.CodeMirrorThemes[0];
  protected selectedLanguage = languages[0];

  private _editorContent = '';

  get editorContent() {
    return this._editorContent;
  }

  set editorContent(value: string) {
    this._editorContent = value;
    this.changeDetector.detectChanges();
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.onLanguageChange(this.selectedLanguage);
  }

  ngOnDestroy(): void {
    this.changeDetector.detach();
  }

  // Add this method to the PlaygroundComponent class
  onLanguageChange(lang: any) {
    this.selectedLanguage = lang;

    const langFormated = lang.name.replace(' ', '_').replace('#', 'sharp');
    this.getLangSample(langFormated);
  }

  getLangSample(lang: string): void {
    try {
      fetch(`lang_samples/${ lang.toLowerCase() }.txt`).then(async response => {
        this._editorContent = response.ok ? await response.text() : '';
        this.changeDetector.detectChanges();
      });
    } catch (error) {
      console.error('Error fetching language sample:', error);
    }
  }
}
