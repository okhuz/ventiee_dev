import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';

import { StoreModule } from '@ngrx/store';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopNavigationComponent } from './layout/top-navigation/top-navigation.component';
import { LeftNavigationComponent } from './layout/left-navigation/left-navigation.component';
import { MainPageComponent } from './layout/main-page/main-page.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';



/** Material Components */
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon'; 
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 

/** Reducers */
import { appReducer } from './services/app/store/app.reducer';
import { SignUpComponent } from './pages/sign-up/sign-up.component';



@NgModule({
    declarations: [
        AppComponent,
        TopNavigationComponent,
        LeftNavigationComponent,
        MainPageComponent,
        HomeComponent,
        LoginComponent,
        SignUpComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
        StoreModule.forRoot({ app: appReducer }),
        /** Material Components */
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    providers: [{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }],
    bootstrap: [AppComponent]
})
export class AppModule { }
