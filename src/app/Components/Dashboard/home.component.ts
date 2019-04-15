﻿import { Component, ViewContainerRef, ChangeDetectorRef, OnDestroy, HostBinding, Input } from "@angular/core";
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { UserService } from '../../Service/user.service';
import { SideNavService } from '../SideNav/sideNav.service';
import { Chart } from 'chart.js'
import { LeaveRequest } from "../../Model/leaveRequest";
import { AbsenceService } from "../../Services/absence.service";
import { UserSession } from "../../Services/userSession.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'Subzz-app-dashboard',
    templateUrl: `home.component.html`,
    styleUrls: ['home.component.css']
})

export class HomeComponent {
    submittedLeaveRequests: LeaveRequest[];
    absenceSummary: any;
    absenceReason: any;
    filledunfilledAbsence: any;
    @HostBinding('class.is-open')
    userTemplate: any;
    mobileQuery: MediaQueryList;
    private _mobileQueryListener: () => void;

    UserClaim: any;
    msg: string;
    UserName: string;
    isOpen = true;
    constructor(private router: Router, private _userService: UserService, private sideNavService: SideNavService,
        changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private absenceService: AbsenceService,
        private userSession: UserSession) {
        // this.toastr.setRootViewContainerRef(vcr);
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnInit(): void {
        this.GetLeaveRequests();
        this.absenceSummary = new Chart('absenceSummary', {
            type: 'bar',
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    label: 'Absence Summary',
                    data: [12, 19, 3, 5, 1, 1, 12, 19, 3, 5, 1, 1],
                    backgroundColor: [
                        '#73dad9',
                        '#b1ddc4',
                        '#fde1c5',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        '#e8f1dc',
                        '#73dad9',
                        '#b1ddc4',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        '#f3f4f5',
                        '#e8f1dc'
                    ],
                    borderColor: [
                        '#72b8b7',
                        '#7cbb98',
                        '#f5c89b',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        '#c3cfb4',
                        '#72b8b7',
                        '#7cbb98',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        '#c7dcf2',
                        '#c3cfb4'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        this.absenceReason = new Chart('absenceReason', {
            type: 'horizontalBar',
            data: {
                labels: ["Personal Leave", "illness Self", "Other", "PD"],
                datasets: [{
                    label: 'Absence Reason',
                    data: [12, 19, 3, 5],
                    backgroundColor: [
                        '#73dad9',
                        '#b1ddc4',
                        'rgba(255, 206, 86, 0.2)',
                        '#c1dbed'
                    ],
                    borderColor: [
                        '#72b8b7',
                        '#7cbb98',
                        'rgba(255, 206, 86, 1)',
                        '#a1c6e0',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        this.filledunfilledAbsence = new Chart('filledunfilledAbsence', {
            type: 'bar',
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    label: 'Filled',
                    data: [12, 19, 3, 5, 1, 1, 12, 19, 3, 5, 1, 1],
                    backgroundColor: [
                        '#73dad9',
                        '#73dad9',
                        '#73dad9',
                        '#73dad9',
                        '#73dad9',
                        '#73dad9',
                        '#73dad9',
                        '#73dad9',
                        '#73dad9',
                        '#73dad9',
                        '#73dad9',
                        '#73dad9'
                    ],
                    borderColor: [
                        '#72b8b7',
                        '#72b8b7',
                        '#72b8b7',
                        '#72b8b7',
                        '#72b8b7',
                        '#72b8b7',
                        '#72b8b7',
                        '#72b8b7',
                        '#72b8b7',
                        '#72b8b7',
                        '#72b8b7',
                        '#72b8b7',
                    ],
                    borderWidth: 1
                },
                {
                    label: 'Unfilled',
                    data: [12, 19, 3, 5, 1, 1, 12, 19, 3, 5, 1, 1],
                    backgroundColor: [
                        '#b1ddc4',
                        '#b1ddc4',
                        '#b1ddc4',
                        '#b1ddc4',
                        '#b1ddc4',
                        '#b1ddc4',
                        '#b1ddc4',
                        '#b1ddc4',
                        '#b1ddc4',
                        '#b1ddc4',
                        '#b1ddc4',
                        '#b1ddc4'
                    ],
                    borderColor: [
                        '#7cbb98',
                        '#7cbb98',
                        '#7cbb98',
                        '#7cbb98',
                        '#7cbb98',
                        '#7cbb98',
                        '#7cbb98',
                        '#7cbb98',
                        '#7cbb98',
                        '#7cbb98',
                        '#7cbb98',
                        '#7cbb98'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        this.sideNavService.change.subscribe((isOpen: any) => {
            this.isOpen = isOpen;
        });
        this.LoadUserResources();
    }
    LoadUserResources(): void {
        let resourceTypeId = 2;
        let parentResourceTypeId = -1;
        let adminPortal = 0;
        this._userService.getUserResources(resourceTypeId, parentResourceTypeId, adminPortal).subscribe((data: any) => {
            this.userTemplate = data;
        },
            error => this.msg = <any>error);
    }
    toggle() {
    }

    GetLeaveRequests(): void {
        let districtId = this.userSession.getUserDistrictId();
        let organizationId = this.userSession.getUserOrganizationId() ? this.userSession.getUserOrganizationId() : '-1';
        this.absenceService.getLeaveRequests(districtId, organizationId).subscribe((leaveRequests: LeaveRequest[]) => {
            this.submittedLeaveRequests = leaveRequests.filter(t => t.isApproved === false && t.isDeniend === false);
        },
            error => this.msg = <any>error);
    }

    onApproveClick(leaveRequestId: number) {
        let leaveStatusModel = {
            LeaveRequestId: leaveRequestId,
            IsApproved: 1,
            IsDeniend: 0,
            isArchived: 0
        }
        this.absenceService.post('Leave/updateLeaveRequestStatus', leaveStatusModel).subscribe((data: any) => {
            this.GetLeaveRequests();
            // this.toastr.success('Status Updated Successfully!', 'Success!');
        },
            (err: HttpErrorResponse) => {
                // this.toastr.error(err.error.error_description, 'Oops!');
            });
    }

    onDenyClick(leaveRequestId: number) {
        let leaveStatusModel = {
            leaveRequestId: leaveRequestId,
            isApproved: 0,
            isDeniend: 1,
            isArchived: 0
        }
        this.absenceService.post('Leave/updateLeaveRequestStatus', leaveStatusModel).subscribe((data: any) => {
            this.GetLeaveRequests();
        },
            (err: HttpErrorResponse) => {
            });
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }
}