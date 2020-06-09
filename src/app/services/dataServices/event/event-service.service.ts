import { Injectable } from '@angular/core';
import { Event } from '../../../dtos/event';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import * as fromApp from '../../../store/app.reducer';
import * as AppActitons from '../../../store/app.actions';
import * as fromAuth from '../../auth/store/auth.reducer';
import * as fromRoom from '../../../services/dataServices/room/store/room.reducer';
import * as RoomActions from '../../../services/dataServices/room/store/room.actions';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { Room, RoomUser, Color } from 'src/app/dtos/room';
import { Subscription } from 'rxjs';
import { LangService } from '../../lang/lang.service';
import { NotificationService } from '../../notification/notification.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/dtos/user';
import { COMMONS } from 'src/app/shared/commons';

@Injectable({ providedIn: "root" })
export class EventService {
  auth: Observable<fromAuth.State>;
  roomState: Observable<fromRoom.State>;
  joinedRooms: Room[];
  subscription = new Subscription();
  events: any[];

  _pageNo: number;
  user: User;

  constructor(
    private http: HttpClient,
    private store: Store<fromApp.AppState>,
    private authService: AuthService,
    private langService: LangService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.auth = this.store.select("authState");
    this.auth.subscribe(p => {
      if(p.user) {
        this.user = p.user;
      }
    })
    this.roomState = this.store.select("roomState");
    this._pageNo = 1;

    this.roomState.subscribe((p) => {
      if (p) this.joinedRooms = p.rooms;
    });
  }

  getEvents(search?: string) {
    let url = environment.serviceURL + "/events";
    let params: { pageNo: string; search?: string } = {
      pageNo: "1",
    };

    if (search) {
      params.search = search;
    }

    return this.http
      .get<Event[]>(url, {
        params,
      })
      .pipe(
        map((result: any) => {
          if (result) {
            this._pageNo = 2;
            let r = result.filter(
              (elem) => !this.joinedRooms.find(({ _id }) => elem._id === _id)
            );
            this.store.dispatch(new AppActitons.GetEvents(Object.values(r)));
          }
        }),
        catchError((error) => {
          if (error.status === 401) {
            this.authService.logoutUser();
          }
          throw error;
        })
      );
  }

  loadMoreEvents(search?: string) {
    let url = environment.serviceURL + "/events";
    let params: { pageNo: string; search?: string } = {
      pageNo: this._pageNo.toString()
    };

    if (search) {
      params.search = search;
    }

    return this.http
      .get<Event[]>(url, {
        params
      })
      .pipe(
        map((result: any) => {
          if (result) {
            let r = result.filter(
              (elem) => !this.joinedRooms.find(({ _id }) => elem._id === _id)
            );
            this.store.dispatch(
              new AppActitons.LoadMoreEvents(Object.values(r))
            );
            if (r && r.length > 0) this._pageNo++;
            return r;
          }
        }),
        catchError((error) => {
          if (error.status === 401) {
            this.authService.logoutUser();
          }
          throw error;
        })
      );
  }

  getEventById(id: string) {
    let url = environment.serviceURL + "/event/get/" + id;
    return this.http.get<Event>(url);
  }

  getEventsByModId(userId: string) {
    let url = environment.serviceURL + "/events/get/" + userId;
    return this.http.get<Event[]>(url);
  }

  addEvent(event: Event) {
    let url = environment.serviceURL + "/event/add";
    return this.http
      .post<any>(url, event)
      .subscribe((p) => {
        if (p._id) {
          let room: Room = { ...event, _id: p._id, users: [], messages: [] };
          room.moderatorUser = new User();
          room.moderatorUser = this.user;
          let roomUser = new RoomUser();
          roomUser.user = this.user;
          roomUser.color = new Color(COMMONS.getRandom(255), COMMONS.getRandom(255), COMMONS.getRandom(255), 1);
          room.users.push(roomUser);
          this.store.dispatch(new RoomActions.JoinRoom({ room: room as Room }));
          this.notificationService.notify(this.langService.get("eventCreateSuccess"),"OK");
          this.router.navigate(["/room/" + p._id]);
        }
      });
  }

  getTags() {
    let url = environment.serviceURL + "/tags";
    return this.http.get(url);
  }

}
