import { Component, ChangeDetectorRef, HostBinding, Inject } from '@angular/core';
import { UserService } from '../../Service/user.service';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { TimeClockService } from '../../Services/timeClock.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { SideNavService } from '../SideNav/sideNav.service';
import { CommunicationService } from '../../Services/communication.service';
import { UserSession } from '../../Services/userSession.service';
import { OnInit, ViewChild } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeClock } from 'src/app/Model/timeclock'
import * as moment from 'moment';
import { EmployeeService } from 'src/app/Service/Manage/employees.service';
import { DataContext } from 'src/app/Services/dataContext.service';
import { t } from '@angular/core/src/render3';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TimeClockFilter } from 'src/app/Model/timeclock.filter';

@Component({
    // selector:'time-clock',
    templateUrl: 'timeClock.component.html',
    styleUrls: ['timeClock.component.scss']
})
export class TimeClockComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    totalMinutes: any;
    totalBreaks: any;
    withoutBreaks: any;
    date: string = moment().format('dddd, MM/DD/YYYY');
    time: string = moment().format('h:mma');
    displayedColumns = ['Date', 'Clockin', 'Clockout', 'Length', 'Break'];
    msg: string;
    indLoading: boolean = false;
    modalTitle: string;
    modalBtnTitle: string;
    substituteDataSource = new MatTableDataSource();
    mobileQuery: MediaQueryList;
    private _mobileQueryListener: () => void;
    private notifier: NotifierService;
    sideNavMenu: any;
    isOpen = true;
    userRole: number = this._userSession.getUserRoleId();
    startDate: string = moment().format('dddd, MM/DD/YYYY');
    startTime: string = moment().format('h:mma');
    userId: string = this._userSession.getUserId();
    timeClockDetail = new MatTableDataSource();
    private timeClockFormGroup: FormGroup;
    CurrentDate: Date = new Date;


    constructor(private router: Router,
        private _userService: UserService,
        public dialog: MatDialog,
        private dataContext: DataContext,
        private _formBuilder: FormBuilder,
        private sideNavService: SideNavService,
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        private _userSession: UserSession,
        private timeClockService: TimeClockService,
        notifier: NotifierService,
        private _communicationService: CommunicationService,
        private employeeService: EmployeeService) {
        this.notifier = notifier;
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnInit(): void {
        // this.GetTimeClockData();
        this.GetTimeClockDataWithFilter();
        this.LoadSideNavMenu();
        this.GenerateForms();
        this.sideNavService.change.subscribe((isOpen: any) => {
            this.isOpen = isOpen;
        });
    }


    ngAfterViewInit() {
        this.timeClockDetail.sort = this.sort;
        this.timeClockDetail.paginator = this.paginator;
    }

    LoadSideNavMenu(): void {
        let resourceTypeId = 2;
        let parentResourceTypeId = -1;
        let adminPortal = 0;
        this._userService.getUserResources(resourceTypeId, parentResourceTypeId, adminPortal).subscribe((data: any) => {
            this.sideNavMenu = data;
        },
            error => this.msg = <any>error);
    }

    GenerateForms(): void {
        this.timeClockFormGroup = this._formBuilder.group({
            viewDataBy: ['1']
        });
    }
   
    checkTimeClock(): boolean {
        return this.timeClockFormGroup.get('viewDataBy').value != "2" ? true : false;
    }

    clockInClick() {
        this.dataContext.get('Time/Timeclockstatus').subscribe((respose: any) => {
            if (respose == 'Clock In' || respose == 'Return') {
                this.notifier.notify('error', 'Already Clock In.');
                this.GetTimeClockDataWithFilter();
            }
            else if (respose == 'Break') {
                this.timeClockService.return('Time/Return', this.userId).subscribe((respose: any) => {
                    if (respose == 1) {
                        this.notifier.notify('success', 'Return Successfully.');
                    }
                },
                    (err: HttpErrorResponse) => {
                    });
            }
            else {
                this.timeClockService.clockin('Time/ClockIn', this.userId).subscribe((respose: any) => {
                    if (respose == 1) {
                        this.notifier.notify('success', 'Clock In Successfully.');
                        this.GetTimeClockDataWithFilter();
                    }
                },
                    (err: HttpErrorResponse) => {
                    });
            }

        },
            (err: HttpErrorResponse) => {
            });
    }

    breakClick() {
        this.dataContext.get('Time/Timeclockstatus').subscribe((respose: any) => {
            if (respose == 'Break') {
                this.notifier.notify('error', 'Already On Break.');
                this.GetTimeClockDataWithFilter();
            }
            else if (respose == 'Clock Out') {
                this.notifier.notify('error', 'Please Clock In First.');
                this.GetTimeClockDataWithFilter();
            }
            else {
                this.timeClockService.break('Time/Break', this.userId).subscribe((respose: any) => {
                    if (respose == 1) {
                        this.notifier.notify('success', 'On Break.');
                        this.GetTimeClockDataWithFilter();
                    }
                },
                    (err: HttpErrorResponse) => {
                    });
            }

        },
            (err: HttpErrorResponse) => {
            });
    }

    returnClick() {
        this.timeClockService.return('Time/Return', this.userId).subscribe((respose: any) => {
            if (respose == 1) {
                this.notifier.notify('success', 'Return Successfully.');
            }
        },
            (err: HttpErrorResponse) => {
            });
    }

    clockOutClick() {
        this.dataContext.get('Time/Timeclockstatus').subscribe((respose: any) => {
            if (respose == 'Clock Out') {
                this.notifier.notify('error', 'Please Clock In First.');
                this.GetTimeClockDataWithFilter();
            }
            else {
                this.timeClockService.clockout('Time/Clockout', this.userId).subscribe((respose: any) => {
                    if (respose == 1) {
                        this.notifier.notify('success', 'Clock Out Successfully.');
                        this.GetTimeClockDataWithFilter();
                    }
                },
                    (err: HttpErrorResponse) => {
                    });
            }

        },
            (err: HttpErrorResponse) => {
            });
    }

    GetTimeClockData() {
        this.timeClockService.TimeClockData('Time/timeclockdata').subscribe((data: TimeClock[]) => {
            this.timeClockDetail.data = data;
            this.totalMinutes = data.map((t: TimeClock) => t.totalMinutes).reduce((acc, value) => acc + value, 0);
        },
            error => this.msg = <any>error);
    }

    GetTimeClockDataWithFilter() {
        const filters = TimeClockFilter.initial();
             filters.isDaysSelected = 0;
             filters.startDate = moment().subtract(7, 'days').toISOString();
             filters.endDate = moment(new Date()).toISOString();
             this.timeClockService.getTimeClockSummary(filters).subscribe((data: TimeClock[]) => {
                 this.timeClockDetail.data = data;
                 this.totalMinutes = data.map((t: TimeClock) => t.totalMinutes).reduce((acc, value) => acc + value, 0);
                 this.totalBreaks = data.filter((t: TimeClock) => t.status === 1).length;
                 this.withoutBreaks = data.filter((t: TimeClock) => t.status === 0).length;
             },
                error => this.msg = <any>error);
    }

    OnchangeTimeClockView(Datatype: number) {
        if (+Datatype === 1) {
             this.GetTimeClockDataWithFilter();
        }
        else {
             const filters = TimeClockFilter.initial();
             filters.isDaysSelected = 1;
             filters.startDate = moment().subtract(7, 'days').toISOString();
             filters.endDate = moment(new Date()).toISOString();
             this.timeClockService.getTimeClockSummary(filters).subscribe((data: TimeClock[]) => {
                 this.timeClockDetail.data = data;
                 this.totalMinutes = data.map((t: TimeClock) => t.totalMinutes).reduce((acc, value) => acc + value, 0);
                 this.totalBreaks = data.filter((t: TimeClock) => t.status === 1).length;
                 this.withoutBreaks = data.filter((t: TimeClock) => t.status === 0).length;

             },
                 error => this.msg = <any>error);
        }

    }

}