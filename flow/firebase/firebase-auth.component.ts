import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef,MatSnackBar} from '@angular/material';
import { MAT_DIALOG_DATA} from '@angular/material';
import {FireService} from 'app/firebase/fire.service'
import * as firebase from "firebase";

@Component({
    selector: 'signIn-dialog',
    templateUrl: 'signIn-dialog.html',

    // styleUrls: ['./flow-context.component.css']
  })
  export class SignInDialog {
    email:string;
    password:string;
    password2:string;
    isRegisterMode:boolean;
    errorMessage : string;
    constructor(public dialogRef: MatDialogRef<SignInDialog>, @Inject(MAT_DIALOG_DATA) public data: any,private fire:FireService) {
         if (data.mode=="register") {
           this.isRegisterMode = true
         }
         console.dir(data)
    }
    public signIn() {
      // console.log("email = "+this.email)
      this.fire.signIn(this.email,this.password)
    }

    public switchRegisterMode() {
      this.isRegisterMode = true;
    }

    public registerUser() {
      if (this.password == this.password2) {
        this.fire.signUp(this.email,this.password)
      }else {
        this.errorMessage = "Passwords don't match.Correct and try again"
      }

    }
}

@Component({
  selector: 'firebase-auth-check',
  template:'<button mat-button (click)="signOut()" >Sign out</button>',
})
export class FirebaseAuthCheckComponent{
  private authState:string;
  constructor(private fire: FireService,public dialog: MatDialog) {
    this.authState = undefined;
    this.configureUserAuthListener()

  }

  public configureUserAuthListener() {

    firebase.auth().onAuthStateChanged((user)=> {
      if (user) {

        if (this.authState == undefined) {
          this.authState = "signed_in"
        }else {
          location.reload();
        }
        // User is signed in.
        // thuser = user;
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var uid = user.uid;
        var phoneNumber = user.phoneNumber;
        var providerData = user.providerData;

        // this.firebaseAuthUi.delete();
        user.getIdToken().then(function(accessToken) {

          document.getElementById('sign-in-status').textContent = 'Signed in';
          // document.getElementById('sign-in').textContent = 'Sign out';
          // document.getElementById('account-details').textContent = JSON.stringify({
          //   displayName: displayName,
          //   email: email,
          //   emailVerified: emailVerified,
          //   phoneNumber: phoneNumber,
          //   photoURL: photoURL,
          //   uid: uid,
          //   accessToken: accessToken,
          //   providerData: providerData
          // }, null, '  ');
        });
      } else {
        // User is signed out.
        // this.initFirebaseUi()
        this.authState = "signed_out";
        this.showSignInDialog();
        document.getElementById('sign-in-status').textContent = 'Signed out';
        // document.getElementById('sign-in').textContent = 'Sign in';
        // document.getElementById('account-details').textContent = 'null';
      }
    }, function(error) {

      console.log(error);
    });
  }

  signOut(){
    this.fire.signOut();
  }

  showSignInDialog() {
    let dialogRef = this.dialog.open(SignInDialog,{
      width: '350px',
      data:{"mode":"signIn"}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
      {

      }
    });
  }



}



// showSignInDialog() {
//   let dialogRef = this.dialog.open(SignInDialog,{
//     width: '450px',
//   });
//   dialogRef.afterClosed().subscribe(result => {
//     if (result)
//     {
//
//     }
//   });
//   }
