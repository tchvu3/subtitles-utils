export class SrtHolder {
  private readonly fileName: string
  private readonly rawSrt: string
  private readonly srtEntries: SrtEntry[]

  constructor(rawSrt: string, fileName: string) {
    this.fileName = fileName.trim()
    this.rawSrt = rawSrt.trim().replace(/\r/g, '')
    const rawEntries = this.rawSrt.split('\n\n')
    this.srtEntries = rawEntries.map((entry) => {
      const regexResult = entry.match(/(\d+)[^](\d+):(\d+):(\d+),(\d+) --> (\d+):(\d+):(\d+),(\d+)[^](.+)/)
      if (regexResult == null) {
        throw new Error(`Failed to parse: ${entry}`)
      }
      const entryId = parseInt(regexResult[1], 10)
      const start = new StrTimestamp(parseInt(regexResult[2], 10), parseInt(regexResult[3], 10), parseInt(regexResult[4], 10), parseInt(regexResult[5], 10))
      const end = new StrTimestamp(parseInt(regexResult[6], 10), parseInt(regexResult[7], 10), parseInt(regexResult[8], 10), parseInt(regexResult[9], 10))
      const text = regexResult[10]
      return new SrtEntry(entryId, start, end, text)
    })
  }

  public setTextFromAnotherHolder(replaceWith: SrtHolder, startFromIndex = 0): SrtHolder {
    const toReturn = this.clone()
    for (let self = 0, guest = startFromIndex; self < this.srtEntries.length && guest < replaceWith.srtEntries.length; self++, guest++) {
      toReturn.srtEntries[self].text = replaceWith.srtEntries[guest].text
    }
    return toReturn
  }

  public toString(): string {
    return this.srtEntries.reduce((strValue, entry) => (strValue += `${entry.toString()}\n\n`), '').trim()
  }

  public getFileName(): string {
    return this.fileName
  }

  public clone(): SrtHolder {
    return new SrtHolder(this.rawSrt, this.fileName)
  }

  public getAmountOfEntries(): number {
    return this.srtEntries.length
  }
}

class SrtEntry {
  constructor(public id: number, public start: StrTimestamp, public end: StrTimestamp, public text: string) {}

  public toString(): string {
    return `${this.id}\n${this.start.toString()} --> ${this.end.toString()}\n${this.text}`.trim()
  }
}

class StrTimestamp {
  constructor(public hours: number, public minutes: number, public seconds: number, public milliseconds: number) {}

  public toString(): string {
    return `${this.normalize(this.hours)}:${this.normalize(this.minutes)}:${this.normalize(this.seconds)},${this.normalize(this.milliseconds, 3)}`
  }

  private normalize(num: number, size = 2): string {
    let strNum = `${num}`
    while (strNum.length !== size) {
      strNum = `0${strNum}`
    }
    return strNum
  }
}
