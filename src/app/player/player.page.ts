import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {LoadingController} from '@ionic/angular';

@Component({
  selector: 'app-player',
  templateUrl: 'player.page.html',
  animations: [
    trigger('showHide', [
      state(
        'active',
        style({
          top: 0,
          opacity: 1
        })
      ),
      state(
        'inactive',
        style({
          top: '100px',
          opacity: 0
        })
      ),
      transition('inactive => active', animate('200ms ease-in')),
      transition('active => inactive', animate('200ms ease-out'))
    ])
  ],
  styleUrls: ['player.page.scss']
})
export class PlayerPage implements AfterViewInit {

  @ViewChild('audioElement', {static: false}) private audioElementRef: ElementRef;
  files: {name: string, url: string}[] = [];
  currentFile: {index: number, file: {name: string, url: string}} = null;
  displayFooter = 'inactive';
  ringing = true;
  private indexHistory = [];
  private loadingModal: Promise<HTMLIonLoadingElement>;
  private seekTimeout: any;

  constructor(private loadingCtrl: LoadingController, private ref: ElementRef) {
    this.getDocuments();
  }

  ngAfterViewInit() {
    this.audioElement.addEventListener('timeupdate', () => {});
  }

  getDocuments() {
    this.presentLoading();
    this.files = [
      {name: 'Open The Window Of Your Heart - Meditation.mp3', url: 'example.mp3'},
      {name: 'OM AKHAND - Healing Power of OM.mp3', url: 'example.mp3'},
      {name: 'Meditation To Release Inner Tension.mpg3', url: 'example.mp3'}
    ];
    setTimeout(() => this.dismissLoading(), 500);
  }

  openSession(file, index) {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    if (!!this.currentFile && this.currentFile.index === index) {
      this.currentFile = null;
      this.displayFooter = 'inactive';
    } else {
      this.pushIndexHistory(index);
      this.currentFile = {index, file};
      this.audioElement.src = '/assets/' + this.currentFile.file.url;
      this.audioElement.play().then(() => this.displayFooter = 'active');
      const range = document.querySelector('ion-range');
      if (!!range) {
        range.value = 0;
      }
    }
  }

  pickRandomSession() {
    let random = Math.floor(Math.random() * this.files.length);
    while (this.indexHistory.indexOf(random) !== -1) {
      random = Math.floor(Math.random() * this.files.length);
    }
    this.openSession(this.files[random], random);
  }

  get audioElement(): HTMLAudioElement {
    return this.audioElementRef.nativeElement as HTMLAudioElement;
  }

  next() {
    const index = this.currentFile.index + 1;
    const file = this.files[index];
    this.openSession(file, index);
  }

  previous() {
    const index = this.currentFile.index - 1;
    const file = this.files[index];
    this.openSession(file, index);
  }

  isFirstPlaying(): boolean {
    return this.currentFile.index === 0;
  }

  isLastPlaying(): boolean {
    return this.currentFile.index === this.files.length - 1;
  }

  onSeekChange(event) {
    if (this.seekTimeout) {
      clearTimeout(this.seekTimeout);
      this.seekTimeout = null;
    }
    this.seekTimeout = setTimeout(() => {
      this.audioElement.currentTime = event.detail.value;
    }, 300);
  }

  getCurrentTime(): string {
    return this.formatTime(this.audioElement.currentTime);
  }

  getDuration(): string {
    return this.formatTime(this.audioElement.duration);
  }

  getDurationSec(): number {
    return this.audioElement.duration;
  }

  private presentLoading() {
    this.getLoading().then(l => l.present());
  }

  private dismissLoading() {
    this.getLoading().then(l => l.dismiss());
  }

  private getLoading(): Promise<HTMLIonLoadingElement> {
    if (!this.loadingModal) {
      this.loadingModal = this.loadingCtrl.create({
        message: 'Please Wait...',
        mode: 'ios'
      });
    }
    return this.loadingModal;
  }

  private formatTime(time: number): string {
    if (!time) {
      return '00:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    return this.formatTimePart(minutes) + ':' + this.formatTimePart(seconds);
  }

  private formatTimePart(value: number): string {
    return (value >= 10 ? '' : '0') + value;
  }

  private pushIndexHistory(index: number) {
    this.indexHistory.push(index);
    if (this.indexHistory.length > (this.files.length - 1)) {
      this.indexHistory = this.indexHistory.slice(Math.floor(this.files.length / 2));
    }
  }
}
