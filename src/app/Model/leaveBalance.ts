export interface LeaveBalance {
    userId: string;
    userName: number;
    personal: string;
    sick: string;
    vacation: string;
    organizationId: string;
    districtId: number;
    year: number;
    leaveTypeId: number;
    balance: number;
    isAllowNegativeAllowance: boolean;
    balanceId: number;
    allowanceTitle: string;
    allowanceBalance: number;
    firstColumn: number;
    secondColumn: number;
    thirdColumn: number;
}