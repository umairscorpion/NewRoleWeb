import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort, MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { DataContext } from '../../../../Services/dataContext.service';
import { NotifierService } from 'angular-notifier';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { UserSession } from '../../../../Services/userSession.service';

@Component({
  templateUrl: 'schools.component.html',
  styleUrls: ['school.component.scss']
})
export class SchoolsComponent implements OnInit {
  private notifier: NotifierService;
  displayedColumns = ['SchoolName', 'SchoolAddress', 'ZipCode', 'DistrictName', 'action'];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  msg: string;
  Districts: any;
  UserRole: number = this._userSession.getUserRoleId();
  
  constructor(
    private router: Router,
    private _dataContext: DataContext,
    public dialog: MatDialog,
    notifier: NotifierService,
    private _userSession: UserSession,) {
    this.notifier = notifier;
  }

  ngOnInit(): void {
    this.GetSchools();
    this.GetDistricts();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  GetSchools(): void {
    this._dataContext.get('school/getSchools').subscribe((data: any) => {
      this.dataSource.data = data;
    },
      error => this.msg = <any>error);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  updateSchool(row: any) {
    row.isActive = !row.isActive;
    this._dataContext.Patch('school/updateSchool', row).subscribe((data: any) => {
    },
      error => this.msg = <any>error);
  }

  EditSchool(SelectedRow: any) {
    this.router.navigate(['/manage/schools/AddSchool'], { queryParams: { Id: SelectedRow.schoolId } });
  }

  ViewSchoolDetail(SelectedRow: any) {

    this._dataContext.getById('School/getSchoolById', SelectedRow.schoolId).subscribe((data: any) => {
      this.dialog.open(PopupDialogForSchoolDetail, {
        data,
        height: '500px',
        width: '650px',

      });
    },
      error => <any>error);
  }
  GetDistricts(): void{
    this._dataContext.get('district/getDistricts').subscribe((data: any) => {
      this.Districts = data;
  },
      error => <any>error);
  }
  onChangeDistrict(districtId: any) {
    this._dataContext.get('school/getSchools').subscribe((data: any) => {
      this.dataSource = data;
      this.dataSource = data.filter(t => t.schoolDistrictId == districtId);
  },
      error => this.msg = <any>error);
  }

  deleteSchool(SelectedRow: any) {
    swal.fire({
      title: 'Delete',
      text:
        'Are you sure, you want to delete the selected School?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-danger',
      cancelButtonClass: 'btn btn-success',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      buttonsStyling: false
    }).then(r => {
      if (r.value) {
        this._dataContext.delete('school/', SelectedRow.schoolId).subscribe((response: any) => {
          if(response == 0){
            this.notifier.notify('error', 'There is User against this school.');  
          }
          else{
          this.notifier.notify('success', 'Deleted Successfully.');
          this.GetSchools();
          }
        },
          error => this.msg = <any>error);
      }
    });
  }
}

@Component({
  templateUrl: 'viewSchool.html',
  styleUrls: ['school.component.scss']
})
export class PopupDialogForSchoolDetail {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SchoolsComponent>) { }

  onClose() {
    this.dialogRef.close();
  }
}