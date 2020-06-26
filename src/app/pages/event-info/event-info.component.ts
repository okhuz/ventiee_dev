import { Component, OnInit, Inject, Injector } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/dtos/user';
import { RoomService } from 'src/app/services/dataServices/room/room.service';
import { Room, RoomUser } from 'src/app/dtos/room';
import * as fromRoom from '../../services/dataServices/room/store/room.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromApp from '../../store/app.reducer';
import { BaseComponent } from 'src/app/components/base/base.component';
import { AppService } from 'src/app/app.service';
import { ModalType } from 'src/app/components/generic-modal/generic-modal.component';
import { FeedbackTypes } from 'src/app/dtos/enums';
import { NewFeedbackComponent } from 'src/app/components/new-feedback/new-feedback.component';

@Component({
  selector: 'event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.scss']
})
export class EventInfoComponent extends BaseComponent implements OnInit {

  users: RoomUser[];
  roomState: Observable<fromRoom.State>;
  user: User;

  constructor(
    private roomService: RoomService,
    public dialogRef: MatDialogRef<any>,
    private store: Store<fromApp.AppState>,
    private appService: AppService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: {room: Room},
    injector: Injector
  ) {
    super(injector);
    this.user = this.authService.user;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.roomState = this.store.select('roomState');
    this.roomState.subscribe(p => {
      let room = p.rooms.find(r => r._id === this.data.room._id);
      if(room && (!room.users || room.users.length === 0)) this.roomService.getRoomUsers(this.data.room).subscribe(u => {
        this.users = u;
      })
      else {
        this.users = room.users;
      };
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  isModerator() {
    return this.data.room.moderatorUser._id === this.authService.user._id;
  }

  onKickUser(user: User) {
    this.roomService.kickUser(this.data.room._id, {_id: user._id, nickname: user.nickname});
  }

  cancelEvent() {
    this.appService.openModal(undefined, 'cancelQuestion', undefined, ModalType.Confirmation).subscribe(p => {
      if (p) {
        this.roomService.cancelEvent(this.data.room._id);
        this.dialogRef.close();
      }
    });
  }

  leaveEvent() {
    this.appService.openModal(undefined, 'leaveQuestion', undefined, ModalType.Confirmation).subscribe(p => {
      if (p) {
        this.roomService.leaveRoom(this.data.room._id, this.authService.user._id);
        this.dialogRef.close();
      }
    });
  }

  report(user?: User) {
    let data = {
      event: this.data.room,
      type: FeedbackTypes.report,
      ownerUser: this.user
    }
    if (user) data["user"] = user;
    const dialogRef = this.dialog.open(NewFeedbackComponent, {
      minWidth: '250px',
      maxWidth: '600px',
      data
    });
    dialogRef.afterClosed().subscribe(result => { });
  }

}
