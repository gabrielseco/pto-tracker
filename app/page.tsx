"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  useEmployees,
  useAddEmployee,
  useUpdateEmployee,
  usePTORequests,
  useAddPTORequest,
  useUpdatePTORequest,
  useDeletePTORequest,
  useHolidays,
  useAddHoliday,
  useDeleteHoliday,
  useStats,
} from "@/lib/hooks";
import type { Employee, PTORequest } from "@/lib/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "employees" | "pto" | "holidays"
  >("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">PTO Tracker</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <nav className="flex space-x-4">
            {["dashboard", "employees", "pto", "holidays"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "employees" && <EmployeesTab />}
        {activeTab === "pto" && <PTOTab />}
        {activeTab === "holidays" && <HolidaysTab />}
      </main>
    </div>
  );
}

function DashboardTab() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Employee Overview</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats?.map((stat) => (
          <div
            key={stat.employee.id}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {stat.employee.name}
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total PTO Days:</span>
                <span className="font-semibold text-gray-900">
                  {stat.employee.totalPTODays}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Regular PTO Taken:</span>
                <span className="font-semibold text-red-600">
                  {stat.employee.takenDays}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Public Holidays Taken:</span>
                <span className="font-semibold text-blue-600">
                  {stat.publicHolidayDays}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining PTO Days:</span>
                <span className="font-semibold text-green-600">
                  {stat.remainingDays}
                </span>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  PTO Requests: {stat.requests.length}
                </p>
              </div>

              {stat.workingOnHolidays.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Working on Holidays:
                  </p>
                  <div className="space-y-1">
                    {stat.workingOnHolidays.map((holiday, idx) => (
                      <div key={idx} className="text-sm text-orange-600">
                        {holiday.holidayName} -{" "}
                        {format(new Date(holiday.date), "MMM dd, yyyy")}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeesTab() {
  const { data: employees } = useEmployees();
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();

  const [formData, setFormData] = useState({
    name: "",
    totalPTODays: "",
    takenDays: "",
    year: new Date().getFullYear().toString(),
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateEmployee.mutateAsync({
        id: editingId,
        name: formData.name,
        totalPTODays: Number(formData.totalPTODays),
        takenDays: Number(formData.takenDays),
        year: Number(formData.year),
      });
      setEditingId(null);
    } else {
      await addEmployee.mutateAsync({
        name: formData.name,
        totalPTODays: Number(formData.totalPTODays),
        takenDays: Number(formData.takenDays),
        year: Number(formData.year),
      });
    }

    setFormData({
      name: "",
      totalPTODays: "",
      takenDays: "",
      year: new Date().getFullYear().toString(),
    });
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name,
      totalPTODays: employee.totalPTODays.toString(),
      takenDays: employee.takenDays.toString(),
      year: employee.year.toString(),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Manage Employees</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editingId ? "Edit Employee" : "Add New Employee"}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total PTO Days
            </label>
            <input
              type="number"
              placeholder="Total PTO Days"
              value={formData.totalPTODays}
              onChange={(e) =>
                setFormData({ ...formData, totalPTODays: e.target.value })
              }
              required
              step="0.5"
              min="0"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taken Days
            </label>
            <input
              type="number"
              placeholder="Taken Days"
              value={formData.takenDays}
              onChange={(e) =>
                setFormData({ ...formData, takenDays: e.target.value })
              }
              required
              step="0.5"
              min="0"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              placeholder="Year"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: "",
                    totalPTODays: "",
                    takenDays: "",
                    year: new Date().getFullYear().toString(),
                  });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total PTO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Taken
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Remaining
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees?.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {employee.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {employee.totalPTODays}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600">
                  {employee.takenDays}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600">
                  {employee.totalPTODays - employee.takenDays}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {employee.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PTOTab() {
  const { data: employees } = useEmployees();
  const { data: ptoRequests } = usePTORequests();
  const addPTORequest = useAddPTORequest();
  const updatePTORequest = useUpdatePTORequest();
  const deletePTORequest = useDeletePTORequest();

  const [formData, setFormData] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
    totalDays: "",
    year: new Date().getFullYear().toString(),
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const employee = employees?.find((emp) => emp.id === formData.employeeId);
    if (!employee) return;

    if (editingId) {
      await updatePTORequest.mutateAsync({
        id: editingId,
        employeeId: formData.employeeId,
        employeeName: employee.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: Number(formData.totalDays),
        year: Number(formData.year),
        createdAt: "", // This will be preserved by the API
      });
      setEditingId(null);
    } else {
      await addPTORequest.mutateAsync({
        employeeId: formData.employeeId,
        employeeName: employee.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: Number(formData.totalDays),
        year: Number(formData.year),
      });
    }

    setFormData({
      employeeId: "",
      startDate: "",
      endDate: "",
      totalDays: "",
      year: new Date().getFullYear().toString(),
    });
  };

  const handleEdit = (request: PTORequest) => {
    setEditingId(request.id);
    // Extract date portion (YYYY-MM-DD) from ISO string or use as-is
    const startDate = request.startDate.split("T")[0];
    const endDate = request.endDate.split("T")[0];
    // Fallback to extracting year from start date if year field doesn't exist
    const year = request.year
      ? request.year.toString()
      : startDate.split("-")[0];

    setFormData({
      employeeId: request.employeeId,
      startDate: startDate,
      endDate: endDate,
      totalDays: request.totalDays.toString(),
      year: year,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">PTO Requests</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editingId ? "Edit PTO Request" : "Add PTO Request"}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            >
              <option value="">Select Employee</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days
            </label>
            <input
              type="number"
              placeholder="Days"
              value={formData.totalDays}
              onChange={(e) =>
                setFormData({ ...formData, totalDays: e.target.value })
              }
              required
              step="0.5"
              min="0.5"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              placeholder="Year"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              required
              min="2020"
              max="2099"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingId ? "Update" : "Add Request"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    employeeId: "",
                    startDate: "",
                    endDate: "",
                    totalDays: "",
                    year: new Date().getFullYear().toString(),
                  });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ptoRequests?.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {request.employeeName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {format(new Date(request.startDate), "MMM dd, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {format(new Date(request.endDate), "MMM dd, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {request.totalDays}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {request.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(request)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePTORequest.mutate(request.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HolidaysTab() {
  const { data: holidays } = useHolidays();
  const addHoliday = useAddHoliday();
  const deleteHoliday = useDeleteHoliday();

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    year: new Date().getFullYear().toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await addHoliday.mutateAsync({
      name: formData.name,
      date: formData.date,
      year: Number(formData.year),
    });

    setFormData({
      name: "",
      date: "",
      year: new Date().getFullYear().toString(),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Public Holidays</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Add Public Holiday
        </h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Holiday Name
            </label>
            <input
              type="text"
              placeholder="Holiday Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              placeholder="Year"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Holiday
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holidays?.map((holiday) => (
              <tr key={holiday.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {holiday.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {format(new Date(holiday.date), "MMM dd, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {holiday.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => deleteHoliday.mutate(holiday.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
