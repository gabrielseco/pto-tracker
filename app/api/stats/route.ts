import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import {
  Employee,
  PTORequest,
  PublicHoliday,
  EmployeeStats,
} from "@/lib/types";
import { parseISO, isWithinInterval } from "date-fns";

const EMPLOYEES_KEY = "employees";
const PTO_REQUESTS_KEY = "pto-requests";
const HOLIDAYS_KEY = "public-holidays";

export async function GET() {
  try {
    const [employees, ptoRequests, holidays] = await Promise.all([
      redis.get<Employee[]>(EMPLOYEES_KEY),
      redis.get<PTORequest[]>(PTO_REQUESTS_KEY),
      redis.get<PublicHoliday[]>(HOLIDAYS_KEY),
    ]);

    const stats: EmployeeStats[] = (employees ?? []).map((employee) => {
      // Filter requests for this employee that match the employee's year
      const employeeRequests = (ptoRequests ?? []).filter((req) => {
        if (req.employeeId !== employee.id) return false;

        // Match based on the PTO request's year field
        return req.year === employee.year;
      });

      // Separate PTO days into regular days and public holidays
      let regularPTODays = 0;
      let publicHolidayDays = 0;

      employeeRequests.forEach((req) => {
        const start = parseISO(req.startDate);
        const end = parseISO(req.endDate);

        // Check if this PTO request overlaps with any public holidays
        const overlappingHolidays = (holidays ?? []).filter((holiday) => {
          if (holiday.year !== employee.year) return false;
          const holidayDate = parseISO(holiday.date);
          return isWithinInterval(holidayDate, { start, end });
        });

        // If there are overlapping holidays, count them separately
        if (overlappingHolidays.length > 0) {
          publicHolidayDays += req.totalDays;
        } else {
          regularPTODays += req.totalDays;
        }
      });

      const calculatedTakenDays = regularPTODays;

      const workingOnHolidays = (holidays ?? [])
        .filter((holiday) => {
          // Only check holidays for the employee's year
          if (holiday.year !== employee.year) return false;

          const holidayDate = parseISO(holiday.date);
          return !employeeRequests.some((req) => {
            const start = parseISO(req.startDate);
            const end = parseISO(req.endDate);
            return isWithinInterval(holidayDate, { start, end });
          });
        })
        .map((holiday) => ({
          date: holiday.date,
          holidayName: holiday.name,
        }));

      return {
        employee: {
          ...employee,
          takenDays: calculatedTakenDays, // Only regular PTO days
        },
        requests: employeeRequests,
        remainingDays: employee.totalPTODays - calculatedTakenDays,
        publicHolidayDays: publicHolidayDays,
        workingOnHolidays,
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
