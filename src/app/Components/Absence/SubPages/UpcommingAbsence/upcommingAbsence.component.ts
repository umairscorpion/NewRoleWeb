import { Component, ViewChild, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DataContext } from '../../../../Services/dataContext.service';
import { CommunicationService } from '../../../../Services/communication.service';
import { UserSession } from '../../../../Services/userSession.service';
import { NotifierService } from 'angular-notifier';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { AuditFilter } from 'src/app/Model/auditLog';
import { AuditLogService } from 'src/app/Services/audit_logs/audit-log.service';
@Component({
    selector: 'upcoming-absences',
    templateUrl: 'upcommingAbsence.component.html'
})
export class UpcommingAbsenceComponent implements OnInit {
    CurrentDate: Date = new Date;
    private notifier: NotifierService;
    UpcommingAbsences = new MatTableDataSource();
    msg: string;
    currentDate: Date = new Date();
    displayedColumns = ['AbsenceDate', 'Posted', 'Location', 'Status', 'Substitute', 'Action'];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    FileStream: any;
    insertAbsencesLogView: any;

    constructor(private _dataContext: DataContext, private _userSession: UserSession,
        notifier: NotifierService, private _communicationService: CommunicationService,
        private auditLogService: AuditLogService) {
        this.notifier = notifier;
    }
    ngOnInit(): void {
        this.GetAbsences();
    }

    ngAfterViewInit() {
        this.UpcommingAbsences.sort = this.sort;
        this.UpcommingAbsences.paginator = this.paginator;
    }

    GetAbsences(): void {
        let StartDate = this.CurrentDate.toISOString();
        let EndDate = new Date();
        EndDate.setDate(this.currentDate.getDate() + 30);
        let UserId = this._userSession.getUserId();
        this._dataContext.get('Absence/getAbsences' + "/" + StartDate + "/" + EndDate.toISOString() + "/" + UserId).subscribe((data: any) => {
            this.UpcommingAbsences.data = data;
        },
            error => this.msg = <any>error);
    }

    ShowDetail(AbsenceDetail: any) {
        this._communicationService.ViewAbsenceDetail(AbsenceDetail);
        const model = new AuditFilter();
        model.entityId = AbsenceDetail.absenceId;
        this.auditLogService.insertAbsencesLogView(model).subscribe((result: any) => {
            this.insertAbsencesLogView = result;
        });
    }

    UpdateStatus(SelectedRow: any, StatusId: number) {
        let confirmResult = confirm('Are you sure you want to cancel this absence?');
        if (confirmResult) {
            this._dataContext.UpdateAbsenceStatus('Absence/updateAbseceStatus', SelectedRow.absenceId, StatusId, this.currentDate.toISOString(), this._userSession.getUserId()).subscribe((response: any) => {
                if (response == "success") {
                    this.notifier.notify('success', 'Cancelled Successfully.');
                    this.GetAbsences();
                }
            },
                error => this.msg = <any>error);
        }
    }
}