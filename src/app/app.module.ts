import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
//import { AppMaterialModule } from './App-Material/app-material';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routing } from './app.routing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { MatSidenavModule } from '@angular/material/sidenav';
import { CdkTableModule } from '@angular/cdk/table';
import { HomeComponent } from './Components/Dashboard/home.component';
import { NotifierModule, NotifierOptions } from 'angular-notifier';
import { ChartsModule } from 'ng2-charts';
import { BlockUIModule } from 'ng-block-ui';
import { TagInputModule } from 'ngx-chips';
import { NgxPrintModule } from 'ngx-print';
import { NgxPaginationModule } from 'ngx-pagination';
import { createCustomElement } from '@angular/elements';


import {
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDialogRef
} from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
//Routing Authentication
import { AuthGuard } from './Authentication/auth.guard';

//For Client Side Error Logging 
import { AuthInterceptor } from './Authentication/auth.interceptor';

// Dashboard Component


// Login Component
import { LoginComponent } from './Components/User/Login/login.component';

// Top Navigation
import { SideNavComponent, PopupDialogForSearch, PopupDialogForSettings } from './Components/SideNav/sideNav.component';



//Absence Components
import { absenceComponent, PopupDialogForAbsenceDetail } from './Components/Absence/absence.component';
import { AbortedAbsenceComponent } from './Components/Absence/SubPages/AbortedAbsence/abortedAbsence.component';
import { CreateAbsenceComponent } from './Components/Absence/SubPages/CreateAbsence/createAbsence.component';
import { PastAbsenceComponent } from './Components/Absence/SubPages/PastAbsence/pastAbsence.component';
import { UpcommingAbsenceComponent } from './Components/Absence/SubPages/UpcommingAbsence/upcommingAbsence.component';

//Manage Components
import { ManageComponent } from './Components/Manage/manage.component';
import { DistrictsComponent, PopupDialogForDistrictDetail } from './Components/Manage/SubPages/Districts/district.component';
import { AddDistrictComponent } from './Components/Manage/SubPages/Districts/addDistrict.component';
import { EmployeesComponent } from './Components/Manage/SubPages/Employees/employees.component';
import { AddEmployeesComponent } from './Components/Manage/SubPages/Employees/addEmployees.component';
import { SubstitutesComponent, PopupDialogForSubstituteDetail } from './Components/Manage/SubPages/Substitutes/substitutes.component';
import { AddSubstituteComponent } from './Components/Manage/SubPages/Substitutes/addSubstitute.component';
import { SchoolSubListComponent } from './Components/Manage/SubPages/SchoolSubList/schoolSubList.component';
import { LeavesComponent } from './Components/Manage/SubPages/Leaves/leaves.component';
import { AddLeaveComponent } from './Components/Manage/SubPages/Leaves/addLeave.component';
import { AddLeaveRequestComponent } from './Components/Manage/SubPages/Leaves/LeavesRequests/addLeaveRequest.component';
import { ProfileComponent } from './Components/Manage/SubPages/Profile/profile.component';
import { OrganizationsComponent, PopupDialogForOrganizationDetail } from './Components/Manage/SubPages/Organization/organizations.component';
import { AddOrganizationComponent } from './Components/Manage/SubPages/Organization/addOrganization.component';

//Reports Component
import { ReportsComponent } from './Components/Reports/reports.component';
import { DailyReportsComponent } from './Components/Reports/SubPages/DailyReports/dailyReports.component';
import { MonthlyReportsComponent } from './Components/Reports/SubPages/MonthlyReports/monthyReports.component';
import { ActivityReportsComponent } from './Components/Reports/SubPages/ActivityReports/activityReports.component';

//Schools Component
import { SchoolsComponent, PopupDialogForSchoolDetail } from './Components/Manage/SubPages/Schools/schools.component';
import { AddSchoolComponent } from './Components/Manage/SubPages/Schools/addSchool.component'
// import { AddSchoolComponent } from './Components/Manage/SubPages/Schools/addSchool.component';

//Permission Component
import { PermissionsComponent } from './Components/Permissions/permissions.component';

//Contact Component
import { ContactUsComponent } from './Components/Contact/contactUs.component'

//Jobs Component
import { JobComponent } from './Components/Job/job.component';
import { AvailableJobsComponent } from './Components/Job/SubPages/AvailableJobs/availableJobs.component';
import { MyJobsComponent } from './Components/Job/SubPages/MyJobs/myJobs.component';
import { PastJobsComponent } from './Components/Job/SubPages/PastJobs/pastJobs.component';

//Settings Component
import { SettingComponent } from './Components/Settings/settings.component';

//TimeClock And TimeTracker Component
import { TimeClockComponent } from './Components/TimeClock/timeClock.component';
import { TimeTrackerComponent } from './Components/TimeTracker/timeTracker.component';
import { EditTimeTracker } from './Components/TimeClock/popups/edit-timetracker.popup.component'
import { AuditLogComponent } from './Components/Audit-Log/audit-log.component';

//Services
import { SideNavService } from './Components/SideNav/sideNav.service';
import { DistrictService } from './Service/Manage/district.service';
import { SchoolService } from './Service/Manage/school.service';
import { EmployeeService } from './Service/Manage/employees.service';
import { UserService } from './Service/user.service';
import { DataContext } from './Services/dataContext.service';
import { UserSession } from './Services/userSession.service';
import { CommunicationService } from './Services/communication.service';
import { ReportService } from './Services/report.service';
import { ErrorHandlerService } from './Services/error-handler/error-handler.service';
import { ProfileService } from './Services/profile.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TimeClockService } from './Services/timeClock.service'

import {
    SocialLoginModule,
    AuthServiceConfig,
    GoogleLoginProvider,
} from "angular-6-social-login";
import { ReportFiltersComponent } from './Components/Reports/filters/filters.component';
import { ReportDetailsComponent } from './Components/Reports/popups/report-details.popup.component';
import { FileService } from './Services/file.service';
import { AbsenceService } from './Services/absence.service';
import { TimeFormatPipe } from './Shared/pipe/time.pipe';
import { PopupDialogForEmployeeDetail } from './Components/Manage/SubPages/Employees/popups/viewEmployee.popup.component';
import { PopupDialogForJobDetail } from './Components/Job/popus/jobDetail.component';
import { SubstituteCalendarComponent } from './Components/Dashboard/substitute-calendar.component';
import { AvailabilityService } from './Services/availability.service';
import { LookupService } from './Services/lookup.service';
import { UnAvailabilityComponent } from './Components/Dashboard/unavailability/unavailability.component';
import { AllowanceComponent } from './Components/Manage/SubPages/Leaves/popups/add-allowance.popup.component';
import { RecurringComponent } from './Components/Dashboard/unavailability/recurring/recurring.component';
import { PositionsComponent } from './Components/Manage/SubPages/Substitutes/SubPages/positions.component';
import { SubstituteAvailabilityComponent } from './Components/Dashboard/substitute-availability.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { PositionComponent } from './Components/Manage/SubPages/Substitutes/SubPages/popups/position-detail.popup.component';
import { PopupDialogForNotificationSettings } from './Components/Manage/SubPages/Substitutes/SubPages/popups/notification-settings.popup';
import { PayRateComponent } from './Components/Manage/SubPages/Substitutes/SubPages/PayRate/payRate-detail.component';
import { PayRollComponent } from './Components/Payroll/payroll.component';
import { ExcelService } from './Services/excel.service';
import { PopupForCancelAbsencesComponent } from './Components/Reports/popups/cancel-absence.popup.component';
import { RunPayroll } from './Components/Payroll/SubPages/run-payroll.component';
import { EditPayrollComponent } from './Components/Payroll/Popups/edit-payroll.popup.component';
import { RolePermissionsComponent } from './Components/Permissions/RolePrmissions/role-permissions.component';
import { RoleService } from './Services/role.service';
import { UsersService } from './Services/users.service';
import { RolePermissionService } from './Services/rolePermission.service';
import { AuthorizationService } from './Services/authorization.service';
import { DisableIfUnauthorizedDirective } from './Shared/directives/disable-if-unauthorized.directive';
import { HideIfUnauthorizedDirective } from './Shared/directives/hide-if-unauthorized.directive';
import { AuditLogService } from './Services/audit_logs/audit-log.service';
import { ShowAttachmentPopupComponent } from './Shared/show-attachment-popup/show-attachment-popup.component';
import { MySettingComponent } from './Components/Settings/MySettings/my-settings.component';
import { LeaveBalanceComponent } from './Components/Manage/SubPages/Leaves/LeaveBalance/leave-balance.component';
import { TrainingGuidesComponent } from './Components/TrainingGuides/training-guides.component';
import { UserEditComponent } from './Components/User/userEdit/userEdit.component';
import { SelectCheckAllComponent } from './Elements/MultiSelect/multi-select.component';
import { ForgotPasswordComponent } from './Components/User/ForgotPassword/forgot-password.component';
import { SiteLayoutComponent } from './Components/_layout/site-layout/site-layout.component';
import { AppLayoutComponent } from './Components/_layout/app-layout/app-layout.component';
import { AppHeaderComponent } from './Components/_layout/app-header/app-header.component';
import { SiteHeaderComponent } from './Components/_layout/site-header/site-header.component';
import { SiteFooterComponent } from './Components/_layout/site-footer/site-footer.component';
import { NavbarComponent } from './Components/nav/nav.component';
import { NavTopBarComponent } from './Components/nav/topBar/navTopBar.component';
import { SharedCalendarComponent } from './Components/Calendar/shared-calendar.component';
import { ResetPasswordComponent } from './Components/User/ResetPassword/reset-password.component';
import { EventAddComponent } from './Components/Calendar/event-add/event-add.component';
import { SplashScreenComponent } from './Components/Dashboard/splash-screen/splash-screen.component';
import { SettingsService } from './Services/settings.service';
import { RoundPipe } from './Shared/pipe/round.pipe';
import { DatePipe } from '../../node_modules/@angular/common';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SubscriptionComponent } from './Components/User/Unsubscribed/unsubscribed.component';
import { SchoolFilesComponent } from './Components/SchoolFiles/school-files.component';
import { ShowSchoolFilesPopupComponent } from './Shared/show-school-files-popup/show-school-files-popup.component';
import { CreateAnnouncementComponent } from './Components/Announcement/create-announcement/create-announcement.component';
import { HideTabIfUnauthorizedDirective } from './Shared/directives/hide-tab-if-unauthorized.directive';
import { objectLengthPipe } from './Shared/pipe/objectLength.pipe';
import { PopupDialogForRunningLate } from './Components/Job/popus/runningLate.component';
import { ShowAnnouncementPopupComponent } from './Components/Announcement/show-announcement-popup/show-announcement-popup.component';
import { ImportSchoolsComponent } from './Components/Manage/SubPages/Schools/importSchools.component';
import { ReleasePopupComponent } from './Components/Job/popus/release-popup/release-popup.component';
import { DeclinePopupComponent } from './Components/Job/popus/decline-popup/decline-popup.component';
import { CancelPopupComponent } from './Components/Absence/popup/cancel-popup/cancel-popup.component';
import { ReportAnIssuePopupComponent } from './Components/Reports/popups/report-an-issue-popup/report-an-issue-popup.component';
import { ImportSubstitutesComponent } from './Components/Manage/SubPages/Substitutes/importSubstitutes.component';
import { ImportStaffComponent } from './Components/Manage/SubPages/Employees/importStaff.component';

export function getAuthServiceConfigs() {
    let config = new AuthServiceConfig(
        [
            {
                id: GoogleLoginProvider.PROVIDER_ID,
                provider: new GoogleLoginProvider("1089399494578-akukt8c08bjsj9eo4l0hgevmpiop35de.apps.googleusercontent.com")
            }
        ]
    );
    return config;
}

const customNotifierOptions: NotifierOptions = {
    position: {
        horizontal: {
            position: 'middle',
            distance: 12
        },
        vertical: {
            position: 'top',
            distance: 70,
            gap: 10
        }
    },
    theme: 'material',
    behaviour: {
        autoHide: 5000,
        onClick: 'hide',
        onMouseover: 'pauseAutoHide',
        showDismissButton: true,
        stacking: 4
    },
    animations: {
        enabled: true,
        show: {
            preset: 'slide',
            speed: 300,
            easing: 'ease'
        },
        hide: {
            preset: 'fade',
            speed: 300,
            easing: 'ease',
            offset: 50
        },
        shift: {
            speed: 300,
            easing: 'ease'
        },
        overlap: 150
    }
};

@NgModule({
    imports: [
        UiSwitchModule.forRoot({
            size: 'small',
            color: 'rgb(0,128,0)',
            switchColor: '#FFFFFF',
            defaultBgColor: '#FF0000',
            defaultBoColor: '#3ab7a9',
            checkedLabel: 'Yes',
            uncheckedLabel: 'No'
        }),
        NgxPrintModule,
        TagInputModule,
        NgxDatatableModule,
        ChartsModule,
        BrowserModule, ReactiveFormsModule, MatSidenavModule, CdkTableModule, HttpModule, routing, FormsModule,
        Ng2Bs3ModalModule, BrowserAnimationsModule, HttpClientModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatStepperModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        SocialLoginModule,
        MatTooltipModule,
        BlockUIModule.forRoot(),
        NotifierModule.withConfig(customNotifierOptions),
        NgSelectModule,
        SatDatepickerModule,
        SatNativeDateModule,
        NgxPaginationModule,
        DragDropModule
    ],
    declarations: [
        SiteLayoutComponent,
        AppLayoutComponent,
        AppHeaderComponent,
        SiteHeaderComponent,
        SiteFooterComponent,
        NavbarComponent,
        AppComponent,
        HomeComponent,
        LoginComponent,
        SideNavComponent,
        DistrictsComponent,
        ManageComponent,
        OrganizationsComponent,
        AddOrganizationComponent,
        AddDistrictComponent,
        EmployeesComponent,
        AddEmployeesComponent,
        SubstitutesComponent,
        SchoolSubListComponent,
        LeavesComponent,
        AddLeaveComponent,
        AddLeaveRequestComponent,
        ReportsComponent,
        DailyReportsComponent,
        MonthlyReportsComponent,
        ActivityReportsComponent,
        PastJobsComponent,
        MyJobsComponent,
        JobComponent,
        AvailableJobsComponent,
        TimeClockComponent,
        TimeTrackerComponent,
        PermissionsComponent,
        SettingComponent,
        SchoolsComponent,
        AddSchoolComponent,
        ProfileComponent,
        ContactUsComponent,
        absenceComponent,
        AddSubstituteComponent,
        CreateAbsenceComponent,
        PastAbsenceComponent,
        UpcommingAbsenceComponent,
        AbortedAbsenceComponent,
        PopupDialogForSubstituteDetail,
        PopupDialogForDistrictDetail,
        PopupDialogForSchoolDetail,
        PopupDialogForEmployeeDetail,
        PopupDialogForSearch,
        PopupDialogForSettings,
        PopupDialogForOrganizationDetail,
        PopupDialogForAbsenceDetail,
        PopupDialogForJobDetail,
        ReportFiltersComponent,
        ReportDetailsComponent,
        TimeFormatPipe,
        RoundPipe,
        SubstituteCalendarComponent,
        UnAvailabilityComponent,
        AllowanceComponent,
        RecurringComponent,
        PositionsComponent,
        SubstituteAvailabilityComponent,
        AllowanceComponent,
        PositionComponent,
        PayRateComponent,
        PayRateComponent,
        PayRollComponent,
        PopupForCancelAbsencesComponent,
        RunPayroll,
        EditTimeTracker,
        EditPayrollComponent,
        RolePermissionsComponent,
        DisableIfUnauthorizedDirective,
        HideIfUnauthorizedDirective,
        HideTabIfUnauthorizedDirective,
        AuditLogComponent,
        LeaveBalanceComponent,
        ShowAttachmentPopupComponent,
        MySettingComponent,
        UserEditComponent,
        SelectCheckAllComponent,
        TrainingGuidesComponent,
        ForgotPasswordComponent,
        SharedCalendarComponent,
        NavTopBarComponent,
        ResetPasswordComponent,
        EventAddComponent,
        SplashScreenComponent,
        SubscriptionComponent,
        SchoolFilesComponent,
        ShowSchoolFilesPopupComponent,
        PopupDialogForNotificationSettings,
        CreateAnnouncementComponent,
        objectLengthPipe,
        PopupDialogForRunningLate,
        ShowAnnouncementPopupComponent,
        ImportSchoolsComponent,
        ReleasePopupComponent,
        DeclinePopupComponent,
        CancelPopupComponent,
        ReportAnIssuePopupComponent,
        ImportSubstitutesComponent,
        ImportStaffComponent
    ],
    entryComponents: [
        PopupDialogForSubstituteDetail,
        PopupDialogForDistrictDetail,
        PopupDialogForSchoolDetail,
        PopupDialogForJobDetail,
        PopupDialogForEmployeeDetail,
        PopupDialogForSearch,
        PopupDialogForSettings,
        PopupDialogForOrganizationDetail,
        PopupDialogForAbsenceDetail,
        ReportDetailsComponent,
        UnAvailabilityComponent,
        AllowanceComponent,
        RecurringComponent,
        PositionComponent,
        PopupForCancelAbsencesComponent,
        EditTimeTracker,
        EditPayrollComponent,
        ShowAttachmentPopupComponent,
        UserEditComponent,
        EventAddComponent,
        SplashScreenComponent,
        ShowSchoolFilesPopupComponent,
        PopupDialogForNotificationSettings,
        PopupDialogForRunningLate,
        ShowAnnouncementPopupComponent,
        ReleasePopupComponent,
        DeclinePopupComponent,
        CancelPopupComponent,
        ReportAnIssuePopupComponent
    ],
    providers: [
        DatePipe,
        UserService,
        SideNavService,
        DistrictService,
        SchoolService,
        EmployeeService,
        AuthGuard,
        DataContext,
        UserSession,
        CommunicationService,
        ReportService,
        ErrorHandlerService,
        ProfileService,
        FileService,
        AbsenceService,
        ExcelService,
        TimeClockService,
        UsersService,
        RoleService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        { provide: MatDialogRef, useValue: {} },
        {
            //For Google Account
            provide: AuthServiceConfig,
            useFactory: getAuthServiceConfigs
        },
        LookupService,
        AvailabilityService,
        RolePermissionService,
        AuthorizationService,
        AuditLogService,
        SettingsService
    ],
    bootstrap: [AppComponent],

    // schemas: [ CUSTOM_ELEMENTS_SCHEMA ]schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {

}