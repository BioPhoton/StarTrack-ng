import { Component, HostListener } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  PlaybackStates,
  PlayerService,
} from '../../providers/player/player.service2';
import { PlayerModalComponent } from '../player-modal/player-modal.component';
import { tap } from 'rxjs/operators';

@Component({
  // eslint-disable-next-line
  selector: 'track-player',
  templateUrl: './track-player.component.html',
  styleUrls: ['./track-player.component.scss'],
})
export class TrackPlayerComponent {
  public state$ = this.player.select();
  public playbackTime = 0;

  public playbackStates = PlaybackStates;
  private playerModal: typeof PlayerModalComponent;
  private playbackTime$ = this.player.select('playbackTime');
  private clickBlock = false;
  private isScrubbing = false;


  constructor(public player: PlayerService, private modalCtrl: ModalController) {
    this.playbackTime$
      .pipe(
        tap((val: any) => {
          if (!this.isScrubbing) {
            this.playbackTime = val;
          }
        })
      )
      .subscribe();
  }

  @HostListener('click')
  async toggle() {
    if (!this.playerModal && !this.clickBlock) {
      this.clickBlock = true;
      const { PlayerModalComponent } = await import( '../player-modal/player-modal.component');
      this.playerModal = PlayerModalComponent;
    }

    const modalInstance = await this.modalCtrl.create({
      component: this.playerModal,
      swipeToClose: false,
      cssClass: 'full-modal',
    });
    await modalInstance.present();
    this.clickBlock = false;
  }

  async seekToTime(ev: any): Promise<void> {
    this.stopProp(ev);
    await this.player.seekToTime(ev.target.value);
    this.isScrubbing = false;
  }

  pauseSeeking(ev: any): void {
    this.stopProp(ev);
    this.isScrubbing = true;
    this.playbackTime = ev.target.value;
  }

  async togglePlay(e: any): Promise<void> {
    this.stopProp(e);
    if (this.player.get().playbackState === this.playbackStates.PAUSED) {
      await this.player.play();
    } else {
      await this.player.pause();
    }
  }
  stopProp(e: any): void {
    e.stopPropagation();
  }
  next(e: any): void {
    this.stopProp(e);
    this.player.skipToNextItem();
  }
  prev(e: any): void {
    this.stopProp(e);
    this.player.skipToPreviousItem();
  }
}
