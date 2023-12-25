import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IEmployee } from '../models/IEmployee';
import { IEmployeeViewData } from '../models/IEmployeeViewData';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiUrl =
    'https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ=='; // for production should enter environment files
  private _employeesItems = new BehaviorSubject<IEmployeeViewData[] | null>(
    null
  );
  employeesItems$ = this._employeesItems.asObservable();

  constructor(private http: HttpClient) {}

  // GET operation
  public getEmployees = (): Observable<IEmployeeViewData[] | null> => {
    this.http.get<IEmployee[]>(this.apiUrl).subscribe({
      next: (data: IEmployee[]) => {
        let employees: IEmployeeViewData[] = []

        data.forEach((employee) => {
          if (employee.DeletedOn === null) {
            let existingEmployee = employees.find(x => x.EmployeeName === employee.EmployeeName)
            let totalWorkedHoursThatDay = this.calculateTotalHours(employee)

            if(existingEmployee) {
                existingEmployee.TotalWorkedHours += totalWorkedHoursThatDay
            } else {
              let newEmployee: IEmployeeViewData = {
                Id: employee.Id, // use something
                EmployeeName: employee.EmployeeName,
                TotalWorkedHours: totalWorkedHoursThatDay
              }

              employees.push(newEmployee)
            }
          }
        })

        // Order employees based on total worked hours
        const sortedEmployees = employees.sort(
          (a, b) => b.TotalWorkedHours - a.TotalWorkedHours
        );

        this._employeesItems.next(sortedEmployees);
      },
      error: (error) => {
        console.log('Error happend when getting data: ' + error);
      },
    });

    return this.employeesItems$;
  };

  public calculateTotalHours = (employee: IEmployee) => {
    let startTime = new Date(employee.StarTimeUtc);
    let endTime = new Date(employee.EndTimeUtc);
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  }
}
