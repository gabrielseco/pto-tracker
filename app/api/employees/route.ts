import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { Employee } from '@/lib/types';

const EMPLOYEES_KEY = 'employees';

export async function GET() {
  try {
    const employees = await redis.get<Employee[]>(EMPLOYEES_KEY) || [];
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, totalPTODays, takenDays, year } = body;

    if (!name || totalPTODays === undefined || takenDays === undefined || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const employees = await redis.get<Employee[]>(EMPLOYEES_KEY) || [];
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name,
      totalPTODays,
      takenDays,
      year,
    };

    employees.push(newEmployee);
    await redis.set(EMPLOYEES_KEY, employees);

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, totalPTODays, takenDays, year } = body;

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const employees = await redis.get<Employee[]>(EMPLOYEES_KEY) || [];
    const index = employees.findIndex(emp => emp.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    employees[index] = {
      ...employees[index],
      ...(name && { name }),
      ...(totalPTODays !== undefined && { totalPTODays }),
      ...(takenDays !== undefined && { takenDays }),
      ...(year && { year }),
    };

    await redis.set(EMPLOYEES_KEY, employees);

    return NextResponse.json(employees[index]);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}
