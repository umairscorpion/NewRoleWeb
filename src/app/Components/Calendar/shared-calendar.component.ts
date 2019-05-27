import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import * as $ from 'jquery';
import * as moment from 'moment';
import 'fullcalendar';
import 'fullcalendar-scheduler';
import { AvailabilityService } from '../../Services/availability.service';
import { MatDialog } from '@angular/material';
import { UserAvailability } from 'src/app/Model/userAvailability';
import { ReportFilter } from 'src/app/Model/Report/report.filter';
import { ReportDetail } from 'src/app/Model/Report/report.detail';
import { ReportService } from 'src/app/Services/report.service';
import { UserSession } from 'src/app/Services/userSession.service';
import { Router } from '@angular/router';
import { AbsenceService } from 'src/app/Services/absence.service';

@Component({
  selector: 'app-shared-calendar',
  templateUrl: 'shared-calendar.component.html'
})
export class SharedCalendarComponent implements OnInit {
  containerEl: JQuery;
  substituteAvailibiltySummary: any;
  doOpen = true;
  date: string = moment().format('dddd, MM/DD/YYYY');
  todayTotalAbsenceDetails: ReportDetail[] = Array<ReportDetail>();
  loginedUserRole = 0;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialog,
    private availabilityService: AvailabilityService,
    private absenceService: AbsenceService,
    private reportService: ReportService,
    private _userSession: UserSession,
    private router: Router,
  ) {

  }

  ngOnInit() {
    this.loginedUserRole = this._userSession.getUserRoleId();
    this.containerEl = $('#calendar');
    this.loadAbsences();
    this.getSubstituteAvailibiltySummary();
  }

  loadAbsences() {
    const currentDate: Date = new Date();
    const startDate = new Date();
    startDate.setMonth(currentDate.getMonth() - 6);
    const endDate = new Date();
    endDate.setMonth(currentDate.getMonth() + 6);
    const userId = this._userSession.getUserId();
    this.absenceService.CalendarView(startDate, endDate, userId).subscribe(
      (data: any) => {
        console.log({ absences: data });
        this.containerEl.fullCalendar({
          editable: false,
          eventDurationEditable: true,
          aspectRatio: 2,
          scrollTime: '00:00',
          selectable: true,
          slotDuration: '00:30:00',
          allDaySlot: false,
          header: {
            left: 'today',
            center: 'prev, title, next',
            right: 'agendaDay, month, basicWeek'
          },
          defaultView: 'month',
          events: data,
          eventRender: (event, element) => {
          },
          select: (start, end, jsEvent, view, resource) => {
            if (end.isBefore(moment().add(1, 'hour').format())) {
              $('#calendar').fullCalendar('unselect');
              alert('You can not set unavailability in past dates !');
              return false;
            }
            const availability = new UserAvailability();
            availability.startDate = moment(start).format('YYYY-MM-DD');
            availability.startTime = moment(start).format('hh:mm A');
            availability.endDate = moment(end).format('YYYY-MM-DD');
            availability.endTime = moment(end).format('hh:mm A');
            // const dialogRef = this.dialogRef.open(UnAvailabilityComponent,
            //   {
            //     panelClass: 'availability-edit-dialog',
            //     data: availability
            //   });

            // dialogRef.afterClosed().subscribe(result => {
            //   if (result) {
            //     const model = result.availability;
            //     console.log({ save: model });
            //     this.availabilityService.create(model).subscribe(t => {
            //       this.reloadCalendar();
            //       this.getSubstituteAvailibiltySummary();
            //     });
            //   }
            // });
          },
          eventDrop: event => {
          },
          eventResize: event => {
          },
          eventClick: event => {
            // if (this.doOpen) {
            //   this.dialogRef.openDialogs.pop();
            //   this.availabilityService
            //     .get(`availability/${event.id}`)
            //     .subscribe((availability: any) => {
            //       const dialogRef = this.dialogRef.open(
            //         UnAvailabilityComponent,
            //         {
            //           panelClass: 'availability-edit-dialog',
            //           data: availability
            //         }
            //       );
            //       this.doOpen = false;
            //       dialogRef.afterClosed().subscribe(result => {
            //         if (result) {
            //           console.log({ result });
            //           if (result.action === 'Submit') {
            //             this.availabilityService.put('availability/', result.id, result.availability).subscribe(t => {
            //               this.reloadCalendar();
            //               this.getSubstituteAvailibiltySummary();
            //             });
            //           } else if (result.action === 'Delete') {
            //             this.availabilityService.delete('availability/', result.id).subscribe(t => {
            //               this.reloadCalendar();
            //               this.getSubstituteAvailibiltySummary();
            //             });
            //           }
            //           this.doOpen = true;
            //         }
            //       });
            //     });
            // }
          }
        });
      },
      error => {
      }
    );
  }

  getSubstituteAvailibiltySummary() {
    const model = {
    };
    this.availabilityService.post('availability/substitutes/summary', model).subscribe((availabilities: any) => {
      this.substituteAvailibiltySummary = availabilities;
    });
    const filters = ReportFilter.initial();
    this.date = moment(filters.fromDate).format('dddd, MM/DD/YYYY');
    this.reportService.getDetail(filters).subscribe((details: ReportDetail[]) => {
      this.todayTotalAbsenceDetails = details;
    });
  }

  reloadCalendar() {
    this.availabilityService.getAll().subscribe((data: any) => {
      this.containerEl.fullCalendar('removeEvents');
      this.containerEl.fullCalendar('renderEvents', data, true);
    });
  }

  jumpToReport() {
    this.router.navigate(['/reports']);
  }
}