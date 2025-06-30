namespace Models
{
    public class ScheduleManager
    {
        private List<Employee> _employees = new List<Employee>();
        private Dictionary<DayOfWeek, Dictionary<Shift, List<Employee>>> _weeklySchedule = new Dictionary<DayOfWeek, Dictionary<Shift, List<Employee>>>();
        private Random _random = new Random();

        public ScheduleManager(List<Employee> employees)
        {
            _employees = employees;
            InitializeWeeklySchedule();
        }

        private void InitializeWeeklySchedule()
        {
            foreach (DayOfWeek day in Enum.GetValues(typeof(DayOfWeek)))
            {
                _weeklySchedule[day] = new Dictionary<Shift, List<Employee>>();
                foreach (Shift shift in Enum.GetValues(typeof(Shift)))
                {
                    _weeklySchedule[day][shift] = new List<Employee>();
                }
            }
        }

        public void GenerateSchedule()
        {
            // Assign employees based on preferences first
            AssignByPreferences();

            // Fill in gaps to ensure minimum 2 employees per shift
            EnsureMinimumEmployeesPerShift();

            // Update employee schedules
            UpdateEmployeeSchedules();
        }

        private void AssignByPreferences()
        {
            // For each day and each employee, try to assign their preferred shifts
            foreach (DayOfWeek day in Enum.GetValues(typeof(DayOfWeek)))
            {
                foreach (var employee in _employees.Where(e => e.IsAvailableToWork() && !e.IsWorkingOn(day)))
                {
                    if (employee.ShiftPreferences.TryGetValue(day, out var preferences))
                    {
                        // Try to assign based on priority
                        foreach (var pref in preferences.OrderBy(p => p.Priority))
                        {
                            if (_weeklySchedule[day][pref.Shift].Count < 2) // We want more than 2 eventually
                            {
                                _weeklySchedule[day][pref.Shift].Add(employee);
                                break;
                            }
                        }
                    }
                }
            }
        }

        private void EnsureMinimumEmployeesPerShift()
        {
            foreach (DayOfWeek day in Enum.GetValues(typeof(DayOfWeek)))
            {
                foreach (Shift shift in Enum.GetValues(typeof(Shift)))
                {
                    while (_weeklySchedule[day][shift].Count < 2)
                    {
                        // Find employees who can work more days and aren't already working this day
                        var availableEmployees = _employees
                            .Where(e => e.IsAvailableToWork() && !e.IsWorkingOn(day))
                            .ToList();

                        if (!availableEmployees.Any())
                            break; // Cannot fulfill requirement

                        // Randomly select an employee
                        var selectedIndex = _random.Next(availableEmployees.Count);
                        var selectedEmployee = availableEmployees[selectedIndex];

                        _weeklySchedule[day][shift].Add(selectedEmployee);
                    }
                }
            }
        }

        private void UpdateEmployeeSchedules()
        {
            // Clear existing schedules
            foreach (var employee in _employees)
            {
                employee.Schedule.Clear();
            }

            // Assign schedules based on the weekly schedule
            foreach (var dayEntry in _weeklySchedule)
            {
                foreach (var shiftEntry in dayEntry.Value)
                {
                    foreach (var employee in shiftEntry.Value)
                    {
                        employee.Schedule.Add(new Schedule(dayEntry.Key, shiftEntry.Key));
                    }
                }
            }
        }

        public void PrintWeeklySchedule()
        {
            Console.WriteLine("\n===== WEEKLY SCHEDULE =====\n");

            foreach (DayOfWeek day in Enum.GetValues(typeof(DayOfWeek)))
            {
                Console.WriteLine($"=== {day} ===");

                foreach (Shift shift in Enum.GetValues(typeof(Shift)))
                {
                    Console.WriteLine($"- {shift} Shift:");

                    var employees = _weeklySchedule[day][shift];
                    if (employees.Any())
                    {
                        foreach (var emp in employees)
                        {
                            Console.WriteLine($"  * {emp.FirstName} {emp.LastName}");
                        }
                    }
                    else
                    {
                        Console.WriteLine("  * No employees assigned");
                    }
                }

                Console.WriteLine();
            }
        }
    }
}
