﻿import { Component, OnInit, NgZone } from '@angular/core';
import { UserService } from '../../../Service/user.service';
import { UserSession } from '../../../Services/userSession.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NotifierService } from 'angular-notifier';
import { environment } from '../../../../environments/environment';
import { AuthService, GoogleLoginProvider } from 'angular-6-social-login';

@Component({
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {
    JobId = 0;
    action = 0; //For Accept i.e 1 And Reject i.e 2 //For Approve i.e 3 And Deny i.e 4 
    Date = new Date();
    private notifier: NotifierService;
    hide = true;
    msg: string;
    loginFrm: FormGroup;
    email: any;
    private formSubmitAttempt: boolean;

    constructor(
        private socialAuthService: AuthService,
        private ngZone: NgZone,
        private fb: FormBuilder,
        private _userService: UserService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        notifier: NotifierService,
        private _userSession: UserSession) {
        this.notifier = notifier;
    }

    ngOnInit(): void {
        this.loginFrm = this.fb.group({
            userName: ['', Validators.required],
            password: ['', Validators.required]
        });
        this.activatedRoute.queryParams.subscribe((params: any) => {
            if (params['email']) {
                let model = {
                    email: params.email,
                    password: params.pa,
                    action: params.ac ? params.ac : 0,
                    absenceId: params.job ? params.job : "0"
                }
                this._userService.upprotectData('auth/unprotectdata', model).subscribe((unprotectedData: any) => {
                    this.action = params.ac;
                    this.email = unprotectedData.email;
                    if (this.action == 5) {
                        let model = {
                            ForUserVerification: 1,
                            IsCertified: 1,
                            Email: this.email
                        }
                        this._userService.updateUserStatus('auth/updateUserStatus', model).subscribe((data: any) => {
                            localStorage.removeItem('userToken');
                            localStorage.removeItem('userClaims');
                            let model = {
                                userName: unprotectedData.email,
                                password: unprotectedData.password
                            }
                            this.loginFrm.setValue(model);
                            this.onSubmit(this.loginFrm);
                        },
                            error => this.msg = <any>error);
                    }
                    else {
                        if (params.pa && params.email && params.job) {
                            localStorage.removeItem('userToken');
                            localStorage.removeItem('userClaims');
                            this.JobId = unprotectedData.absenceId;
                            this.action = params.ac;
                            let model = {
                                userName: unprotectedData.email,
                                password: unprotectedData.password
                            }

                            this.loginFrm.setValue(model);
                            this.onSubmit(this.loginFrm);
                        }
                        else if (params.pa && params.email) {
                            localStorage.removeItem('userToken');
                            localStorage.removeItem('userClaims');
                            let model = {
                                userName: unprotectedData.email,
                                password: unprotectedData.password
                            }
                            this.loginFrm.setValue(model);
                            this.onSubmit(this.loginFrm);
                        }
                    }
                },
                    error => this.notifier.notify('error', 'Link is not valid.'));
            }
        })
    }

    // ngOnInit(): void {
    //     this.loginFrm = this.fb.group({
    //         userName: ['', Validators.required],
    //         password: ['', Validators.required]
    //     });
    //     this.activatedRoute.queryParams.subscribe((params: any) => {
    //         if (params['email']) {
    //             this.action = params.ac;
    //             this.email = params.email;
    //                 if (this.action == 5) {
    //                     let model = {
    //                         ForUserVerification: 1,
    //                         IsCertified: 1,
    //                         Email: this.email
    //                     }
    //                     this._userService.updateUserStatus('auth/updateUserStatus', model).subscribe((data: any) => {
    //                         localStorage.removeItem('userToken');
    //                         localStorage.removeItem('userClaims');
    //                         let model = {
    //                             userName: params.email,
    //                             password: params.pa
    //                         }
    //                         this.loginFrm.setValue(model);
    //                         this.onSubmit(this.loginFrm);
    //                     },
    //                         error => this.msg = <any>error);
    //                 }
    //                 else {
    //                     if (params.pa && params.email && params.job) {
    //                         localStorage.removeItem('userToken');
    //                         localStorage.removeItem('userClaims');
    //                         this.JobId = params.job;
    //                         this.action = params.ac;
    //                         let model = {
    //                             userName: params.email,
    //                             password: params.pa
    //                         }

    //                         this.loginFrm.setValue(model);
    //                         this.onSubmit(this.loginFrm);
    //                     }
    //                     else if (params.pa && params.email) {
    //                         localStorage.removeItem('userToken');
    //                         localStorage.removeItem('userClaims');
    //                         let model = {
    //                             userName: params.email,
    //                             password: params.pa
    //                         }
    //                         this.loginFrm.setValue(model);
    //                         this.onSubmit(this.loginFrm);
    //                     }
    //                 }
    //         }
    //     },
    // );
    // }
           
        

    changeLang(lang: string) {
        if (lang === 'es') {
            localStorage.setItem('locale', 'es');
            location.reload();
        }

        if (lang === 'en') {
            localStorage.setItem('locale', 'en');
            location.reload();
        }
    }

    onSubmit(formData: any) {
        this.msg = "";
        if (this.loginFrm.valid) {
            this._userService.userAuthentication(environment.apiUrl, formData.value).subscribe((data: any) => {
                localStorage.setItem('userToken', data.token);
                this.GetUserClaims();
                // let promise = Promise.resolve(this.GetUserClaims());
                // promise.then((val) => this.router.navigate(['/home']
                // ).then(() => {
                //     this.notifier.notify( 'success', 'Successfully Login!' );
                // }));
            },
                (err: HttpErrorResponse) => {
                    if (err.error == 'NotCertified') {
                        this.notifier.notify('error', 'Please verify your account from welcome email.');
                        return;
                    }
                    else if (err.error == 'notactive') {
                        this.notifier.notify('error', 'Account inactivated. Contact your Subzz administrator.');
                        return;
                    }
                    else {
                        this.notifier.notify('error', err.statusText.toLowerCase() == "ok" || err.statusText.toLowerCase() == "unauthorized" ? "Invalid email or password" : "Invalid email or password");
                    }
                });
        }
        this.formSubmitAttempt = true;
    }

    // Login with Google
    public loginWithGoogle() {
        let socialPlatformProvider;
        socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
        this.socialAuthService.signIn(socialPlatformProvider).then(res =>
            this.signInSuccessWithGoogle(res), err => this.signInErrorWithGoogle(err));
    }

    isFieldInvalid(field: string) {
        return (
            (!this.loginFrm.get(field).valid && this.loginFrm.get(field).touched) ||
            (this.loginFrm.get(field).untouched && this.formSubmitAttempt)
        );
    }

    GetUserClaims(): void {
        this._userService.getUserClaims().subscribe((data: any) => {
            localStorage.setItem('userClaims', JSON.stringify(data));
            this._userSession.SetUserSession();

            if (data.roleId == 4) { // For Substitute
                if (this.activatedRoute.queryParams && this.JobId > 0) {
                    if (this.action == 1) {
                        this.AcceptJob(this.JobId);
                    }
                    else
                        this.declineJob(this.JobId);
                }
                else {
                    this.router.navigate(['/viewjobs'], { queryParams: { announcement: true } }
                    ).then(() => {
                    });
                }
            }
            else if (data.roleId == 3) { //For Employee
                this.router.navigate(['/absence'], { queryParams: { announcement: true } }
                ).then(() => {
                });
            }
            else {
                if (this.activatedRoute.queryParams && this.JobId > 0) {
                    if (this.action == 3 || this.action == 4) {
                        this.ApproveOrDenyLeave(this.JobId)
                    }
                    else {
                        this.router.navigate(['/home']).then(() => {
                        });
                    }
                }
                else {
                    this.router.navigate(['/home'], { queryParams: { announcement: true } }
                    ).then(() => {
                    });
                }
            }
        });
    }

    // On successfully login with Google
    private signInSuccessWithGoogle(res: any) {
        this.ngZone.run(() => {
            let object = {
                Email: res.email,
                Id: res.id,
                IdToken: res.idToken,
                Image: res.image,
                Name: res.name,
                Providor: res.provider,
                Token: res.token
            }
            //Currently Just saving its information in Table nothing else .This need to change accordingly.
            this._userService.userAuthenticationFromGoogle('auth/insertExternalUser', object).subscribe((data: any) => {
                this.notifier.notify('success', 'Successfully login with following google Email Id: ' + res.email);
                console.log(res);
            },
                (err: HttpErrorResponse) => {
                    this.notifier.notify('error', err.error.error_description);
                });
        });
    }

    AcceptJob(jobId: number) {
        this.router.navigate(['/viewjobs/myJobs'], { queryParams: { jobId: jobId, ac: this.action } });
    }

    declineJob(jobId: number) {
        this.router.navigate(['/viewjobs/availableJobs'], { queryParams: { jobId: jobId, ac: this.action } });
    }

    ApproveOrDenyLeave(jobId: number) {
        this.router.navigate(['/home'], { queryParams: { jobId: jobId, ac: this.action } });
    }

    // If Error occurred on login with Google
    private signInErrorWithGoogle(err) {
        this.notifier.notify('error', err);
    }

    //SetControlsState(isEnable: boolean) {
    //    isEnable ? this.loginFrm.enable() : this.loginFrm.disable();
    //}
}