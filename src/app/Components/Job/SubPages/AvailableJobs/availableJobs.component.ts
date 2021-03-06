import { Component, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataContext } from '../../../../Services/dataContext.service';
import { CommunicationService } from '../../../../Services/communication.service';
import { UserSession } from '../../../../Services/userSession.service';
import { NotifierService } from 'angular-notifier';
import { Absence } from '../../../../Model/absence';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MyJobsComponent } from '../MyJobs/myJobs.component';
import { environment } from '../../../../../environments/environment';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { ActivatedRoute } from '../../../../../../node_modules/@angular/router';
import { AvailabilityService } from 'src/app/Services/availability.service';
import { ShowSchoolFilesPopupComponent } from 'src/app/Shared/show-school-files-popup/show-school-files-popup.component';
import { FileService } from 'src/app/Services/file.service';
import { FileManager } from 'src/app/Model/FileSystem/fileManager.detail';
import { ShowAnnouncementPopupComponent } from 'src/app/Components/Announcement/show-announcement-popup/show-announcement-popup.component';
import { Announcement } from 'src/app/Model/announcement';
import { DeclinePopupComponent } from '../../popus/decline-popup/decline-popup.component';

@Component({
    selector: 'available-jobs',
    templateUrl: 'availableJobs.component.html',
    styleUrls: ['availableJobs.component.scss']
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
    displayedColumns = ['AbsenceDate', 'JobId', 'Posted', 'Location', 'Employee', 'Notes', 'Attachment', 'Action'];
    AvailableJobs = new MatTableDataSource();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    FileStream: any;
    iamRequested: boolean;
    Files = [];
    UserClaim: any;
    // For Announcements
    Announcements: Announcement[] = Array<Announcement>();
    IsAnnouncementViewed: boolean = false;

    constructor(
        private _dataContext: DataContext,
        private _userSession: UserSession,
        private _formBuilder: FormBuilder,
        private _communicationService: CommunicationService,
        private sanitizer: DomSanitizer,
        notifier: NotifierService,
        private activatedRoute: ActivatedRoute,
        private availabilityService: AvailabilityService,
        private dialogRef: MatDialog,
        private _fileService: FileService) {
        this.notifier = notifier;
    }

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe((params: any) => {
            if (params.jobId && params.ac == 2) {
                this.DeclineAbsence(params.jobId)
            }
            else if (params.announcement) {
                let UserRoleId = this._userSession.getUserRoleId();
                if (UserRoleId === 4) {
                    this.GetAndViewAnnouncement();
                }
            }
        })
        this.FilterForm = this._formBuilder.group({
            FilterStartDate: ['', Validators.required],
            FilterEndDate: ['', Validators.required],
            DistrictId: ['', Validators.required],
            OrganizationId: ['-1', Validators.required],
            Requested: [false]
        });
        this.UserClaim = JSON.parse(localStorage.getItem('userClaims'));
        this.FilterForm.get('DistrictId').setValue(this.UserClaim.districtName);
        this.FilterForm.controls['DistrictId'].disable();
        this.GetMyJobs();
        this.GetOrganizations(this._userSession.getUserDistrictId());
        this.GetAvailableJobs();
        this.getSchoolFiles();
    }

    ngAfterViewInit() {
        this.AvailableJobs.sort = this.sort;
        this.AvailableJobs.paginator = this.paginator;
    }

    GetAvailableJobs() {
        let EndDate = new Date();
        EndDate.setDate(this.currentDate.getDate() + 30);
        let model = {
            StartDate: this.CurrentDate.toISOString(),
            EndDate: EndDate.toISOString(),
            SubstituteId: this._userSession.getUserId(),
            DistrictId: this._userSession.getUserDistrictId(),
            Status: 1,
        }
        this.FilterForm.get('FilterStartDate').setValue(this.CurrentDate);
        this.FilterForm.get('FilterEndDate').setValue(EndDate);
        this._dataContext.post('Job/getAvailableJobs', model).subscribe((data: Absence[]) => {
            this.AvailableJobs.data = data;
            this.AvailableJobCount = data.length;
            this.AvailableCountEvent.emit(this.AvailableJobCount);
        },
            error => this.msg = <any>error);
    }

    GetOrganizations(DistrictId: number): void {
        this._dataContext.getById('School/getOrganizationsByDistrictId', DistrictId).subscribe((data: any) => {
            this.Organizations = data;
        },
            error => <any>error);
    }

    SearchAvailableJobs(SearchFilter: any): void {
        let model = {
            StartDate: SearchFilter.value.FilterStartDate.toISOString(),
            EndDate: SearchFilter.value.FilterEndDate.toISOString(),
            SubstituteId: this._userSession.getUserId(),
            DistrictId: this._userSession.getUserDistrictId(),
            Status: 1,
            OrganizationId: SearchFilter.value.OrganizationId,
            Requested: SearchFilter.value.Requested
        }
        if (this.FilterForm.valid) {
            this._dataContext.post('Job/getAvailableJobs', model).subscribe((data: any) => {
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
            this.notifier.notify('error', 'This Job is locked.');
            this.GetAvailableJobs();
        }
        else if (Message == "Cancelled") {
            this.notifier.notify('error', 'Job Has Been Cancelled.');
            this.GetAvailableJobs();
        }
        else if (Message == "Accepted") {
            this.notifier.notify('error', 'Job is no longer available.');
            this.GetAvailableJobs();
        }
        else if (Message == "Conflict") {
            this.notifier.notify('error', 'Already Accepted Job on This Date.');
            this.GetAvailableJobs();
        }
        else if (Message == "Declined") {
            this.notifier.notify('success', 'Declined Successfully.');
            this.GetAvailableJobs();
        }
        else if (Message == "Unavailable") {
            this.notifier.notify('error', 'Unable to accept, status set to unavailable.');
            this.GetAvailableJobs();
        }
        else {
            this.notifier.notify('error', 'Problem Occured While Process your Request. Please Try Again Later.');
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
        let model = {
            StartDate: StartDate.toISOString(),
            EndDate: EndDate.toISOString(),
            SubstituteId: this._userSession.getUserId(),
            DistrictId: this._userSession.getUserDistrictId(),
            Status: 2,
        }
        this._dataContext.post('Job/getAvailableJobs', model).subscribe((data: any) => {
            this.myJobs = data;
        },
            error => this.msg = <any>error);
    }

    getImage(imageName: string) {
        if (imageName && imageName.length > 0) {
            return this.sanitizer.bypassSecurityTrustResourceUrl(environment.profileImageUrl + imageName);
        }
    }

    AcceptAbsence(SelectedRow: any) {
        let currentTime = moment();
        let currentDate = moment().format('YYYY MM DD');
        let startdate = moment(SelectedRow.startDate).format('YYYY MM DD');
        let endtime = moment(SelectedRow.endTime, 'h:mma');
        let model = {
            startDate: moment(SelectedRow.startDate).format('YYYY-MM-DD'),
            endDate: moment(SelectedRow.endDate).format('YYYY-MM-DD'),
            startTime: SelectedRow.startTime,
            endTime: SelectedRow.endTime,
            UserId: this._userSession.getUserId()
        }
        this.availabilityService.CheckSubstituteAvailability(model).subscribe((response: any) => {
            if (currentDate == startdate) {
                if (currentTime > endtime) {
                    this.notifier.notify('error', 'Job has ended, you cannot accept it.');
                }
                else {
                    swal.fire({
                        title: 'Accept',
                        text:
                            'Are you sure you want to Accept this Job ?',
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonClass: 'btn btn-danger',
                        cancelButtonClass: 'btn btn-success',
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No',
                        buttonsStyling: false
                    }).then(r => {
                        if (r.value) {
                            this._dataContext.get('Job/acceptJob/' + SelectedRow.absenceId + "/" + this._userSession.getUserId() + "/" + "Web").subscribe((response: any) => {
                                this.NotifyResponse(response as string);
                                this.GetAvailableJobs();
                                this.upcomingJobs.GetUpcommingJobs();
                            },
                                error => this.msg = <any>error);
                        }
                    });
                }
            }
            else {
                if (startdate > currentDate) {
                    swal.fire({
                        title: 'Accept',
                        text:
                            'Are you sure you want to Accept this Job ?',
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonClass: 'btn btn-danger',
                        cancelButtonClass: 'btn btn-success',
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No',
                        buttonsStyling: false
                    }).then(r => {
                        if (r.value) {
                            this._dataContext.get('Job/acceptJob/' + SelectedRow.absenceId + "/" + this._userSession.getUserId() + "/" + "Web").subscribe((response: any) => {
                                this.NotifyResponse(response as string);
                                this.GetAvailableJobs()
                                this.upcomingJobs.GetUpcommingJobs();
                            },
                                error => this.msg = <any>error);
                        }
                    });
                }
                else {
                    this.notifier.notify('error', 'Something Went Wrong.');
                }
            }
        },
            error => this.msg = <any>error);
    }

    DeclineAbsence(absenceId: any) {
        const dialog = this.dialogRef.open(
            DeclinePopupComponent, {
            panelClass: 'release-decline-dialog',
            data: absenceId
        }
        );
        dialog.afterClosed().subscribe(result => {
            if (result != null) {
                let model = {
                    AbsenceId: absenceId,
                    Status: 9,
                    EmployeeId: this._userSession.getUserId(),
                    ForReason: true,
                    ReasonId: result.reasonId,
                    ReasonText: result.reasonText
                }
                this._dataContext.post('Job/DeclineJob/', model).subscribe((response: any) => {
                    this.NotifyResponse(response as string);
                    this.GetAvailableJobs();
                    this.upcomingJobs.GetUpcommingJobs();
                },
                    error => this.msg = <any>error);
            }
            else {
                this.notifier.notify('error', 'Something Went Wrong.');
            }
        });
    }

    getSchoolFiles(): void {
        let model = {
            fileType: "School Files"
        }
        this._fileService.getFile(model).subscribe((respose: FileManager[]) => {
            this.Files = respose;

        });
    }

    ShowSchoolFiles() {
        const dialogEdit = this.dialogRef.open(
            ShowSchoolFilesPopupComponent, {
            panelClass: 'school-files-dialog',
            data: this.Files
        }
        );
        dialogEdit.afterClosed().subscribe(result => {
        });
    }

    GetAndViewAnnouncement() {
        let model = {
            DistrictId: this._userSession.getUserDistrictId(),
            OrganizationId: this._userSession.getUserOrganizationId()
        }
        this._dataContext.post('announcement/getAnnouncement', model).subscribe((data: any) => {
            this.Announcements = data;
            if (data.length > 0) {
                this.dialogRef.open(
                    ShowAnnouncementPopupComponent, {
                    panelClass: 'announcements-dialog',
                    data: this.Announcements
                }
                );
            }
        },
            error => <any>error);
    }
}