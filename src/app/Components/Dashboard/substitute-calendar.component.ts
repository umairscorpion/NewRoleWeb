﻿import { Component, OnInit } from '@angular/core';

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
import { UnAvailabilityComponent } from './unavailability/unavailability.component';
import { UserAvailability } from 'src/app/Model/userAvailability';
import { ReportFilter } from 'src/app/Model/Report/report.filter';
import { ReportDetail } from 'src/app/Model/Report/report.detail';
import { ReportService } from 'src/app/Services/report.service';
import { UserSession } from 'src/app/Services/userSession.service';

@Component({
  selector: 'app-substitute-calendar',
  templateUrl: 'substitute-calendar.html'
})
export class SubstituteCalendarComponent implements OnInit {
  containerEl: JQuery;
  substituteAvailibiltySummary: any;
  doOpen = true;
  date: string = moment().format('dddd, MM/DD/YYYY');
  todayTotalAbsenceDetails: ReportDetail[] = Array<ReportDetail>();
  loginedUserRole: number = 0;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialog,
    private availabilityService: AvailabilityService,
    private reportService: ReportService,
    private _userSession: UserSession
  ) {

  }

  ngOnInit() {
    this.loginedUserRole = this._userSession.getUserRoleId();
    this.containerEl = $('#calendar');
    this.loadUnavailability();
    this.getSubstituteAvailibiltySummary();
  }

  loadUnavailability() {
    this.availabilityService.getAll().subscribe(
      (data: any) => {
        console.log({ Availability: data });
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
            const dialogRef = this.dialogRef.open(UnAvailabilityComponent,
              {
                panelClass: 'availability-edit-dialog',
                data: availability
              });

            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                const model = result.availability;
                console.log({ save: model });
                this.availabilityService.create(model).subscribe(t => {
                  this.reloadCalendar();
                });
              }
            });
          },
          eventDrop: event => {
          },
          eventResize: event => {
          },
          eventClick: event => {
            if (this.doOpen) {
              this.dialogRef.openDialogs.pop();
              this.availabilityService
                .get(`availability/${event.id}`)
                .subscribe((availability: any) => {
                  const dialogRef = this.dialogRef.open(
                    UnAvailabilityComponent,
                    {
                      panelClass: 'availability-edit-dialog',
                      data: availability
                    }
                  );
                  this.doOpen = false;
                  dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                      console.log({ result });
                      if (result.action === 'Submit') {
                        this.availabilityService.put('availability/', result.id, result.availability).subscribe(t => {
                          this.reloadCalendar();
                        });
                      } else if (result.action === 'Delete') {
                        this.availabilityService.delete('availability/', result.id).subscribe(t => {
                          this.reloadCalendar();
                        });
                      }
                      this.doOpen = true;
                    }
                  });
                });
            }
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
}
