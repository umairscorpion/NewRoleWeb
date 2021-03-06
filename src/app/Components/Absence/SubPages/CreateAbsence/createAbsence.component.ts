import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, Output, EventEmitter } from '@angular/core';
import { EmployeeService } from '../../../../Service/Manage/employees.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IDistrict } from '../../../../Model/Manage/district';
import { DataContext } from '../../../../Services/dataContext.service';
import { UserSession } from '../../../../Services/userSession.service';
import { MatStepper } from '@angular/material/stepper';
import { IEmployee } from '../../../../Model/Manage/employee';
import { MatRadioChange, MatExpansionPanel, MatDialog } from '@angular/material';
import { HttpClient, HttpResponse, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { NotifierService } from 'angular-notifier';
import { LeaveType } from '../../../../Model/leaveType';
import { AbsenceService } from '../../../../Services/absence.service';
import { environment } from '../../../../../environments/environment';
import { User } from '../../../../Model/user';
import { AbsenceScope } from '../../../../Model/absenceScope';
import { DomSanitizer } from '@angular/platform-browser';
import { Absence } from '../../../../Model/absence';
import { LeaveBalance } from '../../../../Model/leaveBalance';
import { Announcement } from 'src/app/Model/announcement';
import { ShowAnnouncementPopupComponent } from 'src/app/Components/Announcement/show-announcement-popup/show-announcement-popup.component';
import { ActivatedRoute } from '@angular/router';
import { moment } from 'fullcalendar';
import { CommunicationService } from 'src/app/Services/communication.service';

@Component({
    selector: 'create-absence',
    templateUrl: 'createAbsence.component.html',
    styleUrls: ['createAbsence.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CreateAbsenceComponent implements OnInit, OnDestroy {
    private notifier: NotifierService;
    @Output() refreshBalance = new EventEmitter<string>();
    @ViewChild(CreateAbsenceComponent) private createAbsenceComponent: CreateAbsenceComponent;
    @Output() refreshEmployeeBalance: EventEmitter<any> = new EventEmitter();
    @Output() refreshBalances = new EventEmitter();
    @ViewChild('preferredSubPanel') preferredSubPanel: MatExpansionPanel;
    matIcon = 'keyboard_arrow_down' || 'keyboard_arrow_up';
    // For Blocking Dates Renderer for Current month when open Calendar
    SelectionFilterForAlreadyCreatedAbsences = (d: Date): boolean => {
        const day = d.getDay();
        return d.toLocaleDateString() !== "10/1/2018";
        // (day !== 0 && day !== 6) &&
    }
    dateClass = (d: Date) => {
        if (this.EmployeeSchedule) {
            const date = d.getDate();
            let toSelectDefaultOptionForReason = this.EmployeeSchedule.find((absence: any) => {
                if (new Date(absence.startDate).toDateString() == d.toDateString()
                    || new Date(absence.endDate).toDateString() == d.toDateString()) {
                    return true;
                }
            });
            return toSelectDefaultOptionForReason ? 'highlight-Jobs' : undefined;
        }
        else {
            return undefined;
        }
    }
    // var for Preferred Sub 
    ContactSub: string = '1';
    DisableContactSubTimeAccess: boolean = true;
    isApprovalNeeded: boolean = false;
    PreferredSubstitutes: any;
    CurrentDate: Date = new Date();
    EmployeeSchedule: any;
    AllAttachedFiles: any;
    //File name to make it unique
    AttachedFileName: string;
    CompletedPercentage: number;
    SuccessMessage: boolean;
    TeachingLevels: any;
    teachingSubjects: any;
    isLinear = true;
    absenceFirstFormGroup: FormGroup;
    absenceSecondFormGroup: FormGroup;
    LeaveRequestForm: FormGroup;
    EmployeeIdForAbsence: string;
    EmployeeNameForAbsence: string;
    thirFormGroup: FormGroup;
    Leaves: any;
    loginedUserLocationTime: any = null;
    Districts: IDistrict[];
    Organizations: any;
    positions: any;
    Employees: Observable<IEmployee[]>;
    msg: string;
    OriginalFileName: string;
    AttachedFileType: string;
    AttachedFileExtention: string;
    OriginalFileNameForDisplay: string;
    SubstituteList: Observable<IEmployee[]>;
    loginedUserLevel: number = 0;
    AbsenceForUserLevel: number = 0;
    loginedUserRole: number = 0;
    loginedUserType: number = 0;
    loginDistrictId: any;
    loginOrganizationId: any;
    //Available Substitutes
    availableSubstitutes: Observable<User[]>;
    // for checking that if absence is for need a sub or not
    NeedASub: boolean = false;
    response: number = 0;
    absenceTypes: AbsenceScope[] = Array<AbsenceScope>();
    // For Announcements
    Announcements: Announcement[] = Array<Announcement>();
    IsAnnouncementViewed: boolean = true;

    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private _EmployeeService: EmployeeService,
        private _dataContext: DataContext,
        private _userSession: UserSession,
        private absenceService: AbsenceService,
        notifier: NotifierService,
        private sanitizer: DomSanitizer,
        private dialogRef: MatDialog,
        private activatedRoute: ActivatedRoute,
        private _communicationService: CommunicationService) {
        this.notifier = notifier;
    }

    ngOnInit(): void {
        this.loginDistrictId = this._userSession.getUserDistrictId()
        this.loginOrganizationId = this._userSession.getUserOrganizationId()
        this.GenerateForms();
        this.GetLeaveTypes();
        this.getAbsenceTypes(this.loginDistrictId, this.loginOrganizationId);
        this.GetDistricts();
        if (this._userSession.getUserRoleId() != 5)
            this.GetOrganizations(this.loginDistrictId);
        this.GetPositions();
        this.InitializeValues();

        this.activatedRoute.queryParams.subscribe((params: any) => {
            if (params.announcement && this.IsAnnouncementViewed) {
                let UserRoleId = this._userSession.getUserRoleId();
                if (UserRoleId === 3) {
                    this.GetAndViewAnnouncement();
                    this.IsAnnouncementViewed = false;
                }
            }
        })
    }

    GenerateForms(): void {
        this.LeaveRequestForm = this._formBuilder.group({
            Employee: ['', Validators.required],
            Description: ['', Validators.required],
            LeaveType: [null, Validators.required],
            Duration: ['1', Validators.required],
            LeaveStartDate: ['', Validators.required],
            LeaveEndDate: ['', Validators.required],
            StartTime: [{ disabled: true }, Validators.required],
            EndTime: [{ disabled: true }, Validators.required]
        });

        this.absenceFirstFormGroup = this._formBuilder.group({
            selfEmployeeVacancy: ['1'],
            EmployeeId: [''],
            Reason: [null, Validators.required],
            StartTime: [{ value: '08:00:00', disabled: true }],
            EndTime: [{ value: '16:00:00', disabled: true }],
            ScheduleType: [''],
            Duration: ['1', Validators.required],
            Location: [null, Validators.required],
            OrganizationId: [{ value: null, disabled: true }, Validators.required],
            AbsenceStartDate: ['', Validators.required],
            AbsenceEndDate: ['', Validators.required],
            PositionId: [''],
            Grade: [''],
            Subject: [''],
            AbsenceType: [Validators.required],
            Substitutes: [[]],
            onlyCertified: [true],
            onlySubjectSpecialist: [false],
            ContactSubTime: ['10'],
        });

        this.absenceSecondFormGroup = this._formBuilder.group({
            PayRollNotes: [''],
            NotesToSubstitute: ['']
        });
    }

    GetCreatedAbsencesOfEmployee(employeeId: string) {
        let StartDate = new Date();
        StartDate.setMonth(this.CurrentDate.getMonth() - 6)
        let EndDate = new Date();
        EndDate.setMonth(this.CurrentDate.getMonth() + 6)
        this._dataContext.get('Absence/getAbsencesScheduleEmployee/' + StartDate.toISOString() + "/" + EndDate.toISOString()
            + "/" + employeeId).subscribe((data: any) => {
                this.EmployeeSchedule = data.filter((absence: Absence) => absence.status != 4);
            },
                error => this.msg = <any>error);
    }

    GetLeaveTypes(): void {
        let organizationId = this.loginOrganizationId ? this.loginOrganizationId : '-1';
        this.absenceService.getLeaveType(this.loginDistrictId, organizationId).subscribe((data: LeaveType[]) => {
            this.Leaves = data;
        },
            error => this.msg = <any>error);
    }

    onChangeReason(reason: LeaveType): void {
        if (reason.isApprovalRequired)
            this.isApprovalNeeded = true;
        else
            this.isApprovalNeeded = false;
    }

    GetEmployees(): void {
        let RoleId = 3;
        let OrgId = -1;
        let DistrictId = -1;
        this.Employees = this._EmployeeService.get('user/getEmployees', RoleId, OrgId, DistrictId);
    }

    /**
    * @description
    * ABSENCE SECTION START
    */
    //Get Default Values when Page Initializes

    InitializeValues(): void {
        this.EmployeeNameForAbsence = this._userSession.getUserName();
        this.EmployeeIdForAbsence = this._userSession.getUserId();
        this.loginedUserLevel = this._userSession.getUserLevelId();
        this.loginedUserRole = this._userSession.getUserRoleId();
        this.loginedUserType = this._userSession.getUserTypeId();
        this.GetCreatedAbsencesOfEmployee(this.EmployeeIdForAbsence);
        this.AbsenceForUserLevel = this.loginedUserLevel;
        this.GetLocationTime(this.EmployeeIdForAbsence, this.loginedUserLevel)
    }

    //Get Location Time For User
    GetLocationTime(userId: string, userLevel: number): void {
        this._dataContext.getUserLocationTime('user/getUserLocationTime', this.EmployeeIdForAbsence, userLevel).subscribe((data: any) => {
            this.loginedUserLocationTime = data;
            if (data) {
                this.absenceFirstFormGroup.get('StartTime').setValue(this.loginedUserLocationTime.startTime);
                this.absenceFirstFormGroup.get('EndTime').setValue(this.loginedUserLocationTime.endTime);
            }
        },
            (err: HttpErrorResponse) => {

            });
    }

    OnchangeOrganization(OrganizationId: string): void {
        if (typeof OrganizationId != "undefined" && OrganizationId) {
            this._dataContext.get('School/getOrganizationTimeByOrganizationId' + "/" + OrganizationId).subscribe((data: any) => {
                this.loginedUserLocationTime = data;
                this.absenceFirstFormGroup.get('StartTime').setValue(this.loginedUserLocationTime.startTime);
                this.absenceFirstFormGroup.get('EndTime').setValue(this.loginedUserLocationTime.endTime);
            },
                (err: HttpErrorResponse) => {
                });
        }
    }

    //CHANGE OF SELECTED EMPLOYEE FOR WHICH WE CREATE ABSENCE
    employeeSelection(EmployeeDetail: any) {
        this.EmployeeNameForAbsence = EmployeeDetail.firstName;
        this.EmployeeIdForAbsence = EmployeeDetail.userId;
        this.loginedUserType = EmployeeDetail.userTypeId;
        this.AbsenceForUserLevel = EmployeeDetail.userLevel;
        this.GetCreatedAbsencesOfEmployee(this.EmployeeIdForAbsence);
        this.getAbsenceTypes(EmployeeDetail.districtId, EmployeeDetail.organizationId);
        if (this.AbsenceForUserLevel == 3) {
            this.absenceFirstFormGroup.get('OrganizationId').setValue(EmployeeDetail.organizationId);
        }
        this.GetLocationTime(this.EmployeeIdForAbsence, this.AbsenceForUserLevel);
    }

    //For Selecting End Date Automatically
    SetEndDateValue(startDate: Date, endDate: Date) {
        if (endDate.toString() == "") {
            this.absenceFirstFormGroup.get('AbsenceEndDate').setValue(startDate);
            this.SearchAvailableSubstitutes("");
        }
    }

    //ASYNC FUNCTION TO SEARCH EMPLOYEE
    SearchEmployees(SearchedText: string) {
        let IsSearchSubstitute = 0;
        let OrgId = this._userSession.getUserOrganizationId();
        let DistrictId = this._userSession.getUserDistrictId();
        this.Employees = this._EmployeeService.searchUser('user/getEmployeeSuggestions', SearchedText, IsSearchSubstitute, OrgId, DistrictId);
        this.Employees = this.Employees.map((users: any) => users.filter(user => user.userId != this._userSession.getUserId()));
    }

    GetPositions(): void {
        this._dataContext.get('user/getUserTypes').subscribe((data: any) => {
            this.positions = data;
            this.absenceFirstFormGroup.get('PositionId').setValue(1);
        },
            error => <any>error);
    }

    //Temporary Function
    SearchSubstitutes(SearchedText: string): void {
        let IsSearchSubstitute = 1;
        let OrgId = this._userSession.getUserOrganizationId();
        let DistrictId = this._userSession.getUserDistrictId();
        this.SubstituteList = this._EmployeeService.searchUser('user/getEmployeeSuggestions', SearchedText, IsSearchSubstitute, OrgId, DistrictId);
        this.SubstituteList = this.SubstituteList.map((users: any) => users.filter(user => user.userId != this._userSession.getUserId()));
    }

    //Search Available Substitutes
    SearchAvailableSubstitutes(SearchedText: string): void {
        if (this.absenceFirstFormGroup.value.AbsenceType != 2 && this.absenceFirstFormGroup.value.AbsenceType != 1) {
            return;
        }
        if (this.absenceFirstFormGroup.value.AbsenceStartDate && this.absenceFirstFormGroup.value.AbsenceEndDate) {
            // if(this.absenceFirstFormGroup.value.AbsenceType != 1) {
            //     this.absenceFirstFormGroup.get('Substitutes').setValue([]);
            // }
            let filter = {
                districtId: this._userSession.getUserDistrictId(),
                employeeId: this.EmployeeIdForAbsence,
                startDate: new Date(this.absenceFirstFormGroup.value.AbsenceStartDate).toLocaleDateString(),
                endDate: new Date(this.absenceFirstFormGroup.value.AbsenceEndDate).toLocaleDateString(),
                startTime: this.absenceFirstFormGroup.getRawValue().StartTime,
                endTime: this.absenceFirstFormGroup.getRawValue().EndTime
            }
            this.availableSubstitutes = this.http.post<User[]>(environment.apiUrl + 'user/getAvailableSubstitutes', filter);
            this.availableSubstitutes = this.availableSubstitutes.map((users: any) => users.filter((val: User) => val.firstName.toLowerCase().includes(SearchedText.toLowerCase())));
        }
        else {
            this.notifier.notify('error', 'Please Select Date First');
        }
    }

    OnDateAndTimeChange(): void {
        if (this.absenceFirstFormGroup.value.AbsenceType != 2 && this.absenceFirstFormGroup.value.AbsenceType != 1) {
            return;
        }
        if (this.absenceFirstFormGroup.value.AbsenceStartDate && this.absenceFirstFormGroup.value.AbsenceEndDate) {
            this.absenceFirstFormGroup.get('Substitutes').setValue([]);
            let filter = {
                districtId: this._userSession.getUserDistrictId(),
                employeeId: this.EmployeeIdForAbsence,
                startDate: new Date(this.absenceFirstFormGroup.value.AbsenceStartDate).toLocaleDateString(),
                endDate: new Date(this.absenceFirstFormGroup.value.AbsenceEndDate).toLocaleDateString(),
                startTime: this.absenceFirstFormGroup.getRawValue().StartTime,
                endTime: this.absenceFirstFormGroup.getRawValue().EndTime
            }
            this.availableSubstitutes = this.http.post<User[]>(environment.apiUrl + 'user/getAvailableSubstitutes', filter);
        }
        else {
            this.notifier.notify('error', 'Please Select Date First');
        }
    }

    handleSelection(userId, categorySelected) {
        for (let user of categorySelected.options._results) {
            user._selected = false;
        }
    }

    //Select Substitute For Direct Assign And Preferred Substitutes
    SelectSubstituteForDirectAssign(user: User) {
        if (!user.isActive) {
            this.notifier.notify('error', 'Inactive Substitute');
            return;
        }
        if (this.absenceFirstFormGroup.value.Substitutes.length > 0 && +this.absenceFirstFormGroup.value.AbsenceType === 2) {
            this.notifier.notify('error', 'You can select only one substitute in direct Assign.');
            return;
        }
        let alreadyAdded = this.absenceFirstFormGroup.value.Substitutes.filter((obj: User) => obj.userId === user.userId);
        if (alreadyAdded.length > 0) {
            this.notifier.notify('error', 'Already Selected');
            return;
        }
        this.absenceFirstFormGroup.value.Substitutes.push(user);
        this.availableSubstitutes = null;
    }

    //For Display Substitute name in text box
    displayName(user?: any): string | undefined {
        return user ? user.firstName : undefined;
    }

    GetOrganizations(DistrictId: number): void {
        this._dataContext.getById('School/getOrganizationsByDistrictId', DistrictId).subscribe((data: any) => {
            this.Organizations = data;
            if (typeof this._userSession.getUserOrganizationId() != "undefined" && this._userSession.getUserOrganizationId() != "-1" && this._userSession.getUserOrganizationId())
                this.absenceFirstFormGroup.get('OrganizationId').setValue(this._userSession.getUserOrganizationId());
            this.absenceFirstFormGroup.controls['OrganizationId'].enable();
            if (this._userSession.getUserRoleId() == 5) {
                this.absenceFirstFormGroup.get['OrganizationId'].setValue(this.Organizations[0].schoolId);
            }
            else {
                this.absenceFirstFormGroup.controls['OrganizationId'].disable();
            }
        },
            error => <any>error);
    }

    OnChangeDistrict(DistrictId: number): void {
        this.GetOrganizations(DistrictId);
    }

    GetDistricts(): void {
        this._dataContext.get('district/getDistricts').subscribe((data: any) => {
            this.Districts = data;
            if (this._userSession.getUserRoleId() != 5) {
                this.absenceFirstFormGroup.get('Location').setValue(this.loginDistrictId);
                this.absenceFirstFormGroup.controls['Location'].disable();
            }
        },
            error => <any>error);
    }

    // ON CHANGING ABSENCE FOR SELF OR EMPLOYEE
    onChangeAbsenceFor(event: any) {
        if (+event == 2) {
            this.NeedASub = false;
            this.absenceFirstFormGroup.controls['PositionId'].clearValidators();
            this.absenceFirstFormGroup.controls['PositionId'].updateValueAndValidity();
            // Null because now admin Search Employee
            this.absenceFirstFormGroup.get('EmployeeId').setValue('');
            this.absenceFirstFormGroup.controls["EmployeeId"].setValidators([Validators.required]);
            this.absenceFirstFormGroup.controls['EmployeeId'].updateValueAndValidity();
            this.absenceFirstFormGroup.controls['OrganizationId'].disable();
            this.absenceFirstFormGroup.controls['Grade'].clearValidators();
            this.absenceFirstFormGroup.controls['Grade'].updateValueAndValidity();
            this.absenceFirstFormGroup.controls['Subject'].clearValidators();
            this.absenceFirstFormGroup.controls['Subject'].updateValueAndValidity();
        }
        else if (+event == 3) {
            this.absenceFirstFormGroup.get('AbsenceType').setValue(4);
            this.absenceFirstFormGroup.controls["PositionId"].setValidators([Validators.required]);
            this.absenceFirstFormGroup.controls['PositionId'].updateValueAndValidity();
            this.EmployeeIdForAbsence = "U000000000";
            this.NeedASub = true;
            this.EmployeeSchedule = null
            if (this.loginedUserLevel == 1) {
                this.absenceFirstFormGroup.controls['OrganizationId'].enable();
            }
            this.absenceFirstFormGroup.controls['EmployeeId'].clearValidators();
            this.absenceFirstFormGroup.controls['EmployeeId'].updateValueAndValidity();
            this.GetTeachingLevels();
            this.GetTeachingSubjects();
            if (this.absenceFirstFormGroup.controls['PositionId'].value == 1) {
                this.absenceFirstFormGroup.controls["Grade"].setValidators([Validators.required]);
                this.absenceFirstFormGroup.controls['Grade'].updateValueAndValidity();
                this.absenceFirstFormGroup.controls["Subject"].setValidators([Validators.required]);
                this.absenceFirstFormGroup.controls['Subject'].updateValueAndValidity();
            }
            else {
                this.absenceFirstFormGroup.controls['Grade'].clearValidators();
                this.absenceFirstFormGroup.controls['Grade'].updateValueAndValidity();
                this.absenceFirstFormGroup.controls['Subject'].clearValidators();
                this.absenceFirstFormGroup.controls['Subject'].updateValueAndValidity();
            }
        }
        else {
            if (this.loginedUserLevel == 1) {
                this.absenceFirstFormGroup.controls['OrganizationId'].disable();
            }
            this.InitializeValues();
            this.NeedASub = false;
            this.absenceFirstFormGroup.controls['PositionId'].clearValidators();
            this.absenceFirstFormGroup.controls['PositionId'].updateValueAndValidity();
            this.absenceFirstFormGroup.controls['EmployeeId'].clearValidators();
            this.absenceFirstFormGroup.controls['EmployeeId'].updateValueAndValidity();
            this.absenceFirstFormGroup.controls['Grade'].clearValidators();
            this.absenceFirstFormGroup.controls['Grade'].updateValueAndValidity();
            this.absenceFirstFormGroup.controls['Subject'].clearValidators();
            this.absenceFirstFormGroup.controls['Subject'].updateValueAndValidity();
        }
    }
    //On change position in case of Find A Sub
    OnchangePosition(id: number) {
        if (id == 1) {
            this.absenceFirstFormGroup.controls["Grade"].setValidators([Validators.required]);
            this.absenceFirstFormGroup.controls['Grade'].updateValueAndValidity();
            this.absenceFirstFormGroup.controls["Subject"].setValidators([Validators.required]);
            this.absenceFirstFormGroup.controls['Subject'].updateValueAndValidity();
        } else {
            this.absenceFirstFormGroup.controls['Grade'].clearValidators();
            this.absenceFirstFormGroup.controls['Grade'].updateValueAndValidity();
            this.absenceFirstFormGroup.controls['Subject'].clearValidators();
            this.absenceFirstFormGroup.controls['Subject'].updateValueAndValidity();
        }
    }

    OnchangeAbsenceScope(AbsenceScopetype: number) {
        if (+AbsenceScopetype === 1 || +AbsenceScopetype === 2) {
            if (this.absenceFirstFormGroup.value.AbsenceStartDate && this.absenceFirstFormGroup.value.AbsenceEndDate) {
                this.absenceFirstFormGroup.get('Substitutes').setValue([]);
                this.SearchAvailableSubstitutes('');
            }
            else {
                this.notifier.notify('error', 'Select Date First to search substitutes');
            }
        }
        else if (+AbsenceScopetype === 3) {
            this.GetPreferredSubstitutes();
            this.absenceFirstFormGroup.controls['Substitutes'].clearValidators();
            this.absenceFirstFormGroup.controls['Substitutes'].updateValueAndValidity();
        }
        else {
            this.absenceFirstFormGroup.controls['Substitutes'].clearValidators();
            this.absenceFirstFormGroup.controls['Substitutes'].updateValueAndValidity();
        }
    }

    OnchangeCustomDelay(event: MatRadioChange) {
        if (event.value == 1) {
            this.absenceFirstFormGroup.controls["Substitutes"].setValidators([Validators.required]);
            this.absenceFirstFormGroup.controls['Substitutes'].updateValueAndValidity();
        }
        else {
            this.absenceFirstFormGroup.controls['Substitutes'].clearValidators();
            this.absenceFirstFormGroup.controls['Substitutes'].updateValueAndValidity();
        }
    }

    //ON CHANGING DURATION TYPE
    onChangeDurationForAbsence(durationType: any) {
        this.absenceFirstFormGroup.controls['StartTime'].clearValidators();
        this.absenceFirstFormGroup.controls['EndTime'].clearValidators();
        this.absenceFirstFormGroup.controls['StartTime'].updateValueAndValidity();
        this.absenceFirstFormGroup.controls['EndTime'].updateValueAndValidity();
        this.absenceFirstFormGroup.controls['ScheduleType'].clearValidators();
        this.absenceFirstFormGroup.controls['ScheduleType'].updateValueAndValidity();
        this.absenceFirstFormGroup.controls['StartTime'].disable();
        this.absenceFirstFormGroup.controls['EndTime'].disable();
        if (durationType === "5") {
            this.absenceFirstFormGroup.controls["ScheduleType"].setValidators([Validators.required]);
            this.absenceFirstFormGroup.controls['ScheduleType'].updateValueAndValidity();
            this.absenceFirstFormGroup.controls['StartTime'].clearValidators();
            this.absenceFirstFormGroup.controls['EndTime'].clearValidators();
            this.absenceFirstFormGroup.controls['StartTime'].updateValueAndValidity();
            this.absenceFirstFormGroup.controls['EndTime'].updateValueAndValidity();
        }
        else {
            this.absenceFirstFormGroup.controls["StartTime"].setValidators([Validators.required]);
            this.absenceFirstFormGroup.controls['StartTime'].updateValueAndValidity();
            this.absenceFirstFormGroup.controls["EndTime"].setValidators([Validators.required]);
            this.absenceFirstFormGroup.controls['EndTime'].updateValueAndValidity();

            if (durationType === "1") {
                this.absenceFirstFormGroup.get('StartTime').setValue(this.loginedUserLocationTime.startTime);
                this.absenceFirstFormGroup.get('EndTime').setValue(this.loginedUserLocationTime.endTime);
            }

            else if (durationType === "2") {
                this.absenceFirstFormGroup.get('StartTime').setValue(this.loginedUserLocationTime.startTime);
                this.absenceFirstFormGroup.get('EndTime').setValue(this.loginedUserLocationTime.firstHalfEnd);
            }

            else if (durationType === "3") {
                this.absenceFirstFormGroup.get('StartTime').setValue(this.loginedUserLocationTime.secondHalfStart);
                this.absenceFirstFormGroup.get('EndTime').setValue(this.loginedUserLocationTime.endTime);
            }

            else if (durationType === "4") {
                this.absenceFirstFormGroup.controls['StartTime'].enable();
                this.absenceFirstFormGroup.controls['EndTime'].enable();
            }
        }
    }

    //UPLOAD ATTACHEMNT
    uploadClick() {
        const fileUpload = document.getElementById('UploadButton') as HTMLInputElement;
        fileUpload.click();
    }

    upload(files: File[]) {
        this.uploadAndProgress(files);
    }

    removeAttachedFile() {
        this.AllAttachedFiles = null;
        this.OriginalFileName = null;
        this.OriginalFileNameForDisplay = null;
    }

    uploadAndProgress(files: File[]) {
        this.AllAttachedFiles = files;
        this.AttachedFileType = files[0].type;
        if (!this.AttachedFileType) this.AttachedFileType = "text/plain";
        this.OriginalFileName = this.AllAttachedFiles[0].name;
        this.OriginalFileNameForDisplay = this.OriginalFileName.substr(0, 15);
        this.AttachedFileExtention = files[0].name.split('.')[1];
        let formData = new FormData();
        Array.from(files).forEach(file => formData.append('file', file))
        this.http.post(environment.apiUrl + 'Absence/uploadFile', formData, { reportProgress: true, observe: 'events' })
            .subscribe(event => {
                if (event.type === HttpEventType.UploadProgress) {
                    this.CompletedPercentage = Math.round(100 * event.loaded / event.total);
                } else if (event instanceof HttpResponse) {
                    this.SuccessMessage = true;
                    this.AttachedFileName = event.body.toString();
                }
            });
    }

    //Get Preferred Substitutes
    GetPreferredSubstitutes() {
        let UserId = this.EmployeeIdForAbsence;
        this._dataContext.get('user/getFavoriteSubstitutes' + '/' + UserId).subscribe((data: any) => {
            this.PreferredSubstitutes = data;
        },
            error => this.msg = <any>error);
    }

    //Get Absence Type
    getAbsenceTypes(districtId: number, organizationId: string) {
        const model = {
            schoolId: organizationId ? organizationId : "-1",
            SchoolDistrictId: districtId
        }
        this._dataContext.post('School/getAbsenceScopes', model).subscribe((scopes: AbsenceScope[]) => {
            this.absenceTypes = scopes.filter(type => type.visibility === true);
            this.absenceFirstFormGroup.get('AbsenceType').setValue(4);
        },
            error => <any>error);
    }

    //GET SUBJECTS IN CASE OF NEED A SUB
    GetTeachingSubjects(): void {
        this._dataContext.get('lookup/teachingSubjects').subscribe((data: any) => {
            this.teachingSubjects = data;
        },
            error => this.msg = <any>error);
    }
    //GET GRADES IN CASE OF NEED A SUB
    GetTeachingLevels(): void {
        this._dataContext.get('lookup/getTeachingLevels').subscribe((data: any) => {
            this.TeachingLevels = data;
        },
            error => this.msg = <any>error);
    }

    //ON CREATING ABSENCE CLICK
    createAbsenceSubmission(FirstAbsenceForm: any, SecondAbsenceForm: any, stepper: MatStepper) {
        if (this.loginedUserRole === 3) {
            let filter = {
                userId: FirstAbsenceForm.value.employeeId,
                allowanceType: FirstAbsenceForm.value.Reason.allowanceType,
                absenceStartDate: new Date(FirstAbsenceForm.value.AbsenceStartDate),
                absenceEndDate: new Date(FirstAbsenceForm.value.AbsenceEndDate)
            }
            if (FirstAbsenceForm.value.Reason.allowanceType != 0) {
                var minusbalance = (FirstAbsenceForm.value.endDate - FirstAbsenceForm.value.startDate) + 1;
                var userId = this._userSession.getUserId();
                this._dataContext.post('Absence/checkNegativeAllowance/', filter).subscribe((response: any) => {
                    if (response == "success") {
                        this.createAbsence(FirstAbsenceForm, SecondAbsenceForm, stepper);
                    }
                    else {
                        this.notifier.notify('error', 'Please select another absence reason. Please check your leave balance');
                    }
                },
                    error => this.msg = <any>error);
            }
            else {
                this.createAbsence(FirstAbsenceForm, SecondAbsenceForm, stepper);
            }
        }
        else {
            this.createAbsence(FirstAbsenceForm, SecondAbsenceForm, stepper);
        }
    }

    createAbsence(FirstAbsenceForm: any, SecondAbsenceForm: any, stepper: MatStepper) {
        if (this.absenceFirstFormGroup.valid && this.absenceSecondFormGroup.valid) {
            let Substitutes = "";
            if ((+FirstAbsenceForm.value.AbsenceType == 1 || +FirstAbsenceForm.value.AbsenceType == 2) && (FirstAbsenceForm.value.Substitutes)) {
                FirstAbsenceForm.value.Substitutes.forEach((Substitute, index, array) => {
                    Substitutes += index === array.length - 1 ? Substitute.userId : Substitute.userId + ",";
                });
            }
            let AbsenceModel = {
                EmployeeId: this.EmployeeIdForAbsence,
                AbsenceCreatedByEmployeeId: this._userSession.getUserId(),
                StartDate: new Date(FirstAbsenceForm.value.AbsenceStartDate).toLocaleDateString(),
                EndDate: new Date(FirstAbsenceForm.value.AbsenceEndDate).toLocaleDateString(),
                StartTime: typeof FirstAbsenceForm.value.StartTime != 'undefined' && FirstAbsenceForm.value.StartTime ?
                    FirstAbsenceForm.value.StartTime : FirstAbsenceForm.getRawValue().StartTime,
                EndTime: typeof FirstAbsenceForm.value.EndTime != 'undefined' && FirstAbsenceForm.value.EndTime ?
                    FirstAbsenceForm.value.EndTime : FirstAbsenceForm.getRawValue().EndTime,
                AbsenceReasonId: FirstAbsenceForm.value.Reason.leaveTypeId,
                DurationType: FirstAbsenceForm.value.Duration,
                PositionId: this.NeedASub == true ? FirstAbsenceForm.value.PositionId : this.loginedUserType,
                Status: +FirstAbsenceForm.value.AbsenceType == 2 && FirstAbsenceForm.value.Substitutes ? 2 : 1,
                OrganizationId: typeof FirstAbsenceForm.value.OrganizationId != 'undefined' && FirstAbsenceForm.value.OrganizationId && (this.AbsenceForUserLevel == 3 || this.NeedASub) ? FirstAbsenceForm.value.OrganizationId :
                    FirstAbsenceForm.getRawValue().OrganizationId && (this.AbsenceForUserLevel == 3 || this.NeedASub) ? FirstAbsenceForm.getRawValue().OrganizationId : '-1',
                DistrictId: typeof FirstAbsenceForm.value.Location != 'undefined' && FirstAbsenceForm.value.Location ? FirstAbsenceForm.value.Location :
                    FirstAbsenceForm.getRawValue().Location,
                SubstituteRequired: +FirstAbsenceForm.value.AbsenceType != 5 ? true : false,
                AbsenceScope: FirstAbsenceForm.value.AbsenceType,
                PayrollNotes: !SecondAbsenceForm.value.PayRollNotes ? 'N/A' : SecondAbsenceForm.value.PayRollNotes,
                SubstituteNotes: !SecondAbsenceForm.value.NotesToSubstitute ? 'N/A' : SecondAbsenceForm.value.NotesToSubstitute,
                AnyAttachment: this.AttachedFileName == "" || this.AttachedFileName == undefined ? false : true,
                AttachedFileName: typeof this.AttachedFileName != 'undefined' ? this.AttachedFileName : 'N/A',
                OriginalFileName: !this.OriginalFileName ? 'N/A' : this.OriginalFileName,
                FileContentType: typeof this.AttachedFileName != 'undefined' ? this.AttachedFileType : 'N/A',
                FileExtention: typeof this.AttachedFileName != 'undefined' ? this.AttachedFileExtention : 'N/A',
                SubstituteId: FirstAbsenceForm.value.Substitutes && +FirstAbsenceForm.value.AbsenceType == 2 ? Substitutes :
                    FirstAbsenceForm.value.Substitutes && +FirstAbsenceForm.value.AbsenceType == 1 ? Substitutes : '-1',
                Interval: this.ContactSub == "1" ? 0 : FirstAbsenceForm.value.ContactSubTime,
                TotalInterval: this.ContactSub == "1" ? 0 : (this.PreferredSubstitutes.length - 1) * (+FirstAbsenceForm.value.ContactSubTime) + 10, //Send All to After 10 mins
                isApprovalRequired: this.isApprovalNeeded && this.loginedUserRole === 3 ? 0 : 1,
                onlyCertified: FirstAbsenceForm.value.onlyCertified,
                onlySubjectSpecialist: FirstAbsenceForm.value.onlySubjectSpecialist,
                TeachingLevelId: this.NeedASub && FirstAbsenceForm.value.Grade ? FirstAbsenceForm.value.Grade : 0,
                SpecialityTypeId: this.NeedASub && FirstAbsenceForm.value.Subject ? FirstAbsenceForm.value.Subject : 0
            }

            if (!this.CheckDataAndTimeOverlape(FirstAbsenceForm.value.AbsenceStartDate as Date,
                FirstAbsenceForm.value.AbsenceEndDate as Date, AbsenceModel.StartTime as string, AbsenceModel.EndTime as string)) {
                this._dataContext.post('Absence/CreateAbsence', AbsenceModel).subscribe((respose: any) => {
                    if (respose != "error") {
                        this.notifier.notify('success', 'Absence Created Successfully. Confirmation Number: ' + respose + '');
                        this.response = 1;
                        this.resetForm(stepper);
                        if (this.loginedUserRole === 3) {
                            this.refreshBalance.next();
                        }
                        else {
                            this._communicationService.UpdateEmployeeLeaveBalance();
                        }
                    }
                },
                    (err: HttpErrorResponse) => {
                    });
            }
            else {
                this.notifier.notify('error', 'Absence overlapping please select different date or time.');
            }
        }
    }

    //Check Absence Overlapping
    CheckDataAndTimeOverlape(startDate: Date, endDate: Date, startTime: string, EndTime: string): boolean {
        let Isoverlap: boolean = false;
        if (this.NeedASub)
            return Isoverlap;
        this.EmployeeSchedule.forEach((Absence) => {
            if ((startDate.setHours(0, 0, 0, 0) >= new Date(Absence.startDate).setHours(0, 0, 0, 0)
                && startDate.setHours(0, 0, 0, 0) <= new Date(Absence.endDate).setHours(0, 0, 0, 0)) ||
                (endDate.getTime() >= new Date(Absence.startDate).setHours(0, 0, 0, 0)
                    && endDate.setHours(0, 0, 0, 0) <= new Date(Absence.endDate).setHours(0, 0, 0, 0)) ||
                (startDate.setHours(0, 0, 0, 0) <= new Date(Absence.startDate).setHours(0, 0, 0, 0) &&
                    endDate.setHours(0, 0, 0, 0) >= new Date(Absence.endDate).setHours(0, 0, 0, 0))) {
                if ((startTime <= Absence.startTime && EndTime >= Absence.endTime)
                    || (startTime >= Absence.startTime && EndTime <= Absence.endTime)
                    || (startTime < Absence.startTime && EndTime > Absence.endTime))
                    Isoverlap = true;
            }
        });
        return Isoverlap;
    }

    onchangeOnlyCertified(value: boolean) {
        this.absenceFirstFormGroup.get('onlyCertified').setValue(!value);
    }

    onchangeOnlySpecialist(value: boolean) {
        this.absenceFirstFormGroup.get('onlySubjectSpecialist').setValue(!value);
    }

    expandPannel() {
        this.preferredSubPanel.expanded = !this.preferredSubPanel.expanded;
    }

    checkAbsenceScope(): boolean {
        return this.absenceFirstFormGroup.get('AbsenceType').value != "3" ? true : false;
    }

    OnchangeContactSubOption(): void {
        if (this.ContactSub == "1") {
            this.DisableContactSubTimeAccess = true;
        }
        else {
            this.DisableContactSubTimeAccess = false;
        }
    }

    goToNextForm(stepper: MatStepper) {
        let CurrentDate = moment(this.CurrentDate).format('YYYY-MM-DD');
        let AbsenceStartDate = moment(this.absenceFirstFormGroup.value.AbsenceStartDate).format('YYYY-MM-DD')
        if ((AbsenceStartDate < CurrentDate) && this.loginedUserRole === 3) {
            this.notifier.notify('error', 'Unable to create absence, date has passed.');
            return;
        }
        if (+this.absenceFirstFormGroup.value.selfEmployeeVacancy === 2) {
            if (!(this.absenceFirstFormGroup.value.EmployeeId instanceof Object)) {
                this.notifier.notify('error', 'Please Select Employee.');
                return;
            }
        }
        if (+this.absenceFirstFormGroup.value.AbsenceType === 3 && this.PreferredSubstitutes.length === 0) {
            this.notifier.notify('error', 'There is no Preffered Substitiute.');
            return;
        }
        if (+this.absenceFirstFormGroup.value.AbsenceType === 1 || +this.absenceFirstFormGroup.value.AbsenceType === 2) {
            if (this.absenceFirstFormGroup.value.Substitutes.length > 0) {
                stepper.next();
            }
            else {
                this.notifier.notify('error', 'Select Substitute');
            }
        }
        else {
            stepper.next();
        }
    }

    goBackToPreviousForm(stepper: MatStepper) {
        stepper.previous();
    }

    resetForm(stepper: MatStepper) {
        this.isApprovalNeeded = false;
        this.response = 0;
        this.ngOnInit();
        stepper.reset();
        this.onChangeAbsenceFor("1");
        this.removeAttachedFile();
    }

    GetPositionText(): any {
        let PostionId = this.NeedASub == true ? this.absenceFirstFormGroup.value.PositionId : this.loginedUserType;
        return this.positions.find((position: any) => position.id === PostionId);
    }

    downloadAttachment() {
        const model = { AttachedFileName: this.AttachedFileName, FileContentType: this.AttachedFileType };
        this._dataContext.getFile('Absence/getfile', model).subscribe((blob: any) => {
            const newBlob = new Blob([blob]);
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(newBlob);
                return;
            }
            let data = window.URL.createObjectURL(newBlob);
            let link = document.createElement('a');
            link.href = data;
            link.download = this.OriginalFileName;
            link.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(data);
            }, 100);
        });
    }

    /**
   * @description
   * ABSENCE SECTION END
   */

    /**
    * @description
    * LEAVES SECTION START
    */

    onChangeDurationForLeave(value: any) {
        this.LeaveRequestForm.controls['StartTime'].disable();
        this.LeaveRequestForm.controls['EndTime'].disable();
        if (value === "1") {
            this.LeaveRequestForm.get('StartTime').setValue("08:00:00");
            this.LeaveRequestForm.get('EndTime').setValue("16:00:00");
        }
        else if (value === "2") {
            this.LeaveRequestForm.get('StartTime').setValue("08:00:00");
            this.LeaveRequestForm.get('EndTime').setValue("11:30:00");
        }
        else if (value === "3") {
            this.LeaveRequestForm.get('StartTime').setValue("11:30:00");
            this.LeaveRequestForm.get('EndTime').setValue("16:00:00");
        }
        else {
            this.LeaveRequestForm.controls['StartTime'].enable();
            this.LeaveRequestForm.controls['EndTime'].enable();
        }
    }

    onSubmitLeaveRequestForm(form: any) {
        if (this.LeaveRequestForm.valid) {
            let leaveRequestModel = {
                EmployeeId: this.EmployeeIdForAbsence,
                Description: form.value.Description,
                LeaveTypeId: form.value.LeaveType.LeaveTypeId,
                StartDate: form.value.LeaveStartDate,
                EndDate: form.value.LeaveEndDate,
                StartTime: form.value.StartTime,
                EndTime: form.value.EndTime,
            }
            this._dataContext.post('Leave/insertLeaveRequest', leaveRequestModel).subscribe((data: any) => {
                this.notifier.notify('success', 'Added Successfully!');
            },
                (err: HttpErrorResponse) => {
                    this.notifier.notify('error', err.error.error_description);
                });
        }
    }

    /**
     * @description
     * LEAVES SECTION END
     */

    ngOnDestroy() {
        console.log("Destroy");
    }

    getImage(imageName: string) {
        if (imageName && imageName.length > 0) {
            return this.sanitizer.bypassSecurityTrustResourceUrl(environment.profileImageUrl + imageName);
        }
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

    getSelectedEmployeeBalances(emp: any, actionName: any) {
        const action = {
            actionName: actionName,
            formValue: emp
        };
        this._communicationService.UpdateSelectedEmployeeLeaveBalance(action);
    }

    getEmployeeBalances(actionName: any) {
        this._communicationService.UpdateEmployeeLeaveBalance();
    }
}