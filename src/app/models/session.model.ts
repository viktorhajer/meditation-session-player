export class RowSession {
  name: string;
  url: string;
  duration?: string;
  liked?: boolean;
  hidden?: boolean;
}

export class Session {
  constructor(public row: RowSession) {
  }

  get name(): string {
    return this.row.name;
  }

  get url(): string {
    return this.row.url;
  }

  get duration(): string {
    return this.row.duration;
  }

  set duration(duration: string) {
    this.row.duration = duration;
  }

  get liked(): boolean {
    return this.row.liked;
  }

  set liked(flag: boolean) {
    this.row.liked = flag;
  }

  get hidden(): boolean {
    return this.row.hidden;
  }

  set hidden(flag: boolean) {
    this.row.hidden = flag;
  }

  getTitle(): string {
    const title = this.row.name.replace(/_/g, ' ');
    return (title.indexOf('.') === -1) ? title : title.substring(0, title.lastIndexOf('.'));
  }
}
