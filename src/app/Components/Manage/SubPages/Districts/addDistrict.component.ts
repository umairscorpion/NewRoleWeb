import { Component, OnInit } from '@angular/core';
import { DistrictService } from '../../../../Service/Manage/district.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ICountry } from '../../../../Model/Lookups/country';
import { IStates } from '../../../../Model/Lookups/states';
import { HttpErrorResponse } from '@angular/common/http';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs/Observable';
import { DataContext } from '../../../../Services/dataContext.service';

@Component({
    templateUrl: 'addDistrict.component.html',
    styleUrls: ['district.component.scss']
})
export class AddDistrictComponent implements OnInit {
    private notifier: NotifierService;
    countries: ICountry[];
    states: Observable<IStates[]>;
    timezones: any;
    msg: string;
    districtForm: FormGroup;
    districtIdForUpdate: any = 0;
    getDistrictById: any;
    countryCode: string;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private _districtService: DistrictService,
        private _dataContext: DataContext,
        notifier: NotifierService) {
        this.notifier = notifier;
    }

    ngOnInit(): void {
        this.districtForm = this.fb.group({
            Name: ['', Validators.required],
            City: ['', Validators.required],
            Address: ['', Validators.required],
            ZipCode: ['', [Validators.required, Validators.pattern(/^-?(0|[0-9]\d*)?$/)]],
            Country: [[], Validators.required],
            State: ['', Validators.required],
            StartTime: ['', Validators.required],
            firstHalfEndTime: ['', Validators.required],
            SecondHaifStartTime: ['', Validators.required],
            EndTime: ['', Validators.required],
            TimeZone: [''],
            PhoneNo: ['', [Validators.required, Validators.pattern(/^-?(0|[0-9]\d*)?$/)]],
            IsActive: [1]
        });
        this.GetCountries();
        this.GetTimeZone();
    }

    ngAfterViewInit() {
        this.route.queryParams.subscribe((params: any) => {
            if (params['Id']) {
                let DistrictId = params.Id;
                this._dataContext.getById('district/getDistrictById', DistrictId).subscribe((data: any) => {
                    this.getDistrictById = data;
                    let DistrictModel = {
                        Name: data[0].districtName,
                        City: data[0].city,
                        Address: data[0].districtAddress,
                        ZipCode: data[0].districtZipCode,
                        Country: data[0].countryId,
                        State: data[0].districtStateId,
                        StartTime: data[0].districtStartTime,
                        firstHalfEndTime: data[0].district1stHalfEnd,
                        SecondHaifStartTime: data[0].district2ndHalfStart,
                        EndTime: data[0].districtEndTime,
                        TimeZone: data[0].districtTimeZone,
                        PhoneNo: this.getPhoneNumber(data[0].districtPhone, data[0].counrtyCode),
                        IsActive: data[0].isActive
                    }
                    this.districtForm.setValue(DistrictModel);
                    this.states = this._districtService.getStatesByCountryId('districtLookup/getStateByCountryId', data[0].countryId);
                    this.districtForm.get('State').setValue(data[0].districtStateId);
                    this.districtIdForUpdate = DistrictId;
                    this.countryCode = data[0].counrtyCode;
                },
                    error => <any>error);
            }
        });
    }

    getPhoneNumber(phoneNumber: string, counrtyCode: string): string {
        phoneNumber = phoneNumber.includes(counrtyCode) ? phoneNumber.split(counrtyCode)[1] : phoneNumber;
        return phoneNumber;
    }

    GetCountries(): void {
        this._districtService.getCountries('districtLookup/getCountries').subscribe((data: any) => {
            this.countries = data;
        },
            error => <any>error);
    }

    GetTimeZone(): void {
        this._districtService.getCountries('districtLookup/getTimeZone').subscribe((data: any) => {
            this.timezones = data;
        },
            error => <any>error);
    }

    onChange(countryId: any) {
        this.states = this._districtService.getStatesByCountryId('districtLookup/getStateByCountryId', countryId);
    }

    setCountryCode(countryCode: any) {
        this.countryCode = countryCode;
    }

    onSubmit(form: any) {
        if (this.districtForm.valid) {
            if (this.CheckTime(form.value)) {
                let model = {
                    DistrictId: this.districtIdForUpdate,
                    DistrictName: form.value.Name,
                    City: form.value.City,
                    DistrictAddress: form.value.Address,
                    DistrictZipCode: form.value.ZipCode,
                    CountryId: form.value.Country,
                    DistrictStateId: form.value.State,
                    DistrictStartTime: form.value.StartTime,
                    District1stHalfEnd: form.value.firstHalfEndTime,
                    District2ndHalfStart: form.value.SecondHaifStartTime,
                    DistrictEndTime: form.value.EndTime,
                    DistrictTimeZone: form.value.TimeZone,
                    DistrictPhone: this.countryCode + form.value.PhoneNo,
                    IsActive: form.value.IsActive
                }
                if (this.districtIdForUpdate > 0) {
                    this._dataContext.Patch('district/updateDistrict', model).subscribe((data: any) => {
                        this.router.navigate(['/manage/districts']);
                        this.notifier.notify('success', 'Updated Successfully.');
                    },
                        (err: HttpErrorResponse) => {
                            this.notifier.notify('error', err.error.error_description);
                        });
                }
                else {
                    this._districtService.post('District/insertDistrict', model).subscribe((data: any) => {
                        this.router.navigate(['/manage/districts']);
                        this.notifier.notify('success', 'Saved Successfully.');
                    },
                        (err: HttpErrorResponse) => {
                            this.notifier.notify('error', err.error);
                        });
                }
            }
        }
    }

    CheckTime(district: any): boolean {
        if (district.StartTime > district.EndTime) {
            this.districtForm.get('StartTime').setValue(null);
            this.districtForm.get('EndTime').setValue(null);
        }
        if (district.firstHalfEndTime > district.SecondHaifStartTime) {
            this.districtForm.get('firstHalfEndTime').setValue(null);
            this.districtForm.get('SecondHaifStartTime').setValue(null);
        }
        if (district.StartTime > district.SecondHaifStartTime) {
            this.districtForm.get('StartTime').setValue(null);
            this.districtForm.get('SecondHaifStartTime').setValue(null);
        }
        if (district.StartTime > district.firstHalfEndTime) {
            this.districtForm.get('StartTime').setValue(null);
            this.districtForm.get('firstHalfEndTime').setValue(null);
        }
        if (district.EndTime < district.StartTime) {
            this.districtForm.get('EndTime').setValue(null);
            this.districtForm.get('StartTime').setValue(null);
        }
        if (district.EndTime < district.SecondHaifStartTime) {
            this.districtForm.get('EndTime').setValue(null);
        }
        if (district.EndTime < district.firstHalfEndTime) {
            this.districtForm.get('EndTime').setValue(null);
        }
        if (district.StartTime > district.EndTime || district.firstHalfEndTime > district.SecondHaifStartTime ||
            district.StartTime > district.SecondHaifStartTime || district.StartTime > district.firstHalfEndTime ||
            district.EndTime < district.StartTime || district.EndTime < district.SecondHaifStartTime ||
            district.EndTime < district.firstHalfEndTime) {
            this.notifier.notify('error', 'Please enter valid time.');
            return false;
        }
        return true;
    }
}