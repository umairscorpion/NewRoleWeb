import { Component, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataContext } from '../../../../Services/dataContext.service';
import { CommunicationService } from '../../../../Services/communication.service';
import { UserSession } from '../../../../Services/userSession.service';
import { NotifierService } from 'angular-notifier';
import { Absence } from '../../../../Model/absence';
import { DomSanitizer, SafeUrl } from '../../../../../../node_modules/@angular/platform-browser';
import { MyJobsComponent } from '../MyJobs/myJobs.component';
import { environment } from '../../../../../environments/environment';
import * as moment from 'moment';

@Component({
    selector: 'available-jobs',
    templateUrl: 'availableJobs.component.html'
})
export class AvailableJobsComponent implements OnInit {
    coloringAbsences = (d: Date) => {
        const date = d.getDate();
        let toSelectDefaultOptionForReason = this.myJobs.find((absence: Absence) => {
            if (new Date(absence.startDate).toDateString() == d.toDateString()
                || new Date(absence.endDate).toDateString() == d.toDateString()) {
                return true;
            }
        });
        return toSelectDefaultOptionForReason ? 'highlight-Jobs' : undefined;
    }
    @ViewChild(MyJobsComponent) private upcomingJobs: MyJobsComponent;
    AvailableJobCount: any;
    @Output() AvailableCountEvent = new EventEmitter<string>();
    ImageURL: SafeUrl = "";
    Organizations: any;
    Districts: any;
    CurrentDate: Date = new Date;
    FilterForm: FormGroup;
    myJobs: any;
    private notifier: NotifierService;
    msg: string;
    currentDate: Date = new Date();
    displayedColumns = ['AbsenceDate', 'Posted', 'Location', 'Employee', 'Notes', 'Attachment', 'Action'];
    AvailableJobs = new MatTableDataSource();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    FileStream: any;
    iamRequested: boolean;

    constructor(
        private _dataContext: DataContext,
        private _userSession: UserSession,
        private _formBuilder: FormBuilder,
        private _communicationService: CommunicationService,
        private sanitizer: DomSanitizer,
        notifier: NotifierService, ) {
        this.notifier = notifier;
    }
    ngAfterViewInit() {
        this.AvailableJobs.sort = this.sort;
        this.AvailableJobs.paginator = this.paginator;
    }

    GetAvailableJobs() {
        let StartDate = this.CurrentDate.toISOString();
        let EndDate = new Date();
        EndDate.setDate(this.currentDate.getDate() + 30);
        let UserId = this._userSession.getUserId();
        let DistrictId = this._userSession.getUserDistrictId();
        let Status = 1;
        this.FilterForm.get('FilterStartDate').setValue(this.CurrentDate);
        this.FilterForm.get('FilterEndDate').setValue(EndDate);
        this._dataContext.get('Job/getAvailableJobs' + "/" + StartDate + "/" + EndDate.toISOString() +
            "/" + UserId + "/" + "-1" + "/" + DistrictId + "/"+ false + "/" + Status).subscribe((data: Absence[]) => {
                this.AvailableJobs.data = data;
                this.AvailableJobCount = data.length;
                this.AvailableCountEvent.emit(this.AvailableJobCount);
            },
                error => this.msg = <any>error);
    }

    ngOnInit(): void {
        this.FilterForm = this._formBuilder.group({
            FilterStartDate: ['', Validators.required],
            FilterEndDate: ['', Validators.required],
            DistrictId: [{ disabled: true }, Validators.required],
            OrganizationId: ['-1', Validators.required],
            Requested: [false]
        });
        this.GetMyJobs();
        this.GetDistricts();
        this.GetOrganizations(this._userSession.getUserDistrictId());
        this.GetAvailableJobs();
    }

    GetOrganizations(DistrictId: number): void {
        this._dataContext.getById('School/getOrganizationsByDistrictId', DistrictId).subscribe((data: any) => {
            this.Organizations = data;
            // if (typeof this._userSession.getUserOrganizationId() != "undefined" && this._userSession.getUserOrganizationId() != "-1" && this._userSession.getUserOrganizationId())
            //     // this.absenceFirstFormGroup.get('OrganizationId').setValue(this._userSession.getUserOrganizationId());
            // this.absenceFirstFormGroup.controls['OrganizationId'].enable();
            // if (this._userSession.getUserRoleId() == 5) {
            //     this.absenceFirstFormGroup.get['OrganizationId'].setValue(this.Organizations[0].schoolId);
            // }
            // else {
            //     this.absenceFirstFormGroup.controls['OrganizationId'].disable();
            // }
        },
            error => <any>error);
    }

    GetDistricts(): void {
        this._dataContext.get('district/getDistricts').subscribe((data: any) => {
            this.Districts = data;
            this.FilterForm.get('DistrictId').setValue(this._userSession.getUserDistrictId());
            this.FilterForm.controls['DistrictId'].disable();
        },
            error => <any>error);
    }

    SearchAvailableJobs(SearchFilter: any): void {
        if (this.FilterForm.valid) {
            this._dataContext.get('Job/getAvailableJobs' + "/" + SearchFilter.value.FilterStartDate.toISOString() + "/"
                + SearchFilter.value.FilterEndDate.toISOString() + "/" + this._userSession.getUserId() + "/" + SearchFilter.value.OrganizationId +
                "/" + SearchFilter.getRawValue().DistrictId + "/" + SearchFilter.value.Requested + "/" + 1).subscribe((data: any) => {
                    this.AvailableJobs.data = data;
                    this.AvailableJobCount = data.length;
                    this.AvailableCountEvent.emit(this.AvailableJobCount)
                },
                    error => this.msg = <any>error);
        }
    }

    NotifyResponse(Message: string): void {
        if (Message == "success") {
            this.notifier.notify('success', 'Accepted Successfully.');
            this.GetAvailableJobs();
        }
        else if (Message == "Blocked") {
            this.notifier.notify('error', 'You Are Blocked By Employee To Accept This Job.');
            this.GetAvailableJobs();
        }
        else if (Message == "Cancelled") {
            this.notifier.notify('error', 'Job Has Been Cancelled.');
            this.GetAvailableJobs();
        }
        else if (Message == "Accepted") {
            this.notifier.notify('error', 'Job Already Accepted.');
            this.GetAvailableJobs();
        }
        else if (Message == "Conflict") {
            this.notifier.notify('error', 'Already Accepted Job on This Date.');
            this.GetAvailableJobs();
        }
        else {
            this.notifier.notify('error', 'Problem Occured While Process you Request.Please Try Again Later.');
        }
    }

    ShowJobDetail(AbsenceDetail: any) {
        AbsenceDetail.isShowAttachment = false;
        this._communicationService.ViewAbsenceDetail(AbsenceDetail);

    }
    ShowAttachment(AbsenceDetail: any) {
        AbsenceDetail.isShowAttachment = true;
        this._communicationService.ViewAbsenceDetail(AbsenceDetail);
    }

    viewFile(absence: Absence): void {
        if (!absence.attachedFileName && !absence.fileContentType)
            return;
        let model = { AttachedFileName: absence.attachedFileName, FileContentType: absence.fileContentType }
        this._dataContext.getFile('Absence/getfile', model).subscribe((blob: any) => {
            let newBlob = new Blob([blob]);
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(newBlob);
                return;
            }
            // To open in browser
            var file = new Blob([blob], { type: absence.fileContentType });
            window.open(URL.createObjectURL(file));
        },
            error => this.msg = <any>error);
    }

    GetMyJobs() {
        let StartDate = new Date();
        let EndDate = new Date();
        StartDate.setDate(this.currentDate.getDate() - 150);
        EndDate.setDate(this.currentDate.getDate() + 150);
        let UserId = this._userSession.getUserId();
        let DistrictId = this._userSession.getUserDistrictId();
        let Status = 2;
        this._dataContext.get('Job/getAvailableJobs' + "/" + StartDate.toISOString() + "/" + EndDate.toISOString() +
            "/" + UserId + "/" + "-1" + "/" + DistrictId + "/" + false + "/" + Status).subscribe((data: any) => {
                this.myJobs = data;
            },
                error => this.msg = <any>error);
    }

    getProfilePic(ProfilePictureName: string): SafeUrl {
        if (ProfilePictureName && ProfilePictureName.length > 0) {
            return this.sanitizer.bypassSecurityTrustResourceUrl(environment.apiUrl + '/wwwroot/Profile/' + ProfilePictureName);
        }
    }

    AcceptAbsence(SelectedRow: any) {
        let currentTime = moment().format('h:mma');
        let currentDate = moment().format('YYYY MM DD');
        // let starttimetemp = moment(SelectedRow.startTime, 'h:mma');
        // let starttime = moment(starttimetemp).format('h:mma');
        let startdate = moment(SelectedRow.startDate).format('YYYY MM DD');
        let endtimetemp = moment(SelectedRow.endTime, 'h:mma');
        let endtime = moment(endtimetemp).format('h:mma');

        if (currentDate == startdate) {
            if (currentTime > endtime) {
                this.notifier.notify('error', 'Job has ended, you cannot accept it.');
            }
            else {
                let confirmResult = confirm('Are you sure you want to Accept this Job?');
                if (confirmResult) {
                    this._dataContext.get('Job/acceptJob/' + SelectedRow.absenceId + "/" + this._userSession.getUserId() + "/" + "WebApp").subscribe((response: any) => {
                        this.NotifyResponse(response as string);
                        this.GetAvailableJobs();
                        this.upcomingJobs.GetUpcommingJobs();
                    },
                        error => this.msg = <any>error);
                }
            }
        }
        else {
            if (startdate > currentDate) {
                let confirmResult = confirm('Are you sure you want to Accept this Job?');
                if (confirmResult) {
                    this._dataContext.get('Job/acceptJob/' + SelectedRow.absenceId + "/" + this._userSession.getUserId() + "/" + "WebApp").subscribe((response: any) => {
                        this.NotifyResponse(response as string);
                        this.GetAvailableJobs()
                        this.upcomingJobs.GetUpcommingJobs();
                    },
                        error => this.msg = <any>error);
                }
            }
            else {
                this.notifier.notify('error', 'Something Went Wrong.');
            }
        }
    }
}