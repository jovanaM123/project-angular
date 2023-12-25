import { Component } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { IEmployeeViewData } from '../../models/IEmployeeViewData';
import { ChartOptions, ChartDataset } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  employees: IEmployeeViewData[] | null = [];
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
  };
  pieChartLabels: any[] = [];
  pieChartDatasets: any[] = []
  pieChartLegend = true;
  pieChartPlugins = [];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadData();
  }

  public loadData = () => {
    this.employeeService.getEmployees().subscribe((data) => {
      if (data) {
        this.employees = data
        // populate chart
        this.populateChart(data)
      }
    });
  };

  public populateChart = (data: IEmployeeViewData[]) => {
    const totalWorkedTime = data.map(
      (employee) => employee.TotalWorkedHours
    )

    // Calculate the total time worked by all employees
    const totalTime = totalWorkedTime.reduce((acc, time) => acc + time, 0);
    // Calculate the percentage of total time worked by each employee
    const percentageData = totalWorkedTime.map(
      (time) => (time / totalTime) * 100
    );

    this.pieChartDatasets = [{data: percentageData }]

    this.pieChartLabels = data.map(
      (employee) => employee.EmployeeName || 'Unknown'
    );
  }

  public isUnder100Hours = (totalTimeWorked: number): boolean =>
    totalTimeWorked < 100;
}
