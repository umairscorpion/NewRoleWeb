import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Entity } from '../Model/entity';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler/error-handler.service';
import { RestService } from './restService';
import { UserAvailability } from '../Model/userAvailability';

@Injectable()
export class AvailabilityService extends RestService<UserAvailability> {

  constructor(
    protected httpClient: HttpClient,
    protected errorHandler: ErrorHandlerService) {
    super(httpClient);
  }

  getInstance(): Entity {
    return new UserAvailability();
  }

  getAll(model: any) {
    return this.httpClient
      .post<UserAvailability[]>(environment.apiUrl + 'availability/events', model)
      .pipe(catchError(this.errorHandler.handleError),
        map((response: UserAvailability[]) => {
          return response.map(item => this.getInstance().deserialize(item));
        })
      );
  }

  create(forDates: any, model: any): any {
    model.startDate = forDates.startDate;
    model.endDate = forDates.endDate;
    model.endsOnUntilDate = forDates.endsOnUntilDate;
    model.endDateAfterNumberOfOccurrances = forDates.endDateAfterNumberOfOccurrances;
    return this.httpClient.post(`${environment.apiUrl}availability`, model);
  }

  update(id: number, forDates: any, model: any): any {
    model.startDate = forDates.startDate;
    model.endDate = forDates.endDate;
    model.endsOnUntilDate = forDates.endsOnUntilDate;
    model.endDateAfterNumberOfOccurrances = forDates.endDateAfterNumberOfOccurrances;
    return this.httpClient.put(`${environment.apiUrl}availability/${id}`, model);
  }

  createEvent(model: any): any {
    return this.httpClient.post(`${environment.apiUrl}event`, model);
  }

  CheckSubstituteAvailability(model: any): any {
    return this.httpClient.post(`${environment.apiUrl}availability/checkSubstituteAvailability`, model);
  }
}
