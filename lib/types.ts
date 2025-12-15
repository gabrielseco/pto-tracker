export interface Employee {
  id: string;
  name: string;
  totalPTODays: number;
  takenDays: number;
  year: number;
}

export interface PTORequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  year: number;
  createdAt: string;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string;
  year: number;
}

export interface EmployeeStats {
  employee: Employee;
  requests: PTORequest[];
  remainingDays: number;
  publicHolidayDays: number;
  workingOnHolidays: Array<{
    date: string;
    holidayName: string;
  }>;
}
