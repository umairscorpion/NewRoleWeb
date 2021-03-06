import { Component, OnInit, ViewChild } from '@angular/core';
import { DataContext } from '../../../../Services/dataContext.service';
import { SchoolSubList } from '../../../../Model/SchoolSubList';
import { MatSelectionList } from '@angular/material';
import { NotifierService } from 'angular-notifier';
import { UserSession } from 'src/app/Services/userSession.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SubstituteListCategory } from '../../../../Model/SubstituteListCategory';
import { SubstituteList } from '../../../../Model/SubstituteList';

@Component({
    selector: 'school-sub-list',
    templateUrl: 'schoolSubList.component.html',
    styleUrls: ['schoolSubList.component.scss']
})
export class SchoolSubListComponent implements OnInit {
    @ViewChild('subzz') selectionlist: MatSelectionList;
    @ViewChild('blockedsubzz') blockedselectionlist: MatSelectionList;
    showBlockedSubstitutes: boolean;
    showSubstitutes: boolean;
    private notifier: NotifierService;
    currentPage: number = 1;
    msg: string;
    Districts: any;
    subListForm: FormGroup;
    schoolSubList: SchoolSubList[] = Array<SchoolSubList>();
    selectedSchoolSubList: SchoolSubList[] = Array<SchoolSubList>();
    blockedSchoolSubList: SchoolSubList[] = Array<SchoolSubList>();
    selectedBlockedSchoolSubList: SchoolSubList[] = Array<SchoolSubList>();
    substituteListCategory: SubstituteListCategory[] = Array<SubstituteListCategory>();
    constructor(
        private dataContext: DataContext,
        notifier: NotifierService,
        private _userSession: UserSession,
        private fb: FormBuilder) {
        this.notifier = notifier;
    }

    ngOnInit(): void {
        this.subListForm = this.fb.group({
            SearchSub: [''],
            DistrictId: [''],
        });
        this.GetDistricts();
        this.getSustitutes();
        this.getBlockedSustitutes();
        this.getSubstituteCategoryAndList();
    }

    getSubstituteCategoryAndList() {
        this.dataContext.getById('user/getSubstituteCategoryList', this._userSession.getUserDistrictId()).
            subscribe((data: SubstituteListCategory[]) => {
                this.substituteListCategory = data;
            },
                error => this.msg = <any>error);
    }

    addnewList() {
        if (this.substituteListCategory.length >= 5) {
            this.notifier.notify('error', 'Limit Reached! You can add only five substitute lists');
            return;
        }
        let newCategory = new SubstituteListCategory();
        newCategory.categoryId = 0;
        newCategory.title = '';
        newCategory.districtId = this._userSession.getUserDistrictId();
        this.dataContext.get('user/getSubstituteListForNewList').
            subscribe((data: SubstituteList[]) => {
                newCategory.substituteList = data;
                this.substituteListCategory.push(newCategory);
                this.currentPage = this.substituteListCategory.length;
            },
                error => this.msg = <any>error);
    }

    saveSubstituteListByCategory(category: SubstituteListCategory) {
        this.dataContext.post('user/updateSubstituteList', category).
            subscribe((data: SubstituteListCategory[]) => {
                this.getSubstituteCategoryAndList();
                this.notifier.notify('success', 'Updated Successfully');
            },
                error => this.msg = <any>error);
    }

    addOrRemoveSubstituteInCurrentCategory(sub: any, categoryId: number) {
        this.substituteListCategory.filter(t => t.categoryId === categoryId)[0].
        substituteList.filter(us => us.userId == sub.userId)[0].isAdded =
            !this.substituteListCategory.filter(t => t.categoryId === categoryId)[0].
            substituteList.filter(us => us.userId == sub.userId)[0].isAdded;
    }

    removeSubstituteInCurrentCategory() {
        this.dataContext.getById('user/getSubstituteCategoryList', this._userSession.getUserDistrictId()).
            subscribe((data: SubstituteListCategory[]) => {
                this.substituteListCategory = data;
            },
                error => this.msg = <any>error);
    }

    onTabChanged(event: any) {
    }

    getSustitutes(): void {
        let model = {
            DistrictId: this._userSession.getUserDistrictId()
        }
        this.dataContext.post('user/schoolSubList', model).subscribe((data: any[]) => {
            this.schoolSubList = data;
            this.selectedSchoolSubList = data.filter(t => t.isAdded);
        },
            error => this.msg = <any>error);
    }

    getBlockedSustitutes(): void {
        let model = {
            DistrictId: this._userSession.getUserDistrictId()
        }
        this.dataContext.post('user/blockedSchoolSubList', model).subscribe((data: any[]) => {
            this.blockedSchoolSubList = data;
            this.selectedBlockedSchoolSubList = data.filter(t => t.isAdded);
        },
            error => this.msg = <any>error);
    }

    SearchSubstitute(districtId: any, query: string) {
        let model = {
            DistrictId: districtId.value ? districtId.value : this._userSession.getUserDistrictId()
        }
        this.dataContext.post('user/schoolSubList', model).subscribe((data: any[]) => {
            this.schoolSubList = data;
            this.selectedSchoolSubList = data.filter(t => t.isAdded);
            this.schoolSubList = this.schoolSubList.filter((val: SchoolSubList) => val.substituteName.toLowerCase().includes(query.toLowerCase()))
        },
            error => this.msg = <any>error);
    }

    SearchBlockedSubstitute(districtId: any, query: string) {
        let model = {
            DistrictId: districtId.value ? districtId.value : this._userSession.getUserDistrictId()
        }
        this.dataContext.post('user/blockedSchoolSubList', model).subscribe((data: any[]) => {
            this.blockedSchoolSubList = data;
            this.selectedBlockedSchoolSubList = data.filter(t => t.isAdded);
            this.blockedSchoolSubList = this.blockedSchoolSubList.filter((val: SchoolSubList) => val.substituteName.toLowerCase().includes(query.toLowerCase()))
        },
            error => this.msg = <any>error);
    }

    deleteSubstitute(index: number, substituteId: string) {
        this.selectedSchoolSubList.splice(index, 1);
        this.selectionlist.selectedOptions.selected.find(record => record.value.substituteId == substituteId).selected = false;
    }

    deleteBlockedSubstitute(index: number, substituteId: string) {
        this.selectedBlockedSchoolSubList.splice(index, 1);
        this.blockedselectionlist.selectedOptions.selected.find(record => record.value.substituteId == substituteId).selected = false;
    }

    selectionChangeSchoolSublist(schoolSubList: any, subtituteId: string) {
        // if (this.selectedBlockedSchoolSubList.find(record => record.substituteId == subtituteId)) {
        //     this.notifier.notify('error', 'Already added in blocked Substitute list');
        // }
        schoolSubList.options._results.forEach(element => {
            if (element.selected) {
                this.selectedSchoolSubList = this.selectedSchoolSubList.filter(t => t.substituteId !== element.value.substituteId);
                this.selectedBlockedSchoolSubList = this.selectedBlockedSchoolSubList.filter(t => t.substituteId !== element.value.substituteId);
                this.selectedSchoolSubList.push(element.value);
            }
            else {
                this.selectedSchoolSubList = this.selectedSchoolSubList.filter(t => t.substituteId !== element.value.substituteId);
            }
        });
    }

    selectionChangeBlockedSchoolSublist(blockedSchoolSubList: any, subtituteId: string) {
        // if (this.selectedSchoolSubList.find(record => record.substituteId == subtituteId)) {
        //     this.notifier.notify('error', 'Already added in School Substitute list');
        // }
        blockedSchoolSubList.options._results.forEach(element => {
            if (element.selected) {
                this.selectedBlockedSchoolSubList = this.selectedBlockedSchoolSubList.filter(t => t.substituteId !== element.value.substituteId);
                this.selectedSchoolSubList = this.selectedSchoolSubList.filter(t => t.substituteId !== element.value.substituteId);
                this.selectedBlockedSchoolSubList.push(element.value);
            }
            else {
                this.selectedBlockedSchoolSubList = this.selectedBlockedSchoolSubList.filter(t => t.substituteId !== element.value.substituteId);
            }
        });
    }

    updateSchoolSublist() {
        let model = {
            substituteId: JSON.stringify(this.selectedSchoolSubList)
        }
        this.dataContext.Patch('user/schoolSubList', model).subscribe((response: any) => {
            this.getSustitutes();
            this.notifier.notify('success', 'update Successfully');
        },
            error => this.msg = <any>error);
    }

    updateBlockedSchoolSublist() {
        let model = {
            substituteId: JSON.stringify(this.selectedBlockedSchoolSubList)
        }
        this.dataContext.Patch('user/blockedSchoolSubList', model).subscribe((response: any) => {
            this.getBlockedSustitutes();
            this.notifier.notify('success', 'update Successfully');
        },
            error => this.msg = <any>error);
    }

    GetDistricts(): void {
        this.dataContext.get('district/getDistricts').subscribe((data: any) => {
            this.Districts = data;
            if (this._userSession.getUserRoleId() == 1) {
                this.subListForm.get('DistrictId').setValue(this._userSession.getUserDistrictId());
                this.subListForm.controls['DistrictId'].disable();
            }
        },
            error => <any>error);
    }


}