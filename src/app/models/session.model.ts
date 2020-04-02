export class RowSession {
  id: number;
  name: string;
  url: string;
  duration?: string;
  liked?: boolean;
  hidden?: boolean;
}

export class Session {
  constructor(public row: RowSession) {
  }

  get id(): number {
    return this.row.id;
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

  get liked(): boolean {
    return this.row.liked;
  }

  set liked(flag: boolean) {
    this.row.liked = flag;
  }

  get hidden(): boolean {
    return this.row.liked;
  }

  set hidden(flag: boolean) {
    this.row.liked = flag;
  }

  getTitle(): string {
    const title = this.row.name.replace('_', ' ');
    return (title.indexOf('.') === -1) ? title : title.substring(0, title.lastIndexOf('.'));
  }
}
