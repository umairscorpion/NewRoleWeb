import { Component, OnInit, ViewChild, ChangeDetectorRef, HostBinding } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { MonthlyReportsComponent } from './SubPages/MonthlyReports/monthyReports.component';
import { DailyReportsComponent } from './SubPages/DailyReports/dailyReports.component';
import { CommunicationService } from '../../Services/communication.service';

@Component({
    templateUrl: 'reports.component.html',
    styleUrls: ['reports.component.css']
})
export class ReportsComponent implements OnInit {
    @ViewChild(MonthlyReportsComponent) private monthlyComponent: MonthlyReportsComponent;
    @ViewChild(DailyReportsComponent) private dailyComponent: DailyReportsComponent;
    sideNavMenu: any;
    msg: string;
    @HostBinding('class.is-open')
    mobileQuery: MediaQueryList;
    selectedTab: any;
    private _mobileQueryListener: () => void;

    constructor(
        private router: Router,
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        private route: ActivatedRoute,
        private _communicationService: CommunicationService) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe((params: any) => {
            if (params['Tab']) {
                this.selectedTab = params.Tab;
            }
        });
        this.LoadSideNavMenu();
    }

    LoadSideNavMenu(): void {
        const config = {
            resourceTypeId: 2,
            parentResourceTypeId: -1,
            isAdminPanel: 0
        }
        this._communicationService.UpdatePanel(config);
    }

    onChangeTab(tab: any) {
        this.selectedTab = tab.index;
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }
}