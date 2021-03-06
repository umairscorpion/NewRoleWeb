import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Entity } from '../Model/entity';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler/error-handler.service';
import { Observable } from 'rxjs';
import { RestService } from './restService';
import { User } from '../Model/user';
import { LeaveType } from '../Model/leaveType';
import { LeaveRequest } from '../Model/leaveRequest';
import { AbsenceSummary } from 'src/app/Model/absence.summary';
import { Absence } from '../Model/absence';
import { DashboardSummary } from '../Model/DashboardSummary';

@Injectable()
export class AbsenceService extends RestService<LeaveType> {
  constructor(
    protected httpClient: HttpClient,
    protected errorHandler: ErrorHandlerService
  ) {
    super(httpClient);
  }

  //For Dashboard Chart
  getSummaryInstance(): Entity {
    return new DashboardSummary();
  }

  getSummary() {
    return this.httpClient
      .get<DashboardSummary[]>(environment.apiUrl + "/absence/summary")
      .pipe(catchError(this.errorHandler.handleError),
        map((response: DashboardSummary[]) => {
          return response;
        })
      );
  }

  getTopTenTeachers() {
    
    return this.httpClient
      .get<AbsenceSummary[]>(environment.apiUrl + "/absence/getTopTenTeachers")
      .pipe(catchError(this.errorHandler.handleError),
        map((response: AbsenceSummary[]) => {
          return response.map(item => this.getSummaryInstance().deserialize(item));
        })
      );
  }

  // getReasonSummary() {
  //   return this.httpClient
  //     .get<AbsenceSummary[]>(environment.apiUrl + "/absence/reasonsummary")
  //     .pipe(catchError(this.errorHandler.handleError),
  //       map((response: AbsenceSummary[]) => {
  //         return response.map(item => this.getSummaryInstance().deserialize(item));
  //       })
  //     );
  // }

  getLeaveTypeRecords(): Entity {
    return new LeaveType();
  }

  getLeaveRequestRecords(): Entity {
    return new LeaveRequest();
  }

  insertLeaveType(leaveModel: any) {
    return this.httpClient
      .post<number>(`${environment.apiUrl}/Leave/insertLeaveType`, leaveModel);
  }

  getLeaveType(districtId: number, organizationId: string) {
    return this.httpClient
      .get<LeaveType[]>(environment.apiUrl + "Leave/getLeaveTypes" + '/' + districtId + '/' + organizationId)
      .pipe(catchError(this.errorHandler.handleError),
        map((response: LeaveType[]) => {
          return response.map(item => this.getLeaveTypeRecords().deserialize(item));
        })
      );
  }

  getLeaveRequests(districtId: number, organizationId: string) {
    return this.httpClient
      .get<LeaveRequest[]>(environment.apiUrl + "Leave/getLeaveRequests/" + '/' + districtId + '/' + organizationId)
      .pipe(catchError(this.errorHandler.handleError),
        map((response: LeaveRequest[]) => {
          return response.map(item => this.getLeaveRequestRecords().deserialize(item));
        })
      );
  }

  getsubs(url: string, model: any): Observable<User[]> {
    return this.httpClient.post<User[]>(environment.apiUrl + url, model);
  }

  CalendarView(url: string, model: any) {
    return this.httpClient
      .post<Absence[]>(environment.apiUrl + url, model)
      .pipe(catchError(this.errorHandler.handleError),
        map((response: Absence[]) => {
          return response.map(item => this.getLeaveTypeRecords().deserialize(item));
        })
      );
  }
}
