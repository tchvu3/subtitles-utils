import { Component, ElementRef, ViewChild } from '@angular/core'
import { SrtHolder } from '../model/SrtHolder'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  private readonly MissingFileName = 'Upload file...'

  @ViewChild('fileInputCorrectLanguage') private fileInputCorrectLanguage: ElementRef<HTMLInputElement>
  @ViewChild('fileInputCorrectTiming') private fileInputCorrectTiming: ElementRef<HTMLInputElement>

  @ViewChild('correctLanguageTextArea') private correctLanguageTextArea: ElementRef<HTMLTextAreaElement>
  @ViewChild('correctTimingTextArea') private correctTimingTextArea: ElementRef<HTMLTextAreaElement>

  private correctTimingSubtitles: SrtHolder
  private correctLanguageSubtitles: SrtHolder
  public synchronizeScrolling = true
  public startFromIndex = 0

  public uploadCorrectLanguage(): void {
    this.uploadFile(this.fileInputCorrectLanguage.nativeElement).then((srtHolder) => {
      this.correctLanguageSubtitles = srtHolder
      this.correctLanguageTextArea.nativeElement.value = srtHolder.toString()
    })
  }

  public uploadCorrectTiming(): void {
    this.uploadFile(this.fileInputCorrectTiming.nativeElement).then((srtHolder) => {
      this.correctTimingSubtitles = srtHolder
      this.correctTimingTextArea.nativeElement.value = srtHolder.toString()
    })
  }

  private uploadFile(elementToUse: HTMLInputElement): Promise<SrtHolder> {
    return new Promise((resolve) => {
      const onChangeCallback = () => {
        elementToUse.removeEventListener('change', onChangeCallback)
        const file: File = elementToUse.files[0]
        file.arrayBuffer().then((buffer) => {
          const textDecoder = new TextDecoder('windows-1251')
          resolve(new SrtHolder(textDecoder.decode(buffer), file.name))
        })
      }

      elementToUse.addEventListener('change', onChangeCallback)
      elementToUse.click()
    })
  }

  public getCorrectTimingFileName(): string {
    return this.correctTimingSubtitles?.getFileName() ?? this.MissingFileName
  }

  public getCorrectLanguageFileName(): string {
    return this.correctLanguageSubtitles?.getFileName() ?? this.MissingFileName
  }

  public shouldDisableActionButton(): boolean {
    return this.correctTimingSubtitles == null || this.correctLanguageSubtitles == null
  }

  public startTransformation(): void {
    const fromIndex = this.startFromIndex <= 0 || this.startFromIndex >= this.correctLanguageSubtitles.getAmountOfEntries() ? 0 : this.startFromIndex - 1
    const result = this.correctTimingSubtitles.setTextFromAnotherHolder(this.correctLanguageSubtitles, fromIndex).toString()
    this.downloadSrtFile(result, `Fixed-${this.getCorrectLanguageFileName()}`)
  }

  private downloadSrtFile(srtContent: string, fileName: string) {
    const file = new Blob([srtContent], { type: 'text/plain' })
    const a = document.createElement('a')
    const url = URL.createObjectURL(file)
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 0)
  }

  public onCorrectLanguageTextAreaScrolled(): void {
    if (this.synchronizeScrolling) {
      this.correctTimingTextArea.nativeElement.scrollTo({ top: this.correctLanguageTextArea.nativeElement.scrollTop, behavior: 'auto' })
    }
  }

  public onCorrectTimingTextAreaScrolled(): void {
    if (this.synchronizeScrolling) {
      this.correctLanguageTextArea.nativeElement.scrollTo({ top: this.correctTimingTextArea.nativeElement.scrollTop, behavior: 'auto' })
    }
  }
}
