import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort, MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { DataContext } from '../../../../Services/dataContext.service';
import { NotifierService } from 'angular-notifier';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { UserSession } from '../../../../Services/userSession.service';

@Component({
  templateUrl: 'importSchools.component.html',
  styleUrls: ['importSchools.component.scss']
})
export class ImportSchoolsComponent implements OnInit {
  @ViewChild('fileInput') fileInput;  
  private notifier: NotifierService;
  displayedColumns = ['Index', 'SchoolName', 'SchoolAddress', 'Country', 'State', 'City',
   'ZipCode', 'District', 'StartTime', 'FirstHalf', 'SecondHalf','EndTime','Phone','Status' ];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  msg: string;
  Districts: any;
  UserRole: number = this._userSession.getUserRoleId();
  DistrictId: any = 0;
  
  constructor(
    private router: Router,
    private _dataContext: DataContext,
    public dialog: MatDialog,
    notifier: NotifierService,
    private _userSession: UserSession,) {
    this.notifier = notifier;
  }

  ngOnInit(): void {
    this.GetDistricts();
    this.DeleteSchools();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  GetDistricts(): void{
    this._dataContext.get('district/getDistricts').subscribe((data: any) => {
      this.Districts = data;
  },
      error => <any>error);
  }
  onChangeDistrict(districtId: any) {
      this.DistrictId = districtId;
  }

  GetSchools(): void {
    this._dataContext.get('school/getTemporarySchools').subscribe((data: any) => {
      this.dataSource.data = data;
    },
      error => this.msg = <any>error);
  }

  DeleteSchools(): void {
    this._dataContext.get('school/deleteTemporarySchools').subscribe((data: any) => {
    },
      error => this.msg = <any>error);
  }

  VerifyData() {  
    if (this.DistrictId == 0) {
      this.DistrictId = this._userSession.UserClaim.districtId;
      if (this.DistrictId == 0) {
        this.notifier.notify('error', 'Please Select District First.');
        return;
      }
    } 
    if(this.fileInput.nativeElement.files[0] == null){
      this.notifier.notify('error', 'Please Select File First.');
      return;
    }
    let formData = new FormData();  
    formData.append('upload', this.fileInput.nativeElement.files[0]);
    this._dataContext.VerifySchoolsData(formData, this.DistrictId).subscribe(result => {  
      if(result == 'Imported'){
        this.notifier.notify('success', 'Data Uploaded Successfully. Please Verify Your Data');
        this.GetSchools();
      }
      else if(result == 'Empty'){
        this.notifier.notify('error', 'File is Empty.');
      }
      else if(result == 'NotSupported'){
        this.notifier.notify('error', 'We are Sorry, This file format is not supported. Only Excel files are allowed.');
      }
      else{
        this.notifier.notify('error', 'We are Sorry, Something Went Wrong.');
      }
    });   
  
  }  
  uploadFile() {  
    if (this.DistrictId == 0) {
      this.DistrictId = this._userSession.UserClaim.districtId;
      if (this.DistrictId == 0) {
        this.notifier.notify('error', 'Please Select District First.');
        return;
      }
    } 
    if(this.fileInput.nativeElement.files[0] == null){
      this.notifier.notify('error', 'Please Select File First.');
      return;
    }
    let formData = new FormData();  
    formData.append('upload', this.fileInput.nativeElement.files[0]);
    this._dataContext.ImportSchools(formData, this.DistrictId).subscribe((result: any) => {  
      if(result == 'Imported'){
        this.notifier.notify('success', 'Schools Imported Successfully.');
        this.GetSchools();
      }
      else if(result == 'Empty'){
        this.notifier.notify('error', 'File is Empty.');
      }
      else if(result == 'NotSupported'){
        this.notifier.notify('error', 'We are Sorry, This file format is not supported. Only Excel files are allowed.');
      }
      else{
        this.notifier.notify('error', result);
      }
    });   
  
  }  

  
}
